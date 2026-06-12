package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.constants.Plan;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.payment.OrderResponse;
import com.docservice.careerhub.payment.VerifyResponse;
import com.docservice.careerhub.payment.WebhookVerifier;
import com.docservice.careerhub.service.PaymentOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentOrderService paymentOrderService;

    @Autowired
    private WebhookVerifier webhookVerifier;

    @PostMapping("/create-order")
    public OrderResponse createOrder(Authentication authentication, @RequestBody Map<String, String> body) {
        Plan plan = parsePlan(body.get("planId"));
        return paymentOrderService.createOrder(authentication.getName(), plan, body.get("customerPhone"));
    }

    /** Called on return from checkout — authoritatively confirms status and grants if paid. */
    @PostMapping("/verify")
    public VerifyResponse verify(@RequestBody Map<String, String> body) {
        String orderId = body == null ? null : body.get("orderId");
        if (Objects.isNull(orderId) || orderId.isBlank()) {
            throw ApiException.badData("orderId is required");
        }
        return paymentOrderService.confirmAndGrant(orderId);
    }

    /** Cashfree webhook (public, signature-verified over the raw body). */
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody byte[] rawBody,
                                          @RequestHeader(value = "x-webhook-signature", required = false) String signature,
                                          @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp) {
        String body = new String(rawBody, StandardCharsets.UTF_8);
        if (!webhookVerifier.isValid(timestamp, body, signature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid signature");
        }
        paymentOrderService.processWebhook(body);
        return ResponseEntity.ok("ok");
    }

    private Plan parsePlan(String planId) {
        if (Objects.isNull(planId) || planId.isBlank()) {
            throw ApiException.badData("planId is required");
        }
        try {
            return Plan.valueOf(planId.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badData("Unknown plan: " + planId);
        }
    }
}
