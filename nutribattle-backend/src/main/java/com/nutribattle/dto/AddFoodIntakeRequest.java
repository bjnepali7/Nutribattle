// File: src/main/java/com/nutribattle/dto/AddFoodIntakeRequest.java

package com.nutribattle.dto;

import com.nutribattle.entity.FoodIntake;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AddFoodIntakeRequest {
    
    @NotNull(message = "Food ID is required")
    private Long foodId;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity; // in grams
    
    @NotNull(message = "Meal type is required")
    private FoodIntake.MealType mealType;
    
    private LocalDate intakeDate; // Optional, defaults to today
    
    private String notes; // Optional
}