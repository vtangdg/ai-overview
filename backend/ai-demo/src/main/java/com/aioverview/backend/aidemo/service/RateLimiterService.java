package com.aioverview.backend.aidemo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * 基于 Caffeine 的固定窗口限流器（按 IP 等维度）。
 * <p>
 * 实现要点：
 * 1. 用 {@link Cache#get(Object, java.util.concurrent.Callable)} 原子地「获取或创建」
 *    计数对象，消除旧实现 get 后判空再 put 的竞态（并发首个请求可能各自创建对象，
 *    后写覆盖先写导致漏计数）；
 * 2. 窗口重置逻辑收敛到 {@link RateLimitInfo#tryAcquire} 的同步方法内：
 *    旧实现 count 只增不减、startTime 从不参与判断，「每小时 N 次」实际是
 *    「自首次请求起累计 N 次」；现在窗口过期后计数自动清零；
 * 3. 计数对象在缓存中原位变更（不再回写 put），一次请求只做一次缓存访问。
 * <p>
 * 适用场景：单实例部署的轻量限流。若未来多实例部署，需换 Redis（如 Bucket4j + Redis）
 * 或在网关层做限流——固定窗口在窗口边界处存在 2 倍突刺问题，当前量级可接受。
 */
@Service
public class RateLimiterService {

    private static final int MAX_REQUESTS_PER_HOUR = 20; // 每小时最多20次请求
    private static final long WINDOW_MILLIS = TimeUnit.HOURS.toMillis(1);

    private final Cache rateLimitCache;

    @Autowired
    public RateLimiterService(CacheManager cacheManager) {
        this.rateLimitCache = cacheManager.getCache("rateLimitCache");
    }

    /**
     * 判断是否放行该 key 的本次请求（放行则窗口内计数 +1）
     */
    public boolean isAllowed(String key) {
        if (rateLimitCache == null) {
            return true; // 缓存不可用时降级放行，不影响主流程
        }
        // Cache#get(key, Callable) 对同一 key 的加载是原子的，并发下只会创建一个计数对象
        RateLimitInfo info = rateLimitCache.get(key, RateLimitInfo::new);
        return info != null && info.tryAcquire(MAX_REQUESTS_PER_HOUR, WINDOW_MILLIS);
    }

    public int getRemainingRequests(String key) {
        if (rateLimitCache == null) {
            return MAX_REQUESTS_PER_HOUR;
        }
        RateLimitInfo info = rateLimitCache.get(key, RateLimitInfo::new);
        if (info == null) {
            return MAX_REQUESTS_PER_HOUR;
        }
        return info.remaining(MAX_REQUESTS_PER_HOUR, WINDOW_MILLIS);
    }

    /**
     * 单个 key 的限流状态。tryAcquire 加锁保证「窗口判定 + 计数」的原子性，
     * 避免「A 判定未超限、B 判定未超限、A/B 各自 +1」的竞态突破上限。
     */
    public static class RateLimitInfo {
        private int count = 0;
        private long windowStart = System.currentTimeMillis();

        public synchronized boolean tryAcquire(int limit, long windowMillis) {
            rollWindowIfNeeded(windowMillis);
            if (count >= limit) {
                return false;
            }
            count++;
            return true;
        }

        public synchronized int remaining(int limit, long windowMillis) {
            rollWindowIfNeeded(windowMillis);
            return Math.max(0, limit - count);
        }

        private void rollWindowIfNeeded(long windowMillis) {
            long now = System.currentTimeMillis();
            if (now - windowStart >= windowMillis) {
                count = 0;
                windowStart = now;
            }
        }
    }
}
