package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.SigninRequest;
import com.docservice.careerhub.dto.request.SignupRequest;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.dto.response.UserResponse;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.security.AuthCookies;
import com.docservice.careerhub.security.RequestMetadataExtractor;
import com.docservice.careerhub.service.AuthService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class AuthDtoApi extends AbstractDtoUtil {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthCookies authCookies;

    public MessageResponse signup(SignupRequest request) {
        validate(request);
        return authService.signup(request);
    }

    public UserResponse register(SignupRequest request) {
        validate(request);
        return toUserResponse(authService.register(request));
    }

    public UserResponse signin(SigninRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        validate(request);
        AuthService.LoginResult result = authService.login(request, RequestMetadataExtractor.extract(httpRequest));
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, authCookies.access(result.accessToken()).toString());
        return toUserResponse(result.user());
    }

    public MessageResponse logout(Authentication authentication, HttpServletResponse httpResponse) {
        authService.revokeSession(tokenIdOf(authentication));
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, authCookies.clear().toString());
        return MessageResponse.of("Logged out successfully");
    }

    public UserResponse me(Authentication authentication) {
        AuthUser user = authService.getActiveUser(authentication.getName());
        UserResponse response = toUserResponse(user);
        return response;
    }

    // ── private helpers ─────────────────────────────────────────────────

    private UserResponse toUserResponse(AuthUser user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .verified(user.isVerified())
                .roles(user.getRoles())
                .build();
    }

    private String tokenIdOf(Authentication authentication) {
        if (Objects.nonNull(authentication) && authentication.getCredentials() instanceof String tokenId) {
            return tokenId;
        }
        return null;
    }
}
