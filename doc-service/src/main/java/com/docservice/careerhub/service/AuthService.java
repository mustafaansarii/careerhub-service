package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.docservice.careerhub.dto.request.DeviceMetadata;
import com.docservice.careerhub.dto.request.SigninRequest;
import com.docservice.careerhub.dto.request.SignupRequest;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.entity.UserSession;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.AuthUserRepository;
import com.docservice.careerhub.repo.UserSessionRepository;
import com.docservice.careerhub.security.JwtService;
import com.docservice.careerhub.util.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class AuthService {

    private static final long OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;
    private static final String INVALID_CREDENTIALS = "Invalid email or password";

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AppProperties appProperties;

    public record LoginResult(AuthUser user, String accessToken) {
    }

    @Transactional
    public MessageResponse signup(SignupRequest request) {
        AuthUser user = authUserRepository.findByEmail(request.getEmail()).orElse(null);

        if (Objects.nonNull(user) && user.isVerified()) {
            throw ApiException.conflict("Email already registered");
        }
        if (Objects.isNull(user)) {
            user = new AuthUser();
            user.setEmail(request.getEmail());
        }

        String otp = OtpGenerator.sixDigit();
        prepareForSignup(user, request, otp);
        authUserRepository.save(user);
        mailService.sendOtp(request.getEmail(), otp);
        return MessageResponse.of("OTP sent to " + request.getEmail());
    }

    @Transactional
    public AuthUser register(SignupRequest request) {
        if (Objects.isNull(request.getOtp()) || request.getOtp().isBlank()) {
            throw ApiException.badData("OTP is required for registration");
        }
        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> ApiException.badData("No signup found for this email. Please sign up first."));
        if (user.isVerified()) {
            throw ApiException.conflict("Email already registered");
        }

        verifyOtp(user, request.getOtp());
        prepareForVerification(user, request.getFullName(), request.getPassword());
        return authUserRepository.save(user);
    }

    @Transactional
    public LoginResult login(SigninRequest request, DeviceMetadata device) {
        AuthUser user = authenticate(request);
        String tokenId = createSession(user.getEmail(), device);
        List<String> roleNames = user.getRoles().stream().map(Enum::name).toList();
        String token = jwtService.generate(user.getEmail(), tokenId, roleNames);
        return new LoginResult(user, token);
    }

    /**
     * Logs a user in via an OAuth provider (Google/GitHub). If no account exists for the email, one
     * is created on the spot (verified, no password, default role). Existing accounts are linked and
     * logged in regardless of how they were originally created. Then a normal session + JWT is issued.
     */
    @Transactional
    public LoginResult loginWithOAuth(String email, String fullName, String provider, DeviceMetadata device) {
        AuthUser user = authUserRepository.findByEmail(email).orElseGet(() -> new AuthUser());
        if (Objects.isNull(user.getId())) {
            user.setEmail(email);
            user.setFullName(Objects.requireNonNullElse(fullName, email));
        }
        user.setVerified(true);          // provider has verified the email
        user.setProvider(provider);
        AuthUser saved = authUserRepository.save(user);

        String tokenId = createSession(saved.getEmail(), device);
        List<String> roleNames = saved.getRoles().stream().map(Enum::name).toList();
        String token = jwtService.generate(saved.getEmail(), tokenId, roleNames);
        return new LoginResult(saved, token);
    }

    @Transactional
    public void revokeSession(String tokenId) {
        if (Objects.nonNull(tokenId)) {
            userSessionRepository.deleteByTokenId(tokenId);
        }
    }

    /**
     * Confirms the session still exists and has not lapsed, then slides its expiry forward. Returns
     * false (deleting a lapsed row) when the session is gone or expired. Sliding the window on every
     * request is what keeps an active user logged in until they explicitly log out.
     */
    @Transactional
    public boolean validateAndTouchSession(String tokenId) {
        if (Objects.isNull(tokenId)) {
            return false;
        }
        UserSession session = userSessionRepository.findByTokenId(tokenId).orElse(null);
        if (Objects.isNull(session)) {
            return false;
        }
        if (Objects.nonNull(session.getExpiresAt()) && session.getExpiresAt().isBefore(Instant.now())) {
            userSessionRepository.delete(session);
            return false;
        }
        session.setExpiresAt(Instant.now().plus(appProperties.getSessionExpiryMs(), ChronoUnit.MILLIS));
        userSessionRepository.save(session);
        return true;
    }

    @Transactional(readOnly = true)
    public AuthUser getActiveUser(String email) {
        return authUserRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Session is no longer valid"));
    }

    // ── private helpers ─────────────────────────────────────────────────

    private AuthUser authenticate(SigninRequest request) {
        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> ApiException.badData(INVALID_CREDENTIALS));
        if (!user.isVerified()) {
            throw ApiException.badData("Account not verified. Please complete signup first.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw ApiException.badData(INVALID_CREDENTIALS);
        }
        return user;
    }

    private String createSession(String email, DeviceMetadata device) {
        UserSession session = new UserSession();
        session.setTokenId(UUID.randomUUID().toString());
        session.setUserEmail(email);
        session.setUserAgent(device.userAgent());
        session.setIpAddress(device.ipAddress());
        session.setExpiresAt(Instant.now().plus(appProperties.getSessionExpiryMs(), ChronoUnit.MILLIS));
        userSessionRepository.save(session);
        return session.getTokenId();
    }

    private void prepareForSignup(AuthUser user, SignupRequest request, String otp) {
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setVerified(false);
        user.setOtpHash(passwordEncoder.encode(otp));
        user.setOtpExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        user.setOtpAttempts(0);
    }

    private void prepareForVerification(AuthUser user, String fullName, String rawPassword) {
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setVerified(true);
        user.setOtpHash(null);
        user.setOtpExpiresAt(null);
        user.setOtpAttempts(0);
    }

    private void verifyOtp(AuthUser user, String otp) {
        if (user.getOtpExpiresAt() == null || Instant.now().isAfter(user.getOtpExpiresAt())) {
            throw ApiException.badData("OTP has expired. Please sign up again.");
        }
        if (user.getOtpAttempts() >= MAX_ATTEMPTS) {
            throw ApiException.badData("Too many invalid attempts. Please sign up again.");
        }
        if (!passwordEncoder.matches(otp, user.getOtpHash())) {
            user.setOtpAttempts(user.getOtpAttempts() + 1);
            authUserRepository.save(user);
            throw ApiException.badData("Invalid OTP");
        }
    }
}
