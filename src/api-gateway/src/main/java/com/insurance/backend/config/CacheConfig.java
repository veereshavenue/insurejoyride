package com.insurance.backend.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    // Ehcache configuration is loaded from ehcache.xml
    // Additional cache configuration can be added here if needed
}