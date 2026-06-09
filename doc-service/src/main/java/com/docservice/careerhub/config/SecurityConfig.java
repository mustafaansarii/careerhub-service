package com.docservice.careerhub.config;

import com.docservice.careerhub.security.AuthCookies;
import com.docservice.careerhub.security.CookieAuthorizationRequestRepository;
import com.docservice.careerhub.security.CustomOAuth2UserService;
import com.docservice.careerhub.security.JwtAuthenticationFilter;
import com.docservice.careerhub.security.JwtService;
import com.docservice.careerhub.security.OAuth2LoginFailureHandler;
import com.docservice.careerhub.security.OAuth2LoginSuccessHandler;
import com.docservice.careerhub.service.AuthService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_PATHS = {
            "/api/auth/signup",
            "/api/auth/register",
            "/api/auth/signin",
            "/api/auth/logout",
            "/oauth2/**",
            "/login/oauth2/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService, AuthService authService,
                                           AuthCookies authCookies, RoleEndpointAccessLoader accessLoader,
                                           CustomOAuth2UserService oAuth2UserService,
                                           OAuth2LoginSuccessHandler oAuth2SuccessHandler,
                                           OAuth2LoginFailureHandler oAuth2FailureHandler,
                                           CookieAuthorizationRequestRepository authRequestRepository) throws Exception {
        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtService, authService, authCookies);

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(PUBLIC_PATHS).permitAll();
                    // Method+path rules sourced from user-roles.csv ("PUBLIC" = permitAll).
                    for (RoleEndpointAccessLoader.AccessRule rule : accessLoader.getRules()) {
                        if (java.util.Arrays.asList(rule.roles()).contains("PUBLIC")) {
                            auth.requestMatchers(rule.method(), rule.pattern()).permitAll();
                        } else {
                            auth.requestMatchers(rule.method(), rule.pattern()).hasAnyRole(rule.roles());
                        }
                    }
                    auth.anyRequest().authenticated();
                })
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(endpoint -> endpoint.authorizationRequestRepository(authRequestRepository))
                        .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler(oAuth2FailureHandler))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
