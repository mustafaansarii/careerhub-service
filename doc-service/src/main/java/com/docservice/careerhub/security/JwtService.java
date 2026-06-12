package com.docservice.careerhub.security;

import com.docservice.careerhub.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiryMs;

    public JwtService(AppProperties appProperties) {
        this.key = Keys.hmacShaKeyFor(appProperties.getJwtSecret().getBytes(StandardCharsets.UTF_8));
        this.expiryMs = appProperties.getJwtExpiryMs();
    }

    public String generate(String email, String tokenId, List<String> roles) {
        Date now = new Date();
        return Jwts.builder()
                .setId(tokenId)
                .setSubject(email)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expiryMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean valid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    public String getEmail(String token) {
        return parse(token).getSubject();
    }

    public String getTokenId(String token) {
        return parse(token).getId();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        Object roles = parse(token).get("roles");
        return roles instanceof List ? (List<String>) roles : List.of();
    }

    public enum Status { VALID, EXPIRED, INVALID }

    public record TokenInspection(Status status, String email, String tokenId, List<String> roles) {
        public boolean usable() {
            return status == Status.VALID || status == Status.EXPIRED;
        }
    }

    public TokenInspection inspect(String token) {
        try {
            return inspectionOf(Status.VALID, parse(token));
        } catch (ExpiredJwtException expired) {
            return inspectionOf(Status.EXPIRED, expired.getClaims());
        } catch (Exception invalid) {
            return new TokenInspection(Status.INVALID, null, null, List.of());
        }
    }

    @SuppressWarnings("unchecked")
    private TokenInspection inspectionOf(Status status, Claims claims) {
        Object roles = claims.get("roles");
        List<String> roleNames = roles instanceof List ? (List<String>) roles : List.of();
        return new TokenInspection(status, claims.getSubject(), claims.getId(), roleNames);
    }

    private Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
