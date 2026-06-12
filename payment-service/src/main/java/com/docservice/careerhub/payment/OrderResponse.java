package com.docservice.careerhub.payment;

public record OrderResponse(String orderId, Double orderAmount, String orderCurrency, String paymentSessionId, String orderStatus) {
}
