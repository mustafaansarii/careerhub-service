package com.docservice.careerhub.payment;

public record CreateOrderRequest(Double amount, String customerName, String customerEmail, String customerPhone) {
}
