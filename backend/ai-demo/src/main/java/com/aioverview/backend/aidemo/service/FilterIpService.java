package com.aioverview.backend.aidemo.service;

import com.aioverview.backend.aidemo.dao.FilterIpMapper;
import com.aioverview.backend.aidemo.model.FilterIp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 过滤IP服务类
 * 管理需要过滤的IP列表，支持增删改查，数据持久化到SQLite数据库
 */
@Service
public class FilterIpService {

    @Autowired
    private FilterIpMapper filterIpMapper;

    /**
     * 获取所有过滤IP
     * @return 过滤IP列表
     */
    public List<FilterIp> getAllFilterIps() {
        return filterIpMapper.selectAll();
    }

    /**
     * 根据ID获取过滤IP
     * @param id IP ID
     * @return 过滤IP
     */
    public FilterIp getFilterIpById(Long id) {
        return filterIpMapper.selectById(id);
    }

    /**
     * 获取所有IP地址字符串列表
     * @return IP地址列表
     */
    public List<String> getFilterIpAddresses() {
        return filterIpMapper.selectAllIps();
    }

    /**
     * 添加过滤IP
     * @param ip IP地址
     * @param description 描述
     * @return 新增的过滤IP
     */
    public FilterIp addFilterIp(String ip, String description) {
        // 检查IP是否已存在
        FilterIp existingIp = filterIpMapper.selectByIp(ip);
        if (existingIp != null) {
            throw new IllegalArgumentException("IP已存在: " + ip);
        }

        FilterIp filterIp = new FilterIp();
        filterIp.setIp(ip);
        filterIp.setDescription(description);
        filterIp.setCreatedAt(LocalDateTime.now());

        filterIpMapper.insert(filterIp);
        // 重新查询获取生成的ID
        return filterIpMapper.selectByIp(ip);
    }

    /**
     * 更新过滤IP
     * @param id IP ID
     * @param ip 新的IP地址
     * @param description 新的描述
     * @return 更新后的过滤IP
     */
    public FilterIp updateFilterIp(Long id, String ip, String description) {
        FilterIp existingIp = filterIpMapper.selectById(id);
        if (existingIp == null) {
            throw new IllegalArgumentException("IP不存在: " + id);
        }

        // 如果IP地址改变了，检查新IP是否已存在
        if (!existingIp.getIp().equals(ip)) {
            FilterIp ipWithSameAddress = filterIpMapper.selectByIp(ip);
            if (ipWithSameAddress != null && !ipWithSameAddress.getId().equals(id)) {
                throw new IllegalArgumentException("IP已存在: " + ip);
            }
        }

        existingIp.setIp(ip);
        existingIp.setDescription(description);
        filterIpMapper.update(existingIp);
        return existingIp;
    }

    /**
     * 删除过滤IP
     * @param id IP ID
     * @return 是否删除成功
     */
    public boolean deleteFilterIp(Long id) {
        int affectedRows = filterIpMapper.deleteById(id);
        return affectedRows > 0;
    }

    /**
     * 检查IP是否需要过滤
     * @param ipAddress IP地址
     * @return true表示需要过滤
     */
    public boolean shouldFilterIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return false;
        }

        List<String> filterIps = filterIpMapper.selectAllIps();
        return filterIps.stream()
                .anyMatch(filterIp -> isIpMatch(ipAddress, filterIp));
    }

    /**
     * 检查IP是否匹配
     * @param ipAddress 待检查的IP
     * @param filterIp 过滤规则（可以是单个IP或CIDR）
     * @return true表示匹配
     */
    private boolean isIpMatch(String ipAddress, String filterIp) {
        // 直接匹配
        if (ipAddress.equals(filterIp)) {
            return true;
        }

        // CIDR格式匹配
        if (filterIp.contains("/")) {
            return isIpInCidrRange(ipAddress, filterIp);
        }

        return false;
    }

    /**
     * 检查IP是否在CIDR范围内
     * @param ipAddress IP地址
     * @param cidr CIDR表示法
     * @return true表示在范围内
     */
    private boolean isIpInCidrRange(String ipAddress, String cidr) {
        try {
            String[] parts = cidr.split("/");
            String network = parts[0];
            int prefixLength = Integer.parseInt(parts[1]);

            byte[] ipBytes = ipToBytes(ipAddress);
            byte[] networkBytes = ipToBytes(network);

            int mask = 0xFFFFFFFF << (32 - prefixLength);

            int ipInt = bytesToInt(ipBytes);
            int networkInt = bytesToInt(networkBytes);

            return (ipInt & mask) == (networkInt & mask);
        } catch (Exception e) {
            return false;
        }
    }

    private byte[] ipToBytes(String ip) {
        String[] parts = ip.split("\\.");
        byte[] bytes = new byte[4];
        for (int i = 0; i < 4; i++) {
            bytes[i] = (byte) Integer.parseInt(parts[i]);
        }
        return bytes;
    }

    private int bytesToInt(byte[] bytes) {
        int result = 0;
        for (int i = 0; i < 4; i++) {
            result |= (bytes[i] & 0xFF) << (24 - (i * 8));
        }
        return result;
    }
}
