package com.nutribattle.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity class representing a food item in the database.
 * This maps to the 'foods' table in MySQL.
 */
@Entity
@Table(name = "foods")
@Data  // Lombok annotation that generates getters, setters, toString, equals, hashCode
@NoArgsConstructor  // Generates no-args constructor
@AllArgsConstructor  // Generates all-args constructor
public class Food {
    
    @Id  // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;
    
    @Column(nullable = false)  // Cannot be null
    private String name;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private String type;  // "Traditional" or "Modern"
    
    // Nutritional values per 100g
    @Column(nullable = false)
    private Double calories;
    
    @Column(nullable = false)
    private Double protein;
    
    @Column(nullable = false)
    private Double fat;
    
    @Column(name = "saturated_fat", nullable = false)
    private Double saturatedFat;
    
    @Column(nullable = false)
    private Double carbs;
    
    @Column(nullable = false)
    private Double sugar;
    
    @Column(nullable = false)
    private Double fiber;
    
    @Column(nullable = false)
    private Double sodium;
    
    @Column(name = "vitamin_a")
    private Double vitaminA;
    
    @Column(name = "vitamin_c")
    private Double vitaminC;
    
    private Double calcium;
    
    private Double iron;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")  // For longer text
    private String description;
    
    // Calculated Nutri-Score (A-E)
    @Transient  // Not stored in database, calculated at runtime
    private String nutriScore;
    
    // Constructor for CSV import
    public Food(String name, String category, String type, Double calories, 
                Double protein, Double fat, Double saturatedFat, Double carbs, 
                Double sugar, Double fiber, Double sodium, Double vitaminA, 
                Double vitaminC, Double calcium, Double iron, String imageUrl, 
                String description) {
        this.name = name;
        this.category = category;
        this.type = type;
        this.calories = calories;
        this.protein = protein;
        this.fat = fat;
        this.saturatedFat = saturatedFat;
        this.carbs = carbs;
        this.sugar = sugar;
        this.fiber = fiber;
        this.sodium = sodium;
        this.vitaminA = vitaminA;
        this.vitaminC = vitaminC;
        this.calcium = calcium;
        this.iron = iron;
        this.imageUrl = imageUrl;
        this.description = description;
    }
}