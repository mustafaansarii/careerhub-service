package com.docservice.careerhub.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Base64;
import java.util.Objects;
import java.util.Optional;

/**
 * Stores the in-flight OAuth2 authorization request in a short-lived cookie instead of the HTTP
 * session, so the OAuth2 login dance works under a STATELESS session policy (no JSESSIONID, scales
 * horizontally). The request object is Java-serialized and Base64-encoded into the cookie.
 */
@Component
public class CookieAuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "OAUTH2_AUTH_REQUEST";
    private static final int EXPIRE_SECONDS = 600;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return readCookie(request).map(this::deserialize).orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request, HttpServletResponse response) {
        if (Objects.isNull(authorizationRequest)) {
            deleteCookie(response);
            return;
        }
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, serialize(authorizationRequest))
                .path("/")
                .httpOnly(true)
                .sameSite("Lax")
                .maxAge(EXPIRE_SECONDS)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        if (Objects.nonNull(authorizationRequest)) {
            deleteCookie(response);
        }
        return authorizationRequest;
    }

    private Optional<String> readCookie(HttpServletRequest request) {
        if (Objects.isNull(request.getCookies())) {
            return Optional.empty();
        }
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName()) && Objects.nonNull(cookie.getValue())
                    && !cookie.getValue().isBlank()) {
                return Optional.of(cookie.getValue());
            }
        }
        return Optional.empty();
    }

    private void deleteCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .path("/").httpOnly(true).sameSite("Lax").maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String serialize(OAuth2AuthorizationRequest authorizationRequest) {
        try (ByteArrayOutputStream bytes = new ByteArrayOutputStream();
             ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(authorizationRequest);
            out.flush();
            return Base64.getUrlEncoder().encodeToString(bytes.toByteArray());
        } catch (Exception exception) {
            throw new IllegalStateException("Could not serialize OAuth2 authorization request", exception);
        }
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        try (ByteArrayInputStream bytes = new ByteArrayInputStream(Base64.getUrlDecoder().decode(value));
             ObjectInputStream in = new ObjectInputStream(bytes)) {
            return (OAuth2AuthorizationRequest) in.readObject();
        } catch (Exception exception) {
            return null;
        }
    }
}
