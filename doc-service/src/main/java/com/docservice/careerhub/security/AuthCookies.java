package com.docservice.careerhub.security;

import com.docservice.careerhub.config.AppProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** Builds the httpOnly access-token cookie (and the cleared variant for logout). */
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
        // Cookie lives as long as the session, not the short access token, so the browser keeps
        // sending the (possibly expired) token and the filter can silently re-issue it.
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
