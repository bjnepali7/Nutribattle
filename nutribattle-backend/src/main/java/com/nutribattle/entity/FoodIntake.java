package com.nutribattle.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity to track user's food intake
 */
@Entity
@Table(name = "food_intakes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodIntake {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;
    
    @Column(nullable = false)
    private Double quantity; // in grams
    
    @Column(nullable = false)
    private LocalDate intakeDate;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType mealType;
    
    // Calculated nutritional values based on quantity
    @Column(nullable = false)
    private Double calories;
    
    @Column(nullable = false)
    private Double protein;
    
    @Column(nullable = false)
    private Double fat;
    
    @Column(nullable = false)
    private Double carbs;
    
    @Column(nullable = false)
    private Double fiber;
    
    @Column(nullable = false)
    private Double sugar;
    
    @Column(nullable = false)
    private Double sodium;
    
    private String notes; // Optional user notes
    
    /**
     * Meal types
     */
    public enum MealType {
        BREAKFAST, LUNCH, DINNER, SNACK
    }
    
    /**
     * Calculate nutritional values based on quantity
     * Food nutrition is per 100g, so we need to adjust
     */
    public void calculateNutrition() {
        double factor = this.quantity / 100.0;
        
        this.calories = food.getCalories() * factor;
        this.protein = food.getProtein() * factor;
        this.fat = food.getFat() * factor;
        this.carbs = food.getCarbs() * factor;
        this.fiber = food.getFiber() * factor;
        this.sugar = food.getSugar() * factor;
        this.sodium = food.getSodium() * factor;
    }
}