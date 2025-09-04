// File: src/main/java/com/nutribattle/dto/NutritionGoalResponse.java

package com.nutribattle.dto;

import com.nutribattle.entity.User;
import lombok.Data;

@Data
public class NutritionGoalResponse {
    private User.NutritionGoal nutritionGoal;
    private User.AgeGroup ageGroup;
    private Double bmi;
    private String bmiCategory;
    private Double recommendedCalories;
    private Double dailyCalorieGoal;
    private Double dailyProteinGoal;
    private Double dailyCarbGoal;
    private Double dailyFatGoal;
    private Double weight;
    private Double height;
}