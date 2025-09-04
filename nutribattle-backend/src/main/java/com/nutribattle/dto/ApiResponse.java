package com.nutribattle.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
/**
 * Generic API response
 */
@Data
public class ApiResponse {
    private boolean success;
    private String message;
    
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}