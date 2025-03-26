package com.insurance.backend.service;

import com.insurance.backend.config.InsuranceProviderConfig;
import com.insurance.backend.model.InsuranceQuote;
import com.insurance.backend.repository.InsuranceQuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InsuranceQuoteServiceImplTest {

    @Mock
    private InsuranceQuoteRepository quoteRepository;

    @Mock
    private InsuranceProviderConfig providerConfig;

    private InsuranceQuoteServiceImpl quoteService;

    @BeforeEach
    void setUp() {
        quoteService = new InsuranceQuoteServiceImpl(quoteRepository, providerConfig);
    }

    @Test
    void getQuotesFromAllProviders_WhenProvidersEnabled_ReturnsQuotes() {
        // Arrange
        Map<String, InsuranceProviderConfig.ProviderProperties> providers = new HashMap<>();
        var provider1Props = new InsuranceProviderConfig.ProviderProperties();
        provider1Props.setEnabled(true);
        provider1Props.setFetchFromDb(true);
        providers.put("provider1", provider1Props);

        when(providerConfig.getProviders()).thenReturn(providers);
        when(quoteRepository.findByProviderId("provider1"))
                .thenReturn(Arrays.asList(new InsuranceQuote()));

        // Act & Assert
        StepVerifier.create(quoteService.getQuotesFromAllProviders())
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void getQuoteFromProvider_WhenProviderEnabled_ReturnsQuote() {
        // Arrange
        var providerProps = new InsuranceProviderConfig.ProviderProperties();
        providerProps.setEnabled(true);
        providerProps.setFetchFromDb(true);

        when(providerConfig.getProviders()).thenReturn(
                Map.of("provider1", providerProps));
        when(quoteRepository.findByProviderId("provider1"))
                .thenReturn(Arrays.asList(new InsuranceQuote()));

        // Act & Assert
        StepVerifier.create(quoteService.getQuoteFromProvider("provider1"))
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void selectQuote_WhenQuoteExists_UpdatesStatus() {
        // Arrange
        var quote = new InsuranceQuote();
        quote.setId(1L);
        when(quoteRepository.findById(1L)).thenReturn(Optional.of(quote));
        when(quoteRepository.save(any(InsuranceQuote.class))).thenReturn(quote);

        // Act & Assert
        StepVerifier.create(quoteService.selectQuote(1L))
                .expectNextMatches(savedQuote -> 
                    savedQuote.getStatus() == InsuranceQuote.QuoteStatus.SELECTED)
                .verifyComplete();
    }

    @Test
    void updateExpiredQuotes_UpdatesExpiredQuotes() {
        // Arrange
        var expiredQuote = new InsuranceQuote();
        expiredQuote.setStatus(InsuranceQuote.QuoteStatus.PENDING);
        when(quoteRepository.findExpiredQuotes(any()))
                .thenReturn(Arrays.asList(expiredQuote));

        // Act & Assert
        StepVerifier.create(quoteService.updateExpiredQuotes())
                .verifyComplete();
    }

    @Test
    void getQuoteStatistics_ReturnsStatistics() {
        // Arrange
        when(quoteRepository.count()).thenReturn(10L);
        when(quoteRepository.findByStatus(InsuranceQuote.QuoteStatus.SELECTED))
                .thenReturn(Arrays.asList(new InsuranceQuote(), new InsuranceQuote()));
        when(quoteRepository.findByStatus(InsuranceQuote.QuoteStatus.EXPIRED))
                .thenReturn(Arrays.asList(new InsuranceQuote()));
        when(quoteRepository.findByStatus(InsuranceQuote.QuoteStatus.PENDING))
                .thenReturn(Arrays.asList(new InsuranceQuote(), new InsuranceQuote(), new InsuranceQuote()));

        // Act & Assert
        StepVerifier.create(quoteService.getQuoteStatistics())
                .expectNextMatches(stats -> 
                    stats.get("total").equals(10L) &&
                    stats.get("selected").equals(2) &&
                    stats.get("expired").equals(1) &&
                    stats.get("pending").equals(3))
                .verifyComplete();
    }
}