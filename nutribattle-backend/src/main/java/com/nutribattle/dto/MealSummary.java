// File: src/main/java/com/nutribattle/dto/MealSummary.java

package com.nutribattle.dto;

import com.nutribattle.entity.FoodIntake;
import lombok.Data;

@Data
public class MealSummary {
    private FoodIntake.MealType mealType;
    private Double calories = 0.0;
    private Double protein = 0.0;
    private Double fat = 0.0;
    private Double carbs = 0.0;
}