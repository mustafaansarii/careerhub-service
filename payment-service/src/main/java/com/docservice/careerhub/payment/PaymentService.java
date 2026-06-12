package com.docservice.careerhub.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.Objects;


@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    // Cashfree API endpoints
    private static final String PRODUCTION_BASE_URL = "https://api.cashfree.com/pg";
    private static final String SANDBOX_BASE_URL = "https://sandbox.cashfree.com/pg";
    private static final String SANDBOX_ENVIRONMENT = "SANDBOX";
    private static final String ORDERS_PATH = "/orders";
    private static final String ORDER_BY_ID_PATH = "/orders/{id}";
    private static final String ORDER_PAYMENTS_PATH = "/orders/{id}/payments";

    // Request headers
    private static final String HEADER_CLIENT_ID = "x-client-id";
    private static final String HEADER_CLIENT_SECRET = "x-client-secret";
    private static final String HEADER_API_VERSION = "x-api-version";

    // Cashfree JSON field names
    private static final String FIELD_ORDER_ID = "order_id";
    private static final String FIELD_ORDER_AMOUNT = "order_amount";
    private static final String FIELD_ORDER_CURRENCY = "order_currency";
    private static final String FIELD_ORDER_STATUS = "order_status";
    private static final String FIELD_PAYMENT_SESSION_ID = "payment_session_id";
    private static final String FIELD_PAYMENT_METHOD = "payment_method";
    private static final String FIELD_PAYMENT_AMOUNT = "payment_amount";
    private static final String FIELD_CUSTOMER_DETAILS = "customer_details";
    private static final String FIELD_CUSTOMER_ID = "customer_id";
    private static final String FIELD_CUSTOMER_NAME = "customer_name";
    private static final String FIELD_CUSTOMER_EMAIL = "customer_email";
    private static final String FIELD_CUSTOMER_PHONE = "customer_phone";
    private static final String FIELD_ORDER_META = "order_meta";
    private static final String FIELD_RETURN_URL = "return_url";

    private static final String CURRENCY = "INR";
    private static final String CUSTOMER_ID_PREFIX = "CUST_";
    private static final char[] HEX = "0123456789abcdef".toCharArray();

    private final SecureRandom random = new SecureRandom();

    @Value("${cashfree.app.id:}")
    private String appId;

    @Value("${cashfree.secret.key:}")
    private String secretKey;

    @Value("${cashfree.environment:PRODUCTION}")
    private String environment;

    @Value("${cashfree.api-version:2023-08-01}")
    private String apiVersion;

    @Value("${cashfree.return-url:https://www.careerhubs.info/payment/status?order_id={order_id}}")
    private String returnUrl;

    /** Creates a Cashfree order and returns the payment session the client checks out with. */
    public OrderResponse createOrder(CreateOrderRequest request) {
        validate(request);
        String orderId = generateOrderId();
        Map<String, Object> orderPayload = buildOrderPayload(request, orderId);
        Map<?, ?> cashfreeResponse = postOrder(orderPayload);
        return toOrderResponse(cashfreeResponse);
    }

    /** Fetches an order's current status (plus best-effort payment method/amount). */
    public VerifyResponse verifyOrder(String orderId) {
        if (isBlank(orderId)) {
            throw new PaymentException("Order ID is required");
        }
        Map<?, ?> order = fetchOrder(orderId);
        String orderStatus = asString(order.get(FIELD_ORDER_STATUS));
        PaymentInfo payment = fetchFirstPayment(orderId);
        return new VerifyResponse(orderId, orderStatus, payment.method(), payment.amount());
    }

    // ── private helpers ─────────────────────────────────────────────────

    private Map<?, ?> postOrder(Map<String, Object> orderPayload) {
        try {
            Map<?, ?> response = cashfreeClient().post().uri(ORDERS_PATH).body(orderPayload).retrieve().body(Map.class);
            if (Objects.isNull(response)) {
                throw new PaymentException("No response received from Cashfree");
            }
            return response;
        } catch (PaymentException e) {
            throw e;
        } catch (Exception e) {
            throw new PaymentException("Payment processing failed: " + e.getMessage(), e);
        }
    }

    private Map<?, ?> fetchOrder(String orderId) {
        try {
            Map<?, ?> order = cashfreeClient().get().uri(ORDER_BY_ID_PATH, orderId).retrieve().body(Map.class);
            if (Objects.isNull(order)) {
                throw new PaymentException("Invalid response from payment gateway");
            }
            return order;
        } catch (PaymentException e) {
            throw e;
        } catch (Exception e) {
            throw new PaymentException("Payment verification failed: " + e.getMessage(), e);
        }
    }

    private PaymentInfo fetchFirstPayment(String orderId) {
        try {
            List<?> payments = cashfreeClient().get().uri(ORDER_PAYMENTS_PATH, orderId).retrieve().body(List.class);
            if (Objects.nonNull(payments) && !payments.isEmpty() && payments.get(0) instanceof Map<?, ?> firstPayment) {
                return new PaymentInfo(asString(firstPayment.get(FIELD_PAYMENT_METHOD)), asDouble(firstPayment.get(FIELD_PAYMENT_AMOUNT)));
            }
        } catch (Exception ignored) {
            logger.warn("Failed to fetch/parse Cashfree payment details: {}", ignored.getMessage());
        }
        return new PaymentInfo(null, null);
    }

    private RestClient cashfreeClient() {
        if (isBlank(appId) || isBlank(secretKey)) {
            throw new PaymentException("Cashfree credentials are not configured");
        }
        String baseUrl = SANDBOX_ENVIRONMENT.equalsIgnoreCase(environment) ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL;
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HEADER_CLIENT_ID, appId)
                .defaultHeader(HEADER_CLIENT_SECRET, secretKey)
                .defaultHeader(HEADER_API_VERSION, apiVersion)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    private Map<String, Object> buildOrderPayload(CreateOrderRequest request, String orderId) {
        Map<String, Object> customerDetails = Map.of(
                FIELD_CUSTOMER_ID, CUSTOMER_ID_PREFIX + orderId,
                FIELD_CUSTOMER_NAME, request.customerName().trim(),
                FIELD_CUSTOMER_EMAIL, request.customerEmail().trim(),
                FIELD_CUSTOMER_PHONE, request.customerPhone().trim()
        );
        return Map.of(
                FIELD_ORDER_ID, orderId,
                FIELD_ORDER_AMOUNT, request.amount(),
                FIELD_ORDER_CURRENCY, CURRENCY,
                FIELD_CUSTOMER_DETAILS, customerDetails,
                FIELD_ORDER_META, Map.of(FIELD_RETURN_URL, returnUrl)
        );
    }

    private OrderResponse toOrderResponse(Map<?, ?> response) {
        return new OrderResponse(
                asString(response.get(FIELD_ORDER_ID)),
                asDouble(response.get(FIELD_ORDER_AMOUNT)),
                asString(response.get(FIELD_ORDER_CURRENCY)),
                asString(response.get(FIELD_PAYMENT_SESSION_ID)),
                asString(response.get(FIELD_ORDER_STATUS))
        );
    }

    private void validate(CreateOrderRequest request) {
        if (Objects.isNull(request) || Objects.isNull(request.amount())
                || isBlank(request.customerName()) || isBlank(request.customerEmail()) || isBlank(request.customerPhone())) {
            throw new PaymentException("amount, customerName, customerEmail and customerPhone are required");
        }
        if (request.amount() <= 0) {
            throw new PaymentException("Invalid amount");
        }
    }

    private String generateOrderId() {
        byte[] bytes = new byte[6];
        random.nextBytes(bytes);
        StringBuilder orderId = new StringBuilder(12);
        for (byte b : bytes) {
            orderId.append(HEX[(b >> 4) & 0xF]).append(HEX[b & 0xF]);
        }
        return orderId.toString();
    }

    private static boolean isBlank(String value) {
        return Objects.isNull(value) || value.isBlank();
    }

    private static String asString(Object value) {
        return Objects.isNull(value) ? null : value.toString();
    }

    private static Double asDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (Objects.isNull(value)) {
            return null;
        }
        try {
            return Double.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private record PaymentInfo(String method, Double amount) {
    }
}
