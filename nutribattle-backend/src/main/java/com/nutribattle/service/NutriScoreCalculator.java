package com.nutribattle.service;

import com.nutribattle.entity.Food;
import org.springframework.stereotype.Service;

/**
 * Service to calculate Nutri-Score for food items.
 * 
 * Nutri-Score Algorithm:
 * - Calculates negative points (0-40) for: energy, sugars, saturated fat, sodium
 * - Calculates positive points (0-15) for: fiber, protein, fruits/vegetables/nuts
 * - Final score = negative points - positive points
 * - Score ranges: A (≤-1), B (0-2), C (3-10), D (11-18), E (≥19)
 */
@Service
public class NutriScoreCalculator {
    
    /**
     * Calculate Nutri-Score for a food item
     * @param food The food item to calculate score for
     * @return Nutri-Score grade (A-E)
     */
    public String calculateNutriScore(Food food) {
        // Calculate per 100g (our data is already per 100g)
        int negativePoints = calculateNegativePoints(food);
        int positivePoints = calculatePositivePoints(food, negativePoints);
        
        // Final score = negative - positive
        int finalScore = negativePoints - positivePoints;
        
        // Convert score to grade
        return scoreToGrade(finalScore);
    }
    
    /**
     * Calculate negative points (0-40)
     * Based on: energy, sugars, saturated fat, sodium
     */
    private int calculateNegativePoints(Food food) {
        int points = 0;
        
        // Energy points (0-10) - calories in kJ (1 kcal = 4.184 kJ)
        double energyKJ = food.getCalories() * 4.184;
        if (energyKJ <= 335) points += 0;
        else if (energyKJ <= 670) points += 1;
        else if (energyKJ <= 1005) points += 2;
        else if (energyKJ <= 1340) points += 3;
        else if (energyKJ <= 1675) points += 4;
        else if (energyKJ <= 2010) points += 5;
        else if (energyKJ <= 2345) points += 6;
        else if (energyKJ <= 2680) points += 7;
        else if (energyKJ <= 3015) points += 8;
        else if (energyKJ <= 3350) points += 9;
        else points += 10;
        
        // Sugar points (0-10)
        double sugar = food.getSugar();
        if (sugar <= 4.5) points += 0;
        else if (sugar <= 9) points += 1;
        else if (sugar <= 13.5) points += 2;
        else if (sugar <= 18) points += 3;
        else if (sugar <= 22.5) points += 4;
        else if (sugar <= 27) points += 5;
        else if (sugar <= 31) points += 6;
        else if (sugar <= 36) points += 7;
        else if (sugar <= 40) points += 8;
        else if (sugar <= 45) points += 9;
        else points += 10;
        
        // Saturated fat points (0-10)
        double saturatedFat = food.getSaturatedFat();
        if (saturatedFat <= 1) points += 0;
        else if (saturatedFat <= 2) points += 1;
        else if (saturatedFat <= 3) points += 2;
        else if (saturatedFat <= 4) points += 3;
        else if (saturatedFat <= 5) points += 4;
        else if (saturatedFat <= 6) points += 5;
        else if (saturatedFat <= 7) points += 6;
        else if (saturatedFat <= 8) points += 7;
        else if (saturatedFat <= 9) points += 8;
        else if (saturatedFat <= 10) points += 9;
        else points += 10;
        
        // Sodium points (0-10) - mg
        double sodium = food.getSodium();
        if (sodium <= 90) points += 0;
        else if (sodium <= 180) points += 1;
        else if (sodium <= 270) points += 2;
        else if (sodium <= 360) points += 3;
        else if (sodium <= 450) points += 4;
        else if (sodium <= 540) points += 5;
        else if (sodium <= 630) points += 6;
        else if (sodium <= 720) points += 7;
        else if (sodium <= 810) points += 8;
        else if (sodium <= 900) points += 9;
        else points += 10;
        
        return points;
    }
    
    /**
     * Calculate positive points (0-15)
     * Based on: fiber, protein, fruits/vegetables/nuts percentage
     */
    private int calculatePositivePoints(Food food, int negativePoints) {
        int points = 0;
        
        // Fiber points (0-5)
        double fiber = food.getFiber();
        if (fiber <= 0.9) points += 0;
        else if (fiber <= 1.9) points += 1;
        else if (fiber <= 2.8) points += 2;
        else if (fiber <= 3.7) points += 3;
        else if (fiber <= 4.7) points += 4;
        else points += 5;
        
        // Protein points (0-5)
        // Only count protein if negative points < 11 OR if fruit/veg points >= 5
        double protein = food.getProtein();
        int fruitVegPoints = estimateFruitVegPoints(food);
        
        if (negativePoints < 11 || fruitVegPoints >= 5) {
            if (protein <= 1.6) points += 0;
            else if (protein <= 3.2) points += 1;
            else if (protein <= 4.8) points += 2;
            else if (protein <= 6.4) points += 3;
            else if (protein <= 8.0) points += 4;
            else points += 5;
        }
        
        // Fruits, vegetables, nuts points (0-5)
        // We estimate this based on food category and type
        points += fruitVegPoints;
        
        return points;
    }
    
    /**
     * Estimate fruit/vegetable/nut content based on food category
     * This is a simplified approach for our dataset
     */
    private int estimateFruitVegPoints(Food food) {
        String category = food.getCategory().toLowerCase();
        String name = food.getName().toLowerCase();
        
        // Direct fruit/vegetable categories
        if (category.contains("fruit") || category.contains("vegetable")) {
            return 5; // Assume 80-100% content
        }
        
        // Nuts and seeds
        if (category.contains("nut") || category.contains("seed") || 
            name.contains("almond") || name.contains("cashew") || 
            name.contains("walnut") || name.contains("pista")) {
            return 5;
        }
        
        // Legumes get partial points
        if (category.contains("legume") || category.contains("lentil") ||
            name.contains("dal") || name.contains("bean")) {
            return 3;
        }
        
        // Soups and curries with vegetables
        if ((category.contains("soup") || category.contains("curry")) && 
            (name.contains("vegetable") || name.contains("saag") || 
             name.contains("tarkari"))) {
            return 2;
        }
        
        // Pickles made from vegetables
        if (category.contains("pickle") && food.getType().equals("Traditional")) {
            return 2;
        }
        
        // Default: no fruit/veg content
        return 0;
    }
    
    /**
     * Convert final score to Nutri-Score grade
     */
    private String scoreToGrade(int score) {
        if (score <= -1) return "A";
        else if (score <= 2) return "B";
        else if (score <= 10) return "C";
        else if (score <= 18) return "D";
        else return "E";
    }
    
    /**
     * Get color code for Nutri-Score grade
     */
    public String getNutriScoreColor(String grade) {
        switch (grade) {
            case "A": return "#038141"; // Dark green
            case "B": return "#85BB2F"; // Light green
            case "C": return "#FECB02"; // Yellow
            case "D": return "#EE8100"; // Orange
            case "E": return "#E63E11"; // Red
            default: return "#808080"; // Gray
        }
    }
    
    /**
     * Get description for Nutri-Score grade
     */
    public String getNutriScoreDescription(String grade) {
        switch (grade) {
            case "A": return "Excellent nutritional quality";
            case "B": return "Good nutritional quality";
            case "C": return "Average nutritional quality";
            case "D": return "Poor nutritional quality";
            case "E": return "Very poor nutritional quality";
            default: return "Unknown nutritional quality";
        }
    }
}