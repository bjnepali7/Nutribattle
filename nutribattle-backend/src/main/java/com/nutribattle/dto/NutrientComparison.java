package com.nutribattle.dto;

import lombok.Data;

import java.util.List;

/**
 * DTO for comparing a specific nutrient across multiple foods
 */
@Data
public class NutrientComparison {
    private String nutrientName;
    private String unit;
    private List<FoodNutrientValue> values;
    
    /**
     * Inner class to hold food-nutrient value mapping
     */
    @Data
    public static class FoodNutrientValue {
        private Long foodId;
        private String foodName;
        private Double value;
        private boolean isBest;
        private boolean isWorst;
        
        public FoodNutrientValue(Long foodId, String foodName, Double value) {
            this.foodId = foodId;
            this.foodName = foodName;
            this.value = value;
            this.isBest = false;
            this.isWorst = false;
        }
    }
}