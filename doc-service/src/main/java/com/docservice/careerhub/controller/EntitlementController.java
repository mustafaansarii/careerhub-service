package com.docservice.careerhub.controller;

import com.docservice.careerhub.entity.Subscription;
import com.docservice.careerhub.service.EntitlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class EntitlementController {

    @Autowired
    private EntitlementService entitlementService;

    @GetMapping("/api/me/entitlement")
    public Map<String, Object> entitlement(Authentication authentication) {
        Subscription subscription = entitlementService.find(authentication.getName()).orElse(null);
        boolean active = entitlementService.isActive(subscription);
        boolean unlimited = active && subscription.getCreditsRemaining() == null;

        Map<String, Object> result = new HashMap<>();
        result.put("plan", active ? subscription.getPlan().name() : "FREE");
        result.put("active", active);
        result.put("unlimited", unlimited);
        result.put("creditsRemaining", active ? (unlimited ? -1 : subscription.getCreditsRemaining()) : 0);
        result.put("validUntil", active ? subscription.getValidUntil().toString() : null);
        return result;
    }
}
