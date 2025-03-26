package com.insurance.backend.repository;

import com.insurance.backend.model.InsuranceQuote;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class InsuranceQuoteRepositoryTest {

    @Autowired
    private InsuranceQuoteRepository quoteRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByProviderId_ReturnsMatchingQuotes() {
        // Arrange
        var quote1 = new InsuranceQuote();
        quote1.setProviderId("provider1");
        quote1.setStatus(InsuranceQuote.QuoteStatus.PENDING);
        
        var quote2 = new InsuranceQuote();
        quote2.setProviderId("provider1");
        quote2.setStatus(InsuranceQuote.QuoteStatus.SELECTED);
        
        quoteRepository.saveAll(List.of(quote1, quote2));
        entityManager.flush();

        // Act
        var result = quoteRepository.findByProviderId("provider1");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(InsuranceQuote::getProviderId)
                .containsOnly("provider1");
    }

    @Test
    void findByStatus_ReturnsMatchingQuotes() {
        // Arrange
        var quote1 = new InsuranceQuote();
        quote1.setProviderId("provider1");
        quote1.setStatus(InsuranceQuote.QuoteStatus.PENDING);
        
        var quote2 = new InsuranceQuote();
        quote2.setProviderId("provider2");
        quote2.setStatus(InsuranceQuote.QuoteStatus.PENDING);
        
        quoteRepository.saveAll(List.of(quote1, quote2));
        entityManager.flush();

        // Act
        var result = quoteRepository.findByStatus(InsuranceQuote.QuoteStatus.PENDING);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(InsuranceQuote::getStatus)
                .containsOnly(InsuranceQuote.QuoteStatus.PENDING);
    }

    @Test
    void findExpiredQuotes_ReturnsExpiredPendingQuotes() {
        // Arrange
        var now = LocalDateTime.now();
        var expiredQuote = new InsuranceQuote();
        expiredQuote.setStatus(InsuranceQuote.QuoteStatus.PENDING);
        expiredQuote.setValidUntil(now.minusHours(1));
        
        var validQuote = new InsuranceQuote();
        validQuote.setStatus(InsuranceQuote.QuoteStatus.PENDING);
        validQuote.setValidUntil(now.plusHours(1));
        
        quoteRepository.saveAll(List.of(expiredQuote, validQuote));

        // Act
        var result = quoteRepository.findExpiredQuotes(now);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getValidUntil()).isBefore(now);
    }

    @Test
    void findByProviderIdAndStatus_ReturnsMatchingQuotes() {
        // Arrange
        var quote1 = new InsuranceQuote();
        quote1.setProviderId("provider1");
        quote1.setStatus(InsuranceQuote.QuoteStatus.PENDING);
        
        var quote2 = new InsuranceQuote();
        quote2.setProviderId("provider1");
        quote2.setStatus(InsuranceQuote.QuoteStatus.SELECTED);
        
        quoteRepository.saveAll(List.of(quote1, quote2));
        entityManager.flush();

        // Act
        var result = quoteRepository.findByProviderIdAndStatus(
            "provider1", InsuranceQuote.QuoteStatus.PENDING);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProviderId()).isEqualTo("provider1");
        assertThat(result.get(0).getStatus()).isEqualTo(InsuranceQuote.QuoteStatus.PENDING);
    }
}