// File: src/main/java/com/nutribattle/dto/CalorieKnnRecommendation.java

package com.nutribattle.dto;

import com.nutribattle.entity.Food;
import lombok.Data;

import java.util.List;

@Data
public class CalorieKnnRecommendation {
    private Double targetCalories;
    private List<FoodMatch> recommendedFoods;
    private String recommendationReason;
    
    @Data
    public static class FoodMatch {
        private Food food;
        private Double matchScore; // 0-100
        private Double caloriesDifference;
        private Double quantity; // Suggested quantity in grams
        private String reason;
    }
}