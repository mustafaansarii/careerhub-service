package com.docservice.careerhub.config;

import com.docservice.careerhub.security.AuthCookies;
import com.docservice.careerhub.security.CookieAuthorizationRequestRepository;
import com.docservice.careerhub.security.CustomOAuth2UserService;
import com.docservice.careerhub.security.JwtAuthenticationFilter;
import com.docservice.careerhub.security.JwtService;
import com.docservice.careerhub.security.OAuth2LoginFailureHandler;
import com.docservice.careerhub.security.OAuth2LoginSuccessHandler;
import com.docservice.careerhub.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_PATHS = {
            "/health",
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
    public CorsConfigurationSource corsConfigurationSource(AppProperties appProperties) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(appProperties.getCorsAllowedOrigins().split(","))
                .map(String::trim).filter(origin -> !origin.isEmpty()).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService, AuthService authService,
                                           AuthCookies authCookies, RoleEndpointAccessLoader accessLoader,
                                           CustomOAuth2UserService oAuth2UserService,
                                           OAuth2LoginSuccessHandler oAuth2SuccessHandler,
                                           OAuth2LoginFailureHandler oAuth2FailureHandler,
                                           CookieAuthorizationRequestRepository authRequestRepository,
                                           CorsConfigurationSource corsConfigurationSource) throws Exception {
        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtService, authService, authCookies);

        AuthenticationEntryPoint restEntryPoint =
                (request, response, ex) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(PUBLIC_PATHS).permitAll();

                    for (RoleEndpointAccessLoader.AccessRule rule : accessLoader.getRules()) {
                        if (java.util.Arrays.asList(rule.roles()).contains("PUBLIC")) {
                            auth.requestMatchers(rule.method(), rule.pattern()).permitAll();
                        } else {
                            auth.requestMatchers(rule.method(), rule.pattern()).hasAnyRole(rule.roles());
                        }
                    }
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(handling -> handling.authenticationEntryPoint(restEntryPoint))
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(endpoint -> endpoint.authorizationRequestRepository(authRequestRepository))
                        .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler(oAuth2FailureHandler))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
