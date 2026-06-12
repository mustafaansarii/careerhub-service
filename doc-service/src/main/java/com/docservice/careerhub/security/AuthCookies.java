package com.docservice.careerhub.security;

import com.docservice.careerhub.config.AppProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookies {

    private final String name;
    private final boolean secure;
    private final String sameSite;
    private final String path;
    private final long maxAgeSeconds;

    public AuthCookies(AppProperties appProperties) {
        this.name = appProperties.getCookieName();
        this.secure = appProperties.isCookieSecure();
        this.sameSite = appProperties.getCookieSameSite();
        this.path = appProperties.getCookiePath();

        this.maxAgeSeconds = appProperties.getSessionExpiryMs() / 1000;
    }

    public String name() {
        return name;
    }

    public ResponseCookie access(String token) {
        return base(token).maxAge(maxAgeSeconds).build();
    }

    public ResponseCookie clear() {
        return base("").maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .path(path)
                .sameSite(sameSite);
    }
}
