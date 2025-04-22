package com.insurance.backend.service;

import com.insurance.backend.config.InsuranceProviderConfig;
import com.insurance.backend.model.InsuranceQuote;
import com.insurance.backend.repository.InsuranceQuoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsuranceQuoteServiceImpl implements InsuranceQuoteService {

    private final InsuranceQuoteRepository quoteRepository;
    private final InsuranceProviderConfig providerConfig;

    @Override
 //   @Cacheable(cacheNames = "insuranceQuotes", key = "'all'")
    public Flux<InsuranceQuote> getQuotesFromAllProviders() {
        return Flux.fromIterable(providerConfig.getProviders().entrySet())
                .filter(entry -> entry.getValue().isEnabled())
                .flatMap(entry -> {
                    String providerId = entry.getKey();
                    InsuranceProviderConfig.ProviderProperties props = entry.getValue();

                    if (props.isFetchFromDb()) {
                        return Flux.defer(() -> Flux.fromIterable(quoteRepository.findByProviderId(providerId)))
                        .subscribeOn(Schedulers.boundedElastic())
                        .doOnNext(quote -> System.out.println("Fetched from DB: " + quote));
                    } else {
                        // Here we would make API calls to external providers
                        // For now, returning dummy flux as placeholder
                        return Flux.just(new InsuranceQuote(providerId, 0.0, InsuranceQuote.QuoteStatus.PENDING, LocalDateTime.now().plusDays(1), null));
                    }
                })
                .delayElements(Duration.ofSeconds(5));
    }

    @Override
    @Cacheable(cacheNames = "insuranceQuotes", key = "#providerId")
    public Mono<InsuranceQuote> getQuoteFromProvider(String providerId) {
        var props = providerConfig.getProviders().get(providerId);
        if (props == null || !props.isEnabled()) {
            return Mono.empty();
        }

        if (props.isFetchFromDb()) {
            return Mono.fromCallable(() -> quoteRepository.findByProviderId(providerId))
                    .subscribeOn(Schedulers.boundedElastic())
                    .flatMap(quotes -> Mono.justOrEmpty(quotes.stream().findFirst()));
        } else {
            // Here we would make API call to external provider
            // For now, returning empty mono as placeholder
            return Mono.empty();
        }
    }

    @Override
    @CacheEvict(cacheNames = {"insuranceQuotes", "providerResponses"}, allEntries = true)
    public Mono<InsuranceQuote> selectQuote(Long quoteId) {
        return Mono.fromCallable(() -> quoteRepository.findById(quoteId))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(optionalQuote -> optionalQuote.map(quote -> {
                    quote.setStatus(InsuranceQuote.QuoteStatus.SELECTED);
                    return Mono.fromCallable(() -> quoteRepository.save(quote))
                            .subscribeOn(Schedulers.boundedElastic());
                }).orElse(Mono.empty()));
    }

    @Override
    @Scheduled(fixedDelay = 1, timeUnit = TimeUnit.HOURS)
    @CacheEvict(cacheNames = {"insuranceQuotes", "providerResponses"}, allEntries = true)
    public Mono<Void> updateExpiredQuotes() {
        return Mono.fromCallable(() -> {
            var expiredQuotes = quoteRepository.findExpiredQuotes(LocalDateTime.now());
            expiredQuotes.forEach(quote -> quote.setStatus(InsuranceQuote.QuoteStatus.EXPIRED));
            quoteRepository.saveAll(expiredQuotes);
            return null;
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    @Override
    public Mono<Map<String, Object>> getQuoteStatistics() {
        return Mono.fromCallable(() -> {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", quoteRepository.count());
            stats.put("selected", quoteRepository.findByStatus(InsuranceQuote.QuoteStatus.SELECTED).size());
            stats.put("expired", quoteRepository.findByStatus(InsuranceQuote.QuoteStatus.EXPIRED).size());
            stats.put("pending", quoteRepository.findByStatus(InsuranceQuote.QuoteStatus.PENDING).size());
            return stats;
        }).subscribeOn(Schedulers.boundedElastic());
    }
}