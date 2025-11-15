package com.aioverview.backend.aidemo.dao;

import com.aioverview.backend.aidemo.model.VisitorStats;
import org.apache.ibatis.annotations.Mapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 访客统计Mapper接口
 */
@Mapper
public interface VisitorStatsMapper {
    
    /**
     * 新增访问记录
     * @param visitorStats 访客统计信息
     * @return 影响行数
     */
    int insertVisit(VisitorStats visitorStats);
    
    /**
     * 根据页面路径统计访问次数
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 页面路径和访问次数的映射
     */
    List<Map<String, Object>> countByPagePath(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取最近的访问记录
     * @param limit 记录数量
     * @return 访问记录列表
     */
    List<VisitorStats> getRecentVisits(int limit);
    
    /**
     * 根据日期统计访问量
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 日期和访问量的映射
     */
    List<Map<String, Object>> countByDate(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * 获取总访问量
     * @return 总访问量
     */
    Long getTotalVisits();
}