// File: src/main/java/com/nutribattle/dto/DailyNutritionSummary.java

package com.nutribattle.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class DailyNutritionSummary {
    private LocalDate date;
    
    // Goals
    private Double calorieGoal;
    private Double proteinGoal;
    private Double fatGoal;
    private Double carbGoal;
    
    // Totals
    private Double totalCalories = 0.0;
    private Double totalProtein = 0.0;
    private Double totalFat = 0.0;
    private Double totalCarbs = 0.0;
    private Double totalFiber = 0.0;
    private Double totalSugar = 0.0;
    private Double totalSodium = 0.0;
    
    // Percentages
    private Double caloriePercentage;
    private Double proteinPercentage;
    private Double fatPercentage;
    private Double carbPercentage;
    
    // Breakdown
    private List<MealSummary> mealBreakdown;
    private List<FoodIntakeResponse> foodItems;
}