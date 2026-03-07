package com.aioverview.backend.aidemo.model;

import java.time.LocalDateTime;

/**
 * 过滤IP实体类
 */
public class FilterIp {

    private Long id;
    private String ip;
    private String description;
    private LocalDateTime createdAt;

    public FilterIp() {
    }

    public FilterIp(Long id, String ip, String description, LocalDateTime createdAt) {
        this.id = id;
        this.ip = ip;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
