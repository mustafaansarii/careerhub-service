package com.docservice.careerhub.security;

import com.docservice.careerhub.config.AppProperties;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = "0123456789012345678901234567890123456789";

    private JwtService jwtService(long expiryMs) {
        AppProperties props = new AppProperties();
        props.setJwtSecret(SECRET);
        props.setJwtExpiryMs(expiryMs);
        return new JwtService(props);
    }

    @Test
    void inspectReturnsValidWithClaimsForFreshToken() {
        JwtService service = jwtService(3600000L);
        String token = service.generate("user@example.com", "jti-1", List.of("USER", "ADMIN"));

        JwtService.TokenInspection inspection = service.inspect(token);

        assertThat(inspection.status()).isEqualTo(JwtService.Status.VALID);
        assertThat(inspection.usable()).isTrue();
        assertThat(inspection.email()).isEqualTo("user@example.com");
        assertThat(inspection.tokenId()).isEqualTo("jti-1");
        assertThat(inspection.roles()).containsExactly("USER", "ADMIN");
    }

    @Test
    void inspectReturnsExpiredButStillExposesClaimsForRefresh() {

        JwtService service = jwtService(-1000L);
        String token = service.generate("user@example.com", "jti-1", List.of("USER"));

        JwtService.TokenInspection inspection = service.inspect(token);

        assertThat(inspection.status()).isEqualTo(JwtService.Status.EXPIRED);
        assertThat(inspection.usable()).isTrue();
        assertThat(inspection.email()).isEqualTo("user@example.com");
        assertThat(inspection.tokenId()).isEqualTo("jti-1");
        assertThat(inspection.roles()).containsExactly("USER");
    }

    @Test
    void inspectReturnsInvalidForGarbageOrWrongSignature() {
        JwtService service = jwtService(3600000L);

        JwtService.TokenInspection inspection = service.inspect("not-a-jwt");

        assertThat(inspection.status()).isEqualTo(JwtService.Status.INVALID);
        assertThat(inspection.usable()).isFalse();
        assertThat(inspection.email()).isNull();
        assertThat(inspection.tokenId()).isNull();
        assertThat(inspection.roles()).isEmpty();
    }
}
