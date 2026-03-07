package com.aioverview.backend.aidemo.controller;

import com.aioverview.backend.aidemo.model.FilterIp;
import com.aioverview.backend.aidemo.service.FilterIpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 过滤IP管理控制器
 * 提供IP过滤规则的增删改查接口
 */
@RestController
@RequestMapping("/api/admin/filter-ips")
@CrossOrigin(origins = "*")
public class FilterIpController {

    @Autowired
    private FilterIpService filterIpService;

    /**
     * 获取所有过滤IP
     * @return 过滤IP列表
     */
    @GetMapping
    public ResponseEntity<List<FilterIp>> getAllFilterIps() {
        List<FilterIp> ips = filterIpService.getAllFilterIps();
        return ResponseEntity.ok(ips);
    }

    /**
     * 根据ID获取过滤IP
     * @param id IP ID
     * @return 过滤IP
     */
    @GetMapping("/{id}")
    public ResponseEntity<FilterIp> getFilterIpById(@PathVariable Long id) {
        FilterIp ip = filterIpService.getFilterIpById(id);
        if (ip == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ip);
    }

    /**
     * 添加过滤IP
     * @param request 请求体，包含ip和description
     * @return 新增的过滤IP
     */
    @PostMapping
    public ResponseEntity<?> addFilterIp(@RequestBody Map<String, String> request) {
        String ip = request.get("ip");
        String description = request.get("description");

        if (ip == null || ip.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "IP地址不能为空"));
        }

        try {
            FilterIp filterIp = filterIpService.addFilterIp(ip.trim(), description);
            return ResponseEntity.status(HttpStatus.CREATED).body(filterIp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 更新过滤IP
     * @param id IP ID
     * @param request 请求体，包含ip和description
     * @return 更新后的过滤IP
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFilterIp(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String ip = request.get("ip");
        String description = request.get("description");

        if (ip == null || ip.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "IP地址不能为空"));
        }

        try {
            FilterIp filterIp = filterIpService.updateFilterIp(id, ip.trim(), description);
            return ResponseEntity.ok(filterIp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 删除过滤IP
     * @param id IP ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFilterIp(@PathVariable Long id) {
        boolean deleted = filterIpService.deleteFilterIp(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 获取所有IP地址字符串列表（用于统计过滤）
     * @return IP地址列表
     */
    @GetMapping("/addresses")
    public ResponseEntity<List<String>> getFilterIpAddresses() {
        List<String> addresses = filterIpService.getFilterIpAddresses();
        return ResponseEntity.ok(addresses);
    }
}
