package com.aioverview.backend.aidemo.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.Map;

/**
 * 全局异常处理器
 * 用于处理各种异常，包括404等不存在的API请求
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 处理404 - 请求不存在的API
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<?> handleNoHandlerFound(NoHandlerFoundException ex, HttpServletRequest request) {
        log.warn("============= 请求不存在的API ============");
        log.warn("请求URL: {}", request.getRequestURL().toString());
        log.warn("请求方法: {}", request.getMethod());
        log.warn("请求IP: {}", request.getRemoteAddr());
        log.warn("错误信息: {}", ex.getMessage());
        log.warn("============= 请求结束 ============");

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "code", 404,
                        "error", "API不存在",
                        "message", "请求的资源不存在: " + request.getRequestURI()
                ));
    }

    /**
     * 处理其他所有异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex, HttpServletRequest request) {
        log.error("============= 请求异常 ============");
        log.error("请求URL: {}", request.getRequestURL().toString());
        log.error("请求方法: {}", request.getMethod());
        log.error("请求IP: {}", request.getRemoteAddr());
        log.error("异常类型: {}", ex.getClass().getName());
        log.error("异常信息: {}", ex.getMessage());
        log.error("============= 请求结束 ============");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "code", 500,
                        "error", "服务器内部错误",
                        "message", ex.getMessage()
                ));
    }
}
