package com.nutribattle.service;

import com.nutribattle.dto.ComparisonResult;
import com.nutribattle.dto.NutrientComparison;
import com.nutribattle.entity.Food;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for comparing multiple food items
 */
@Service
@RequiredArgsConstructor
public class ComparisonService {
    
    private final FoodService foodService;
    private final NutriScoreCalculator nutriScoreCalculator;
    
    /**
     * Compare multiple food items
     * @param foodIds List of food IDs to compare
     * @return Comparison result with detailed analysis
     */
    public ComparisonResult compareFoods(List<Long> foodIds) {
        // Get food items
        List<Food> foods = new ArrayList<>();
        for (Long id : foodIds) {
            Food food = foodService.getFoodById(id);
            if (food != null) {
                foods.add(food);
            }
        }
        
        if (foods.isEmpty()) {
            throw new IllegalArgumentException("No valid foods found for comparison");
        }
        
        // Create comparison result
        ComparisonResult result = new ComparisonResult();
        result.setFoods(foods);
        
        // Compare nutrients
        result.setNutrientComparisons(compareNutrients(foods));
        
        // Find healthiest option
        result.setHealthiestFood(findHealthiestFood(foods));
        
        // Add recommendations
        result.setRecommendations(generateRecommendations(foods));
        
        return result;
    }
    
    /**
     * Compare nutrients across foods
     */
    private List<NutrientComparison> compareNutrients(List<Food> foods) {
        List<NutrientComparison> comparisons = new ArrayList<>();
        
        // Calories
        comparisons.add(createNutrientComparison("Calories", "kcal", foods, 
            food -> food.getCalories(), true)); // Lower is better
        
        // Protein
        comparisons.add(createNutrientComparison("Protein", "g", foods, 
            food -> food.getProtein(), false)); // Higher is better
        
        // Total Fat
        comparisons.add(createNutrientComparison("Total Fat", "g", foods, 
            food -> food.getFat(), true));
        
        // Saturated Fat
        comparisons.add(createNutrientComparison("Saturated Fat", "g", foods, 
            food -> food.getSaturatedFat(), true));
        
        // Carbohydrates
        comparisons.add(createNutrientComparison("Carbohydrates", "g", foods, 
            food -> food.getCarbs(), null)); // Neutral
        
        // Sugar
        comparisons.add(createNutrientComparison("Sugar", "g", foods, 
            food -> food.getSugar(), true));
        
        // Fiber
        comparisons.add(createNutrientComparison("Fiber", "g", foods, 
            food -> food.getFiber(), false));
        
        // Sodium
        comparisons.add(createNutrientComparison("Sodium", "mg", foods, 
            food -> food.getSodium(), true));
        
        return comparisons;
    }
    
    /**
     * Create a nutrient comparison
     */
    private NutrientComparison createNutrientComparison(String nutrientName, String unit,
            List<Food> foods, java.util.function.Function<Food, Double> valueExtractor,
            Boolean lowerIsBetter) {
        
        NutrientComparison comparison = new NutrientComparison();
        comparison.setNutrientName(nutrientName);
        comparison.setUnit(unit);
        
        List<NutrientComparison.FoodNutrientValue> values = new ArrayList<>();
        double minValue = Double.MAX_VALUE;
        double maxValue = Double.MIN_VALUE;
        
        // Extract values and find min/max
        for (Food food : foods) {
            double value = valueExtractor.apply(food);
            values.add(new NutrientComparison.FoodNutrientValue(
                food.getId(), food.getName(), value
            ));
            
            minValue = Math.min(minValue, value);
            maxValue = Math.max(maxValue, value);
        }
        
        // Mark best and worst
        for (NutrientComparison.FoodNutrientValue fnv : values) {
            if (lowerIsBetter != null) {
                if (lowerIsBetter) {
                    fnv.setBest(fnv.getValue() == minValue);
                    fnv.setWorst(fnv.getValue() == maxValue);
                } else {
                    fnv.setBest(fnv.getValue() == maxValue);
                    fnv.setWorst(fnv.getValue() == minValue);
                }
            }
        }
        
        comparison.setValues(values);
        return comparison;
    }
    
    /**
     * Find the healthiest food based on Nutri-Score
     */
    private Food findHealthiestFood(List<Food> foods) {
        Food healthiest = foods.get(0);
        String bestScore = healthiest.getNutriScore();
        
        for (Food food : foods) {
            if (isNutriScoreBetter(food.getNutriScore(), bestScore)) {
                healthiest = food;
                bestScore = food.getNutriScore();
            }
        }
        
        return healthiest;
    }
    
    /**
     * Check if score1 is better than score2
     */
    private boolean isNutriScoreBetter(String score1, String score2) {
        return score1.compareTo(score2) < 0; // A < B < C < D < E
    }
    
    /**
     * Generate recommendations based on comparison
     */
    private List<String> generateRecommendations(List<Food> foods) {
        List<String> recommendations = new ArrayList<>();
        
        // Find food with highest sugar
        Food highestSugar = foods.stream()
            .max((f1, f2) -> Double.compare(f1.getSugar(), f2.getSugar()))
            .orElse(null);
        
        if (highestSugar != null && highestSugar.getSugar() > 15) {
            recommendations.add(String.format(
                "%s has high sugar content (%.1fg). Consider limiting portion size.",
                highestSugar.getName(), highestSugar.getSugar()
            ));
        }
        
        // Find food with highest sodium
        Food highestSodium = foods.stream()
            .max((f1, f2) -> Double.compare(f1.getSodium(), f2.getSodium()))
            .orElse(null);
        
        if (highestSodium != null && highestSodium.getSodium() > 600) {
            recommendations.add(String.format(
                "%s has high sodium content (%.0fmg). This may not be suitable for those watching salt intake.",
                highestSodium.getName(), highestSodium.getSodium()
            ));
        }
        
        // Find food with best fiber
        Food highestFiber = foods.stream()
            .max((f1, f2) -> Double.compare(f1.getFiber(), f2.getFiber()))
            .orElse(null);
        
        if (highestFiber != null && highestFiber.getFiber() > 3) {
            recommendations.add(String.format(
                "%s is a good source of fiber (%.1fg), which aids digestion.",
                highestFiber.getName(), highestFiber.getFiber()
            ));
        }
        
        // Traditional vs Modern recommendation
        boolean hasTraditional = foods.stream().anyMatch(f -> "Traditional".equals(f.getType()));
        boolean hasModern = foods.stream().anyMatch(f -> "Modern".equals(f.getType()));
        
        if (hasTraditional && hasModern) {
            Food bestTraditional = foods.stream()
                .filter(f -> "Traditional".equals(f.getType()))
                .min((f1, f2) -> f1.getNutriScore().compareTo(f2.getNutriScore()))
                .orElse(null);
            
            if (bestTraditional != null && bestTraditional.getNutriScore().compareTo("C") <= 0) {
                recommendations.add(String.format(
                    "Traditional food option '%s' has good nutritional value with Nutri-Score %s.",
                    bestTraditional.getName(), bestTraditional.getNutriScore()
                ));
            }
        }
        
        return recommendations;
    }
}