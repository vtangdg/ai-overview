package com.aioverview.backend.aidemo.model;

import java.util.List;
import java.util.Map;

/**
 * 综合统计数据响应
 */
public class VisitorStatsSummary {

    private Long totalVisits;
    private List<Map<String, Object>> pageStats;
    private List<Map<String, Object>> dateStats;
    private List<VisitorStats> recentVisits;

    public VisitorStatsSummary() {
    }

    public VisitorStatsSummary(Long totalVisits,
                               List<Map<String, Object>> pageStats,
                               List<Map<String, Object>> dateStats,
                               List<VisitorStats> recentVisits) {
        this.totalVisits = totalVisits;
        this.pageStats = pageStats;
        this.dateStats = dateStats;
        this.recentVisits = recentVisits;
    }

    public Long getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(Long totalVisits) {
        this.totalVisits = totalVisits;
    }

    public List<Map<String, Object>> getPageStats() {
        return pageStats;
    }

    public void setPageStats(List<Map<String, Object>> pageStats) {
        this.pageStats = pageStats;
    }

    public List<Map<String, Object>> getDateStats() {
        return dateStats;
    }

    public void setDateStats(List<Map<String, Object>> dateStats) {
        this.dateStats = dateStats;
    }

    public List<VisitorStats> getRecentVisits() {
        return recentVisits;
    }

    public void setRecentVisits(List<VisitorStats> recentVisits) {
        this.recentVisits = recentVisits;
    }
}
