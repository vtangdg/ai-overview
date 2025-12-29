package com.aioverview.backend.aidemo.service;

import jakarta.validation.constraints.NotBlank;

/**
 * @author
 * @date 2025/12/29
 */
public record Question(
        @NotBlank String question) { }


