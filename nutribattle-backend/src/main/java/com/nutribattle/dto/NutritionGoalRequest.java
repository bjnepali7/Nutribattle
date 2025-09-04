// File: src/main/java/com/nutribattle/dto/NutritionGoalRequest.java

package com.nutribattle.dto;

import com.nutribattle.entity.User;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NutritionGoalRequest {
    
    @NotNull(message = "Nutrition goal is required")
    private User.NutritionGoal nutritionGoal;
    
    @NotNull(message = "Age group is required")
    private User.AgeGroup ageGroup;
    
    private Double weight;
    private Double height;
}