// File: src/main/java/com/nutribattle/dto/FoodIntakeResponse.java

package com.nutribattle.dto;

import com.nutribattle.entity.FoodIntake;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FoodIntakeResponse {
    private Long id;
    private Long foodId;
    private String foodName;
    private String foodCategory;
    private Double quantity;
    private FoodIntake.MealType mealType;
    private LocalDate intakeDate;
    private Double calories;
    private Double protein;
    private Double fat;
    private Double carbs;
    private Double fiber;
    private Double sugar;
    private Double sodium;
    private String notes;
    private String nutriScore;
}