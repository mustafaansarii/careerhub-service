package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.docservice.careerhub.dto.constants.Role;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private static final DeviceMetadata DEVICE = new DeviceMetadata("JUnit", "127.0.0.1");

    private AuthUserRepository userRepo;
    private UserSessionRepository sessionRepo;
    private PasswordEncoder encoder;
    private MailService mailService;
    private JwtService jwtService;
    private AuthService service;

    @BeforeEach
    void setUp() {
        userRepo = mock(AuthUserRepository.class);
        sessionRepo = mock(UserSessionRepository.class);
        encoder = new BCryptPasswordEncoder();
        mailService = mock(MailService.class);
        AppProperties props = new AppProperties();
        props.setJwtSecret("0123456789012345678901234567890123456789");
        props.setJwtExpiryMs(3600000L);
        props.setSessionExpiryMs(2592000000L);
        jwtService = new JwtService(props);

        service = new AuthService();
        ReflectionTestUtils.setField(service, "authUserRepository", userRepo);
        ReflectionTestUtils.setField(service, "userSessionRepository", sessionRepo);
        ReflectionTestUtils.setField(service, "passwordEncoder", encoder);
        ReflectionTestUtils.setField(service, "mailService", mailService);
        ReflectionTestUtils.setField(service, "jwtService", jwtService);
        ReflectionTestUtils.setField(service, "appProperties", props);
    }

    private SignupRequest signupRequest() {
        SignupRequest request = new SignupRequest();
        request.setFullName("User");
        request.setEmail("user@example.com");
        request.setPassword("secret123");
        return request;
    }

    private SignupRequest registerRequest(String otp) {
        SignupRequest request = signupRequest();
        request.setOtp(otp);
        return request;
    }

    private SigninRequest signinRequest(String password) {
        SigninRequest request = new SigninRequest();
        request.setEmail("user@example.com");
        request.setPassword(password);
        return request;
    }

    private AuthUser unverifiedUserWithOtp(String otp, Instant expiry) {
        AuthUser user = new AuthUser();
        user.setEmail("user@example.com");
        user.setFullName("User");
        user.setPassword(encoder.encode("secret123"));
        user.setVerified(false);
        user.setOtpHash(encoder.encode(otp));
        user.setOtpExpiresAt(expiry);
        user.setOtpAttempts(0);
        return user;
    }

    private AuthUser verifiedUser() {
        AuthUser user = new AuthUser();
        user.setEmail("user@example.com");
        user.setFullName("User");
        user.setPassword(encoder.encode("secret123"));
        user.setVerified(true);
        return user;
    }

    @Test
    void signupCreatesUnverifiedUserAndSendsOtp() {
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.empty());
        when(userRepo.save(any(AuthUser.class))).thenAnswer(inv -> inv.getArgument(0));

        MessageResponse response = service.signup(signupRequest());

        ArgumentCaptor<AuthUser> captor = ArgumentCaptor.forClass(AuthUser.class);
        verify(userRepo).save(captor.capture());
        AuthUser saved = captor.getValue();
        assertThat(saved.isVerified()).isFalse();
        assertThat(encoder.matches("secret123", saved.getPassword())).isTrue();
        assertThat(saved.getOtpHash()).isNotBlank();
        assertThat(saved.getOtpExpiresAt()).isAfter(Instant.now());
        assertThat(saved.getRoles()).containsExactly(Role.USER);
        assertThat(response.getMessage()).contains("OTP sent");
        verify(mailService).sendOtp(eq("user@example.com"), anyString());
    }

    @Test
    void signupRejectsAlreadyVerifiedEmail() {
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(verifiedUser()));

        assertThatThrownBy(() -> service.signup(signupRequest()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already registered");
        verify(mailService, never()).sendOtp(anyString(), anyString());
    }

    @Test
    void registerMarksUserVerifiedForCorrectOtp() {
        AuthUser user = unverifiedUserWithOtp("123456", Instant.now().plusSeconds(120));
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepo.save(any(AuthUser.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthUser result = service.register(registerRequest("123456"));

        assertThat(result.isVerified()).isTrue();
        assertThat(result.getOtpHash()).isNull();
        assertThat(result.getOtpExpiresAt()).isNull();
    }

    @Test
    void registerRejectsWrongOtpAndIncrementsAttempts() {
        AuthUser user = unverifiedUserWithOtp("123456", Instant.now().plusSeconds(120));
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.register(registerRequest("000000")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid OTP");
        assertThat(user.getOtpAttempts()).isEqualTo(1);
        assertThat(user.isVerified()).isFalse();
    }

    @Test
    void registerRejectsExpiredOtp() {
        AuthUser user = unverifiedUserWithOtp("123456", Instant.now().minusSeconds(10));
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.register(registerRequest("123456")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("expired");
        assertThat(user.isVerified()).isFalse();
    }

    @Test
    void loginIssuesTokenAndOpensSession() {
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(verifiedUser()));
        when(sessionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthService.LoginResult result = service.login(signinRequest("secret123"), DEVICE);

        assertThat(result.user().getEmail()).isEqualTo("user@example.com");
        assertThat(jwtService.valid(result.accessToken())).isTrue();
        assertThat(jwtService.getEmail(result.accessToken())).isEqualTo("user@example.com");
        assertThat(jwtService.getRoles(result.accessToken())).containsExactly("USER");
        verify(sessionRepo).save(any());
    }

    @Test
    void loginRejectsWrongPassword() {
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(verifiedUser()));

        assertThatThrownBy(() -> service.login(signinRequest("wrongpass"), DEVICE))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid email or password");
        verify(sessionRepo, never()).save(any());
    }

    @Test
    void loginRejectsUnverifiedUser() {
        AuthUser user = unverifiedUserWithOtp("123456", Instant.now().plusSeconds(120));
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.login(signinRequest("secret123"), DEVICE))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not verified");
    }

    @Test
    void loginWithOAuthCreatesAccountWhenMissing() {
        when(userRepo.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(userRepo.save(any(AuthUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthService.LoginResult result =
                service.loginWithOAuth("new@example.com", "New User", "GOOGLE", DEVICE);

        AuthUser user = result.user();
        assertThat(user.getEmail()).isEqualTo("new@example.com");
        assertThat(user.getFullName()).isEqualTo("New User");
        assertThat(user.isVerified()).isTrue();
        assertThat(user.getProvider()).isEqualTo("GOOGLE");
        assertThat(user.getRoles()).containsExactly(Role.USER);
        assertThat(jwtService.valid(result.accessToken())).isTrue();
        assertThat(jwtService.getEmail(result.accessToken())).isEqualTo("new@example.com");
        verify(sessionRepo).save(any());
    }

    @Test
    void loginWithOAuthLogsInExistingUserAndLinksProvider() {
        AuthUser existing = verifiedUser();
        existing.setId(7L);
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(existing));
        when(userRepo.save(any(AuthUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthService.LoginResult result =
                service.loginWithOAuth("user@example.com", "Ignored Name", "GITHUB", DEVICE);

        assertThat(result.user().getId()).isEqualTo(7L);
        assertThat(result.user().getFullName()).isEqualTo("User");
        assertThat(result.user().getProvider()).isEqualTo("GITHUB");
        assertThat(jwtService.valid(result.accessToken())).isTrue();
        verify(sessionRepo).save(any());
    }

    @Test
    void revokeSessionDeletesByTokenId() {
        service.revokeSession("jti-1");
        verify(sessionRepo).deleteByTokenId("jti-1");
    }

    @Test
    void validateAndTouchSessionSlidesActiveSession() {
        UserSession session = new UserSession();
        session.setTokenId("jti-1");
        session.setExpiresAt(Instant.now().plusSeconds(60));
        when(sessionRepo.findByTokenId("jti-1")).thenReturn(Optional.of(session));

        boolean active = service.validateAndTouchSession("jti-1");

        assertThat(active).isTrue();

        assertThat(session.getExpiresAt()).isAfter(Instant.now().plusSeconds(86400));
        verify(sessionRepo).save(session);
        verify(sessionRepo, never()).delete(any());
    }

    @Test
    void validateAndTouchSessionRejectsAndDeletesExpired() {
        UserSession session = new UserSession();
        session.setTokenId("jti-1");
        session.setExpiresAt(Instant.now().minusSeconds(10));
        when(sessionRepo.findByTokenId("jti-1")).thenReturn(Optional.of(session));

        boolean active = service.validateAndTouchSession("jti-1");

        assertThat(active).isFalse();
        verify(sessionRepo).delete(session);
        verify(sessionRepo, never()).save(any());
    }

    @Test
    void validateAndTouchSessionRejectsMissingSession() {
        when(sessionRepo.findByTokenId("jti-x")).thenReturn(Optional.empty());

        assertThat(service.validateAndTouchSession("jti-x")).isFalse();
        assertThat(service.validateAndTouchSession(null)).isFalse();
    }
}
