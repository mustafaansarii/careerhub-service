package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.Plan;
import com.docservice.careerhub.dto.response.EntitlementResponse;
import com.docservice.careerhub.entity.Subscription;
import com.docservice.careerhub.repo.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.Optional;


@Service
public class EntitlementService {

    private static final long VALIDITY_DAYS = 365;
    private static final String ADMIN_AUTHORITY = "ROLE_ADMIN";

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (Objects.isNull(authentication)) {
            return false;
        }
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (ADMIN_AUTHORITY.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public Optional<Subscription> find(String ownerEmail) {
        return subscriptionRepository.findByOwnerEmail(ownerEmail);
    }
    
    @Transactional(readOnly = true)
    public EntitlementResponse describe(String ownerEmail) {
        if (isAdmin()) {
            return EntitlementResponse.unlimited("ADMIN");
        }
        Subscription subscription = subscriptionRepository.findByOwnerEmail(ownerEmail).orElse(null);
        if (!isActive(subscription)) {
            return EntitlementResponse.free();
        }
        boolean unlimited = subscription.getCreditsRemaining() == null;
        int creditsRemaining = unlimited ? EntitlementResponse.UNLIMITED_CREDITS : subscription.getCreditsRemaining();
        return new EntitlementResponse(
                subscription.getPlan().name(),
                true,
                unlimited,
                creditsRemaining,
                subscription.getValidUntil().toString());
    }

    public boolean isActive(Subscription subscription) {
        return Objects.nonNull(subscription)
                && Objects.nonNull(subscription.getValidUntil())
                && subscription.getValidUntil().isAfter(Instant.now());
    }

    @Transactional(readOnly = true)
    public boolean hasActivePlan(String ownerEmail) {
        if (isAdmin()) {
            return true;
        }
        return isActive(subscriptionRepository.findByOwnerEmail(ownerEmail).orElse(null));
    }

    @Transactional(readOnly = true)
    public boolean isUnlocked(String ownerEmail, String resumeKey) {
        if (isAdmin()) {
            return true;
        }
        Subscription subscription = subscriptionRepository.findByOwnerEmail(ownerEmail).orElse(null);
        if (!isActive(subscription)) {
            return false;
        }
        return subscription.getCreditsRemaining() == null || subscription.getUnlockedTemplateCodes().contains(resumeKey);
    }

    @Transactional
    public boolean unlock(String ownerEmail, String resumeKey) {
        if (isAdmin()) {
            return true;
        }
        Subscription subscription = subscriptionRepository.findByOwnerEmail(ownerEmail).orElse(null);
        if (!isActive(subscription)) {
            return false;
        }
        if (subscription.getUnlockedTemplateCodes().contains(resumeKey)) {
            return true;
        }
        boolean unlimited = subscription.getCreditsRemaining() == null;
        if (!unlimited && subscription.getCreditsRemaining() <= 0) {
            return false;
        }
        subscription.getUnlockedTemplateCodes().add(resumeKey);
        if (!unlimited) {
            subscription.setCreditsRemaining(subscription.getCreditsRemaining() - 1);
        }
        subscriptionRepository.save(subscription);
        return true;
    }

    @Transactional
    public Subscription grant(String ownerEmail, Plan plan) {
        Subscription subscription = subscriptionRepository.findByOwnerEmail(ownerEmail).orElseGet(() -> {
            Subscription fresh = new Subscription();
            fresh.setOwnerEmail(ownerEmail);
            fresh.setCreditsRemaining(0);
            return fresh;
        });

        Instant base = isActive(subscription) ? subscription.getValidUntil() : Instant.now();
        subscription.setValidUntil(base.plus(VALIDITY_DAYS, ChronoUnit.DAYS));
        subscription.setPlan(plan);

        if (plan.isUnlimited()) {
            subscription.setCreditsRemaining(null);
        } else {
            int current = subscription.getCreditsRemaining() == null ? 0 : subscription.getCreditsRemaining();
            subscription.setCreditsRemaining(current + plan.getCredits());
        }
        return subscriptionRepository.save(subscription);
    }
}
