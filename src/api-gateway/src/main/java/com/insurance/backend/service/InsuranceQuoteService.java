package com.insurance.backend.service;

import com.insurance.backend.model.InsuranceQuote;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

public interface InsuranceQuoteService {
    Flux<InsuranceQuote> getQuotesFromAllProviders();
    
    Mono<InsuranceQuote> getQuoteFromProvider(String providerId);
    
    Mono<InsuranceQuote> selectQuote(Long quoteId);
    
    Mono<Void> updateExpiredQuotes();
    
    Mono<Map<String, Object>> getQuoteStatistics();
}