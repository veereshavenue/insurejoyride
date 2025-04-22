package com.insurance.backend.controller;

import com.insurance.backend.config.InsuranceProviderConfig;
import com.insurance.backend.model.InsuranceQuote;
import com.insurance.backend.service.InsuranceQuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class InsuranceQuoteController {

    private final InsuranceQuoteService quoteService;

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<InsuranceQuote> getAllQuotes() {
        return quoteService.getQuotesFromAllProviders();
    }

    @GetMapping(value = "/{providerId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<InsuranceQuote> getQuoteFromProvider(@PathVariable String providerId) {
        return quoteService.getQuoteFromProvider(providerId);
    }

    @PostMapping(value = "/{quoteId}/select")
    public Mono<InsuranceQuote> selectQuote(@PathVariable Long quoteId) {
        return quoteService.selectQuote(quoteId);
    }

    @GetMapping("/statistics")
    public Mono<Map<String, Object>> getQuoteStatistics() {
        return quoteService.getQuoteStatistics();
    }
}