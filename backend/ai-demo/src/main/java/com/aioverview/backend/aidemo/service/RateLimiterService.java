package com.aioverview.backend.aidemo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RateLimiterService {

    private final Cache rateLimitCache;
    private static final int MAX_REQUESTS_PER_HOUR = 20; // 每小时最多20次请求

    @Autowired
    public RateLimiterService(CacheManager cacheManager) {
        this.rateLimitCache = cacheManager.getCache("rateLimitCache");
    }

    public boolean isAllowed(String key) {
        if (rateLimitCache == null) {
            return true; // 如果缓存不可用，暂时允许所有请求
        }

        // 获取或创建限流计数
        RateLimitInfo info = rateLimitCache.get(key, RateLimitInfo.class);
        if (info == null) {
            info = new RateLimitInfo();
            rateLimitCache.put(key, info);
        }

        // 检查是否超过限制
        if (info.getCount() >= MAX_REQUESTS_PER_HOUR) {
            return false;
        }

        // 增加计数
        info.incrementCount();
        rateLimitCache.put(key, info);
        return true;
    }

    public int getRemainingRequests(String key) {
        if (rateLimitCache == null) {
            return MAX_REQUESTS_PER_HOUR;
        }

        RateLimitInfo info = rateLimitCache.get(key, RateLimitInfo.class);
        if (info == null) {
            return MAX_REQUESTS_PER_HOUR;
        }

        return MAX_REQUESTS_PER_HOUR - info.getCount();
    }

    // 内部类，用于存储限流信息
    public static class RateLimitInfo {
        private final AtomicInteger count = new AtomicInteger(0);
        private final AtomicLong startTime = new AtomicLong(System.currentTimeMillis());

        public int getCount() {
            return count.get();
        }

        public void incrementCount() {
            count.incrementAndGet();
        }

        public long getStartTime() {
            return startTime.get();
        }
    }
}