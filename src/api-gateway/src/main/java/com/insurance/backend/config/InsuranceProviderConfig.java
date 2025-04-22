package com.insurance.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "insurance")
public class InsuranceProviderConfig {
    private Map<String, ProviderProperties> providers;


    @Data
    public static class ProviderProperties {
        private boolean enabled;
        private boolean fetchFromDb;
        private String apiUrl;
        private String apiKey;
    }
}