package com.docservice.careerhub.payment;

public record VerifyResponse(String orderId, String orderStatus, String paymentMethod, Double paymentAmount) {
}
