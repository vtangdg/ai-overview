package com.aioverview.backend.aidemo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.DAYS)
                .maximumSize(1000));
        // 预先定义所有需要的缓存名称
        cacheManager.setCacheNames(java.util.Arrays.asList(
                "rateLimitCache",      // 速率限制缓存
                "concepts",            // 概念解释缓存
                "conceptComparisons"   // 概念比较缓存
        ));
        return cacheManager;
    }

}