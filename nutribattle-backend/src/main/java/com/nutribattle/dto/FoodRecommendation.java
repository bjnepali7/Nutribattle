package com.nutribattle.dto;

import com.nutribattle.entity.Food;
import lombok.Data;

import java.util.Map;

/**
 * DTO for food recommendations from KNN algorithm
 */
@Data
public class FoodRecommendation {
    private Food food;
    private Double similarityScore; // 0-1, higher is more similar
    private Map<String, Double> improvements; // Nutrient improvements in percentage
    private String reason; // Human-readable reason for recommendation
}