package com.docservice.careerhub.repo;

import com.docservice.careerhub.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByOwnerEmail(String ownerEmail);
}
