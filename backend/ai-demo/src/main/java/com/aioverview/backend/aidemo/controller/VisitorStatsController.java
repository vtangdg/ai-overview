package com.aioverview.backend.aidemo.controller;

import com.aioverview.backend.aidemo.model.VisitorStats;
import com.aioverview.backend.aidemo.service.VisitorStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 访客统计控制器
 */
@RestController
@RequestMapping("/api/visitor-stats")
public class VisitorStatsController {

    @Autowired
    private VisitorStatsService visitorStatsService;

    /**
     * 记录访问信息
     * @param visitorStats 访客统计信息
     * @param request HttpServletRequest
     * @return 响应结果
     */
    @PostMapping("/record")
    public ResponseEntity<Void> recordVisit(@RequestBody VisitorStats visitorStats, HttpServletRequest request) {
        // 从请求中获取额外信息
        if (visitorStats.getUserAgent() == null) {
            visitorStats.setUserAgent(request.getHeader("User-Agent"));
        }
        if (visitorStats.getIpAddress() == null) {
            visitorStats.setIpAddress(getClientIp(request));
        }
        if (visitorStats.getReferrer() == null) {
            visitorStats.setReferrer(request.getHeader("Referer"));
        }
        if (visitorStats.getSessionId() == null) {
            visitorStats.setSessionId(request.getSession().getId());
        }

        // 记录访问
        visitorStatsService.recordVisit(visitorStats);

        // 返回响应
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * 获取页面访问统计
     * @param days 天数范围
     * @return 页面访问统计
     */
    @GetMapping("/pages")
    public ResponseEntity<List<Map<String, Object>>> getPageStats(@RequestParam(defaultValue = "7") int days) {
        List<Map<String, Object>> stats = visitorStatsService.getPageStats(days);
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取最近访问记录
     * @param limit 记录数量
     * @return 最近访问记录
     */
    @GetMapping("/recent")
    public ResponseEntity<List<VisitorStats>> getRecentVisits(@RequestParam(defaultValue = "50") int limit) {
        List<VisitorStats> visits = visitorStatsService.getRecentVisits(limit);
        return ResponseEntity.ok(visits);
    }

    /**
     * 获取日期访问统计
     * @param days 天数范围
     * @return 日期访问统计
     */
    @GetMapping("/dates")
    public ResponseEntity<List<Map<String, Object>>> getDateStats(@RequestParam(defaultValue = "7") int days) {
        List<Map<String, Object>> stats = visitorStatsService.getDateStats(days);
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取总访问量
     * @return 总访问量
     */
    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getTotalVisits() {
        Long total = visitorStatsService.getTotalVisits();
        Map<String, Object> response = new HashMap<>();
        response.put("totalVisits", total);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取客户端真实IP地址
     * @param request HttpServletRequest
     * @return IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多级代理的情况，取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}