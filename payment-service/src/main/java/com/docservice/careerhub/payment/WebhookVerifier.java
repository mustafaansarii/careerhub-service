package com.docservice.careerhub.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Objects;


@Service
public class WebhookVerifier {

    private static final Logger logger = LoggerFactory.getLogger(WebhookVerifier.class);

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    @Value("${cashfree.secret.key:}")
    private String secretKey;

    public boolean isValid(String timestamp, String rawBody, String signature) {
        if (isBlank(timestamp) || isBlank(rawBody) || isBlank(signature) || isBlank(secretKey)) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] hash = mac.doFinal((timestamp + rawBody).getBytes(StandardCharsets.UTF_8));
            String computed = Base64.getEncoder().encodeToString(hash);
            return MessageDigest.isEqual(computed.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            logger.error("Webhook signature verification threw an exception", e);
            return false;
        }
    }

    private static boolean isBlank(String value) {
        return Objects.isNull(value) || value.isBlank();
    }
}
