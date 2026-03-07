package com.aioverview.backend.aidemo.dao;

import com.aioverview.backend.aidemo.model.FilterIp;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 过滤IP Mapper接口
 */
@Mapper
public interface FilterIpMapper {

    /**
     * 获取所有过滤IP
     * @return 过滤IP列表
     */
    List<FilterIp> selectAll();

    /**
     * 根据ID获取过滤IP
     * @param id IP ID
     * @return 过滤IP
     */
    FilterIp selectById(@Param("id") Long id);

    /**
     * 根据IP地址获取过滤IP
     * @param ip IP地址
     * @return 过滤IP
     */
    FilterIp selectByIp(@Param("ip") String ip);

    /**
     * 新增过滤IP
     * @param filterIp 过滤IP
     * @return 影响行数
     */
    int insert(FilterIp filterIp);

    /**
     * 更新过滤IP
     * @param filterIp 过滤IP
     * @return 影响行数
     */
    int update(FilterIp filterIp);

    /**
     * 删除过滤IP
     * @param id IP ID
     * @return 影响行数
     */
    int deleteById(@Param("id") Long id);

    /**
     * 获取所有IP地址列表
     * @return IP地址列表
     */
    List<String> selectAllIps();
}
