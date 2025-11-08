package com.aioverview.backend.aidemo.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.Objects;

/**
 * 日志切面类，用于记录所有HTTP请求信息
 */
@Aspect
@Component
@Slf4j
public class LogAspect {

    // 记录请求开始时间
    private ThreadLocal<Long> startTimeThreadLocal = new ThreadLocal<>();

    /**
     * 定义切点，拦截所有controller层的方法
     */
    @Pointcut("execution(* com.aioverview.backend.aidemo.controller.*.*(..))")
    public void webLogPointCut() {}

    /**
     * 请求方法执行前记录日志
     */
    @Before("webLogPointCut()")
    public void doBefore(JoinPoint joinPoint) {
        // 记录请求开始时间
        startTimeThreadLocal.set(System.currentTimeMillis());

        // 获取请求对象
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = Objects.requireNonNull(attributes).getRequest();

        // 获取方法签名信息
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        // 记录请求信息
        log.info("============= 请求开始 ============");
        log.info("请求URL: {}", request.getRequestURL().toString());
        // log.info("请求方法: {}", request.getMethod());
        log.info("请求IP: {}", request.getRemoteAddr());
        log.info("请求类方法: {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
        log.info("请求参数: {}", Arrays.toString(joinPoint.getArgs()));

        // 记录请求头信息
        /*log.info("请求头信息:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            log.info("    {}: {}", headerName, headerValue);
        }*/
    }

    /**
     * 请求方法执行后记录日志（无论是否发生异常）
     */
    @After("webLogPointCut()")
    public void doAfter(JoinPoint joinPoint) {
        // 计算请求处理时间
        long endTime = System.currentTimeMillis();
        long startTime = startTimeThreadLocal.get();
        long timeCost = endTime - startTime;

        // 清除ThreadLocal中的值，避免内存泄漏
        startTimeThreadLocal.remove();

        log.info("请求处理时间: {} ms ({} s)", timeCost, String.format("%.3f", timeCost / 1000.0));
        log.info("============= 请求结束 ============");
    }

    /**
     * 请求方法执行成功后记录返回值
     */
    @AfterReturning(returning = "result", pointcut = "webLogPointCut()")
    public void doAfterReturning(Object result) {
        // 记录响应结果，避免日志过大
        String resultStr = result != null ? result.toString() : "null";
        if (resultStr.length() > 100) {
            resultStr = resultStr.substring(0, 100) + "...";
        }
        log.info("响应结果: {}", resultStr);
    }

    /**
     * 请求方法执行异常时记录异常信息
     */
    @AfterThrowing(throwing = "exception", pointcut = "webLogPointCut()")
    public void doAfterThrowing(JoinPoint joinPoint, Exception exception) {
        log.error("请求处理异常:", exception);
        log.error("异常方法: {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
    }
}