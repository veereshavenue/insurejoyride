package com.insurance.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "insurance_quotes")
@RequiredArgsConstructor
public class InsuranceQuote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String providerId;
    private String quoteReference;
    private BigDecimal premium;
    private String coverageType;
    private LocalDateTime validUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Enumerated(EnumType.STRING)
    private QuoteStatus status;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public InsuranceQuote(String key, double d, QuoteStatus pending, LocalDateTime plusDays, Object object) {
        //TODO Auto-generated constructor stub
        this.providerId = key;
        this.premium = BigDecimal.valueOf(d);
        this.status = pending;
        this.validUntil = plusDays;
    }

    public enum QuoteStatus {
        PENDING,
        SELECTED,
        EXPIRED,
        REJECTED
    }
}