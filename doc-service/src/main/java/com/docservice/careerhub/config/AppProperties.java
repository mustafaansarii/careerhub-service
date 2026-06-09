package com.docservice.careerhub.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
public class AppProperties {

    @Value("${spring.application.name:DOC-SERVICE}")
    private String appName;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${server.port:5001}")
    private int serverPort;

    @Value("${oauth.success-redirect:${frontend.url:http://localhost:5173}}")
    private String oauthSuccessRedirect;

    @Value("${oauth.failure-redirect:${frontend.url:http://localhost:5173}/login}")
    private String oauthFailureRedirect;

    @Value("${auth.jwt.secret}")
    private String jwtSecret;

    @Value("${auth.jwt.expiry-ms:3600000}")
    private long jwtExpiryMs;

    @Value("${auth.session.expiry-ms:2592000000}")
    private long sessionExpiryMs;

    @Value("${auth.cookie.name:ACCESS_TOKEN}")
    private String cookieName;

    @Value("${auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${auth.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${auth.cookie.path:/}")
    private String cookiePath;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${google.clientId:}")
    private String googleClientId;

    @Value("${google.clientSecret:}")
    private String googleClientSecret;

    @Value("${github.clientId:}")
    private String githubClientId;

    @Value("${github.clientSecret:}")
    private String githubClientSecret;

    @Value("${openai.apiKey:}")
    private String openaiApiKey;

    @Value("${openai.modelName:gemini-flash-latest}")
    private String openaiModelName;

    @Value("${supabase.bucket.name:resume_pdf}")
    private String supabaseBucketName;

    @Value("${supabase.service.key:}")
    private String supabaseServiceKey;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${cashfree.app.id:}")
    private String cashfreeAppId;

    @Value("${cashfree.secret.key:}")
    private String cashfreeSecretKey;

    @Value("${latex.docker-image:texlive/texlive:latest}")
    private String latexDockerImage;

    @Value("${latex.compile-timeout-seconds:120}")
    private long latexCompileTimeoutSeconds;
}
