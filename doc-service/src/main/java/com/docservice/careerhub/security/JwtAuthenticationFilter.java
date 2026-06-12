package com.docservice.careerhub.security;

import com.docservice.careerhub.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AuthService authService;
    private final AuthCookies authCookies;

    public JwtAuthenticationFilter(JwtService jwtService, AuthService authService, AuthCookies authCookies) {
        this.jwtService = jwtService;
        this.authService = authService;
        this.authCookies = authCookies;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = fromCookie(request);
        if (Objects.isNull(token)) {
            token = fromAuthorizationHeader(request);
        }

        if (Objects.nonNull(token) && Objects.isNull(SecurityContextHolder.getContext().getAuthentication())) {
            JwtService.TokenInspection inspection = jwtService.inspect(token);
            if (inspection.usable() && authService.validateAndTouchSession(inspection.tokenId())) {
                if (inspection.status() == JwtService.Status.EXPIRED) {
                    reissueAccessToken(response, inspection);
                }
                authenticate(request, inspection);
            }
        }

        chain.doFilter(request, response);
    }

    private void reissueAccessToken(HttpServletResponse response, JwtService.TokenInspection inspection) {
        String refreshed = jwtService.generate(inspection.email(), inspection.tokenId(), inspection.roles());
        response.addHeader(HttpHeaders.SET_COOKIE, authCookies.access(refreshed).toString());
    }

    private void authenticate(HttpServletRequest request, JwtService.TokenInspection inspection) {
        List<SimpleGrantedAuthority> authorities = inspection.roles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(inspection.email(), inspection.tokenId(), authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String fromCookie(HttpServletRequest request) {
        if (Objects.isNull(request.getCookies())) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (authCookies.name().equals(cookie.getName())
                    && Objects.nonNull(cookie.getValue()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String fromAuthorizationHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (Objects.nonNull(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
