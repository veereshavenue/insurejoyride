package com.insurance.backend.controller;

import com.insurance.backend.model.InsuranceQuote;
import com.insurance.backend.service.InsuranceQuoteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@WebFluxTest(InsuranceQuoteController.class)
class InsuranceQuoteControllerTest {

    @Autowired
    private WebTestClient webClient;

    @MockBean
    private InsuranceQuoteService quoteService;

    @Test
    void getAllQuotes_ReturnsQuotes() {
        // Arrange
        var quote = new InsuranceQuote();
        quote.setId(1L);
        quote.setProviderId("provider1");
        when(quoteService.getQuotesFromAllProviders())
                .thenReturn(Flux.just(quote));

        // Act & Assert
        webClient.get()
                .uri("/api/quotes")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(InsuranceQuote.class)
                .hasSize(1)
                .contains(quote);
    }

    @Test
    void getQuoteFromProvider_ReturnsQuote() {
        // Arrange
        var quote = new InsuranceQuote();
        quote.setId(1L);
        quote.setProviderId("provider1");
        when(quoteService.getQuoteFromProvider("provider1"))
                .thenReturn(Mono.just(quote));

        // Act & Assert
        webClient.get()
                .uri("/api/quotes/provider/{providerId}", "provider1")
                .exchange()
                .expectStatus().isOk()
                .expectBody(InsuranceQuote.class)
                .isEqualTo(quote);
    }

    @Test
    void selectQuote_WhenQuoteExists_ReturnsSelectedQuote() {
        // Arrange
        var quote = new InsuranceQuote();
        quote.setId(1L);
        quote.setStatus(InsuranceQuote.QuoteStatus.SELECTED);
        when(quoteService.selectQuote(1L))
                .thenReturn(Mono.just(quote));

        // Act & Assert
        webClient.post()
                .uri("/api/quotes/{quoteId}/select", 1L)
                .exchange()
                .expectStatus().isOk()
                .expectBody(InsuranceQuote.class)
                .isEqualTo(quote);
    }

    @Test
    void getQuoteStatistics_ReturnsStatistics() {
        // Arrange
        Map<String, Object> stats = Map.of(
            "total", 10L,
            "selected", 2,
            "expired", 1,
            "pending", 7
        );
        when(quoteService.getQuoteStatistics())
                .thenReturn(Mono.just(stats));

        // Act & Assert
        webClient.get()
                .uri("/api/quotes/statistics")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.total").isEqualTo(10)
                .jsonPath("$.selected").isEqualTo(2)
                .jsonPath("$.expired").isEqualTo(1)
                .jsonPath("$.pending").isEqualTo(7);
    }
}