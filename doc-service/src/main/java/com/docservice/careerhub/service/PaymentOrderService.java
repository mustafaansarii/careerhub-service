package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.PaymentOrderStatus;
import com.docservice.careerhub.dto.constants.Plan;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.entity.PaymentOrder;
import com.docservice.careerhub.payment.CreateOrderRequest;
import com.docservice.careerhub.payment.OrderResponse;
import com.docservice.careerhub.payment.PaymentService;
import com.docservice.careerhub.payment.VerifyResponse;
import com.docservice.careerhub.repo.PaymentOrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class PaymentOrderService {

    private static final Logger log = LoggerFactory.getLogger(PaymentOrderService.class);

    private static final String STATUS_PAID = "PAID";
    private static final String FALLBACK_PHONE = "9999999999";

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private AuthService authService;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public OrderResponse createOrder(String ownerEmail, Plan plan, String customerPhone) {
        AuthUser user = authService.getActiveUser(ownerEmail);
        String phone = (Objects.isNull(customerPhone) || customerPhone.isBlank()) ? FALLBACK_PHONE : customerPhone;

        OrderResponse response = paymentService.createOrder(
                new CreateOrderRequest(plan.getPriceInr(), user.getFullName(), user.getEmail(), phone));

        PaymentOrder order = new PaymentOrder();
        order.setOrderId(response.orderId());
        order.setOwnerEmail(ownerEmail);
        order.setPlan(plan);
        order.setAmount(plan.getPriceInr());
        order.setStatus(PaymentOrderStatus.CREATED);
        paymentOrderRepository.save(order);

        return response;
    }

    /** Re-fetches the order from Cashfree and, if truly PAID, grants the plan once (idempotent). */
    @Transactional
    public VerifyResponse confirmAndGrant(String orderId) {
        VerifyResponse verification = paymentService.verifyOrder(orderId);
        if (!isPaid(verification)) {
            return verification;
        }
        int won = paymentOrderRepository.markPaid(orderId, PaymentOrderStatus.PAID, PaymentOrderStatus.CREATED);
        if (won != 1) {
            return verification;
        }
        PaymentOrder order = paymentOrderRepository.findByOrderId(orderId).orElse(null);
        if (Objects.nonNull(order)) {
            entitlementService.grant(order.getOwnerEmail(), order.getPlan());
            log.info("Granted plan {} to {} for order {}", order.getPlan(), order.getOwnerEmail(), orderId);
        }
        return verification;
    }

    @Transactional
    public void processWebhook(String rawBody) {
        String orderId = extractOrderId(rawBody);
        if (Objects.isNull(orderId)) {
            log.warn("Webhook received with no order_id in payload");
            return;
        }
        log.info("Webhook received for order {} — confirming with Cashfree", orderId);
        try {
            VerifyResponse verification = confirmAndGrant(orderId);
            log.info("Webhook processed for order {} — Cashfree status {}", orderId, verification.orderStatus());
        } catch (Exception e) {
            log.warn("Webhook for order {} could not be confirmed: {}", orderId, e.getMessage());
        }
    }

    private boolean isPaid(VerifyResponse verification) {
        return Objects.nonNull(verification) && STATUS_PAID.equalsIgnoreCase(verification.orderStatus());
    }

    private String extractOrderId(String rawBody) {
        try {
            JsonNode orderId = objectMapper.readTree(rawBody).path("data").path("order").path("order_id");
            String value = orderId.asText(null);
            return (Objects.isNull(value) || value.isBlank()) ? null : value;
        } catch (Exception e) {
            return null;
        }
    }
}
