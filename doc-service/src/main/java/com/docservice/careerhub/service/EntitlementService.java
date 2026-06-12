package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.Plan;
import com.docservice.careerhub.entity.Subscription;
import com.docservice.careerhub.repo.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.Optional;


@Service
public class EntitlementService {

    private static final long VALIDITY_DAYS = 365;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public Optional<Subscription> find(String ownerEmail) {
        return subscriptionRepository.findByOwnerEmail(ownerEmail);
    }

    public boolean isActive(Subscription subscription) {
        return Objects.nonNull(subscription)
                && Objects.nonNull(subscription.getValidUntil())
                && subscription.getValidUntil().isAfter(Instant.now());
    }

    @Transactional(readOnly = true)
    public boolean isUnlocked(String ownerEmail, Long docId) {
        Subscription subscription = subscriptionRepository.findByOwnerEmail(ownerEmail).orElse(null);
        if (!isActive(subscription)) {
            return false;
        }
        return subscription.getCreditsRemaining() == null || subscription.getUnlockedDocIds().contains(docId);
    }

    /** Spends one credit to unlock a resume (idempotent for already-unlocked docs). */
    @Transactional
    public boolean unlock(String ownerEmail, Long docId) {
        Subscription subscription = subscriptionRepository.findByOwnerEmail(ownerEmail).orElse(null);
        if (!isActive(subscription)) {
            return false;
        }
        if (subscription.getUnlockedDocIds().contains(docId)) {
            return true;
        }
        boolean unlimited = subscription.getCreditsRemaining() == null;
        if (!unlimited && subscription.getCreditsRemaining() <= 0) {
            return false;
        }
        subscription.getUnlockedDocIds().add(docId);
        if (!unlimited) {
            subscription.setCreditsRemaining(subscription.getCreditsRemaining() - 1);
        }
        subscriptionRepository.save(subscription);
        return true;
    }

    /** Grants a purchased plan: extends validity by a year and adds the plan's credits. */
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
