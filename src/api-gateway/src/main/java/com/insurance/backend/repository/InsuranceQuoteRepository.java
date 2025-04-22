package com.insurance.backend.repository;

import com.insurance.backend.model.InsuranceQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InsuranceQuoteRepository extends JpaRepository<InsuranceQuote, Long> {
    List<InsuranceQuote> findByProviderId(String providerId);
    
    List<InsuranceQuote> findByStatus(InsuranceQuote.QuoteStatus status);
    
    @Query("SELECT q FROM InsuranceQuote q WHERE q.validUntil <= :now AND q.status = 'PENDING'")
    List<InsuranceQuote> findExpiredQuotes(@Param("now") LocalDateTime now);
    
    List<InsuranceQuote> findByProviderIdAndStatus(String providerId, InsuranceQuote.QuoteStatus status);
}