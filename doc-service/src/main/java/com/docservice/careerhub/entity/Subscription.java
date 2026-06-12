package com.docservice.careerhub.entity;

import com.docservice.careerhub.dto.constants.Plan;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "subscriptions", uniqueConstraints = @UniqueConstraint(columnNames = "ownerEmail"))
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ownerEmail;

    @Enumerated(EnumType.STRING)
    private Plan plan;

    private Instant validUntil;

    /** Resume-unlock credits left; null = unlimited. */
    private Integer creditsRemaining;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "subscription_unlocked_docs", joinColumns = @JoinColumn(name = "subscription_id"))
    @Column(name = "doc_id")
    private Set<Long> unlockedDocIds = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
