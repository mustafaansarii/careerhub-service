package com.docservice.careerhub.security;

import com.docservice.careerhub.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/** Redirects failed OAuth logins back to the frontend login page with an error flag. */
@Component
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Autowired
    private AppProperties appProperties;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String reason = URLEncoder.encode(
                exception.getMessage() == null ? "oauth_failed" : exception.getMessage(), StandardCharsets.UTF_8);
        String target = appProperties.getOauthFailureRedirect()
                + (appProperties.getOauthFailureRedirect().contains("?") ? "&" : "?") + "error=" + reason;
        getRedirectStrategy().sendRedirect(request, response, target);
    }
}
