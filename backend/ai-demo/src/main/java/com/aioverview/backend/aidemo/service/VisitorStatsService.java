package com.aioverview.backend.aidemo.service;

import com.aioverview.backend.aidemo.dao.VisitorStatsMapper;
import com.aioverview.backend.aidemo.model.VisitorStats;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 访客统计服务类
 */
@Service
public class VisitorStatsService {

    @Autowired
    private VisitorStatsMapper visitorStatsMapper;

    /**
     * 记录访问信息
     * @param visitorStats 访客统计信息
     */
    public void recordVisit(VisitorStats visitorStats) {
        // 设置访问时间
        if (visitorStats.getVisitTime() == null) {
            visitorStats.setVisitTime(LocalDateTime.now());
        }
        // 保存到数据库
        visitorStatsMapper.insertVisit(visitorStats);
    }

    /**
     * 获取指定时间范围内的页面访问统计
     * @param days 天数范围
     * @return 页面访问统计列表
     */
    public List<Map<String, Object>> getPageStats(int days) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusDays(days);
        return visitorStatsMapper.countByPagePath(startTime, endTime);
    }

    /**
     * 获取最近的访问记录
     * @param limit 记录数量
     * @return 访问记录列表
     */
    public List<VisitorStats> getRecentVisits(int limit) {
        return visitorStatsMapper.getRecentVisits(limit);
    }

    /**
     * 获取指定时间范围内的日期访问统计
     * @param days 天数范围
     * @return 日期访问统计列表
     */
    public List<Map<String, Object>> getDateStats(int days) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusDays(days);
        return visitorStatsMapper.countByDate(startTime, endTime);
    }

    /**
     * 获取总访问量
     * @return 总访问量
     */
    public Long getTotalVisits() {
        return visitorStatsMapper.getTotalVisits();
    }
}