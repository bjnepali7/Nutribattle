// File: src/main/java/com/nutribattle/service/KnnRecommendationService.java
// FIXED: Properly handle null values in improvements calculation

package com.nutribattle.service;

import com.nutribattle.dto.FoodRecommendation;
import com.nutribattle.entity.Food;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Manual implementation of K-Nearest Neighbors (KNN) algorithm
 * for recommending similar food alternatives
 * Updated: Fixed null handling and division by zero errors
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KnnRecommendationService {
    
    private final FoodService foodService;
    private final NutriScoreCalculator nutriScoreCalculator;
    
    /**
     * Enum for recommendation modes
     */
    public enum RecommendationMode {
        SAME_CATEGORY,      // Only recommend foods from the same category
        OPPOSITE_CATEGORY,  // Only recommend foods from opposite category (Traditional ↔ Modern)
        MIXED              // Recommend from both categories
    }
    
    /**
     * Get similar food alternatives using KNN
     * @param foodId The food to find alternatives for
     * @param k Number of recommendations (default 5)
     * @param mode The recommendation mode for category filtering
     * @return List of recommended foods
     */
    public List<FoodRecommendation> getHealthierAlternatives(Long foodId, int k, RecommendationMode mode) {
        // Get the target food
        Food targetFood = foodService.getFoodById(foodId);
        if (targetFood == null) {
            throw new IllegalArgumentException("Food not found");
        }
        
        log.info("Finding recommendations for: {} (Type: {}, Category: {})", 
                targetFood.getName(), targetFood.getType(), targetFood.getCategory());
        
        // Get all foods
        List<Food> allFoods = foodService.getAllFoods();
        
        // Remove the target food from the list
        allFoods = allFoods.stream()
                .filter(f -> !f.getId().equals(foodId))
                .collect(Collectors.toList());
        
        // Filter foods based on mode
        allFoods = filterFoodsByMode(allFoods, targetFood, mode);
        
        log.info("After filtering by mode {}: {} foods remaining", mode, allFoods.size());
        
        // Calculate distances and create recommendations
        List<FoodDistance> distances = new ArrayList<>();
        
        for (Food food : allFoods) {
            double distance = calculateDistance(targetFood, food);
            distances.add(new FoodDistance(food, distance));
        }
        
        // Sort by distance (ascending) - closest first
        distances.sort(Comparator.comparingDouble(FoodDistance::getDistance));
        
        // Get top K recommendations
        List<FoodRecommendation> recommendations = new ArrayList<>();
        
        for (int i = 0; i < Math.min(k, distances.size()); i++) {
            FoodDistance fd = distances.get(i);
            FoodRecommendation rec = createRecommendation(fd.getFood(), targetFood, fd.getDistance(), mode);
            recommendations.add(rec);
            
            log.debug("Added recommendation: {} (distance: {})", 
                    fd.getFood().getName(), fd.getDistance());
        }
        
        log.info("Returning {} recommendations", recommendations.size());
        return recommendations;
    }
    
    /**
     * Overloaded method for backward compatibility (uses MIXED mode by default)
     */
    public List<FoodRecommendation> getHealthierAlternatives(Long foodId, int k) {
        return getHealthierAlternatives(foodId, k, RecommendationMode.MIXED);
    }
    
    /**
     * Filter foods based on recommendation mode
     */
    private List<Food> filterFoodsByMode(List<Food> foods, Food targetFood, RecommendationMode mode) {
        switch (mode) {
            case SAME_CATEGORY:
                // Return only foods from the same category as target
                return foods.stream()
                    .filter(f -> f.getCategory().equals(targetFood.getCategory()))
                    .collect(Collectors.toList());
                
            case OPPOSITE_CATEGORY:
                // Return foods from opposite TYPE (Traditional ↔ Modern)
                String oppositeType = targetFood.getType().equals("Traditional") ? 
                    "Modern" : "Traditional";
                return foods.stream()
                    .filter(f -> f.getType().equals(oppositeType))
                    .collect(Collectors.toList());
                
            case MIXED:
            default:
                // Return all foods
                return foods;
        }
    }
    
    /**
     * Calculate Euclidean distance between two foods based on nutritional values
     * Using normalized values (0-1) for each nutrient
     */
    private double calculateDistance(Food food1, Food food2) {
        double[] vector1 = getNormalizedNutritionalVector(food1);
        double[] vector2 = getNormalizedNutritionalVector(food2);
        
        double sumSquaredDifferences = 0;
        for (int i = 0; i < vector1.length; i++) {
            double diff = vector1[i] - vector2[i];
            sumSquaredDifferences += diff * diff;
        }
        
        return Math.sqrt(sumSquaredDifferences);
    }
    
    /**
     * Get normalized nutritional vector for a food (0-1 scale)
     * FIXED: Handle null values with proper defaults
     */
    private double[] getNormalizedNutritionalVector(Food food) {
        return new double[] {
            safeDouble(food.getCalories(), 0.0) / 1000.0,       // Max ~1000 calories per 100g
            safeDouble(food.getProtein(), 0.0) / 50.0,          // Max ~50g protein per 100g
            safeDouble(food.getFat(), 0.0) / 100.0,             // Max ~100g fat per 100g
            safeDouble(food.getSaturatedFat(), 0.0) / 50.0,     // Max ~50g saturated fat per 100g
            safeDouble(food.getCarbs(), 0.0) / 100.0,           // Max ~100g carbs per 100g
            safeDouble(food.getSugar(), 0.0) / 100.0,           // Max ~100g sugar per 100g
            safeDouble(food.getFiber(), 0.0) / 50.0,            // Max ~50g fiber per 100g
            safeDouble(food.getSodium(), 0.0) / 3000.0          // Max ~3000mg sodium per 100g
        };
    }
    
    /**
     * Helper method to safely convert Double to double with default value
     */
    private double safeDouble(Double value, double defaultValue) {
        return value != null ? value : defaultValue;
    }
    
    /**
     * Create a recommendation with detailed comparison
     * FIXED: Safe calculation with null checks and division by zero protection
     */
    private FoodRecommendation createRecommendation(Food recommendedFood, Food targetFood, double distance, RecommendationMode mode) {
        FoodRecommendation rec = new FoodRecommendation();
        rec.setFood(recommendedFood);
        rec.setSimilarityScore(1.0 / (1.0 + distance)); // Convert distance to similarity (0-1)
        
        // Calculate improvements/differences with null safety
        Map<String, Double> improvements = new HashMap<>();
        
        // Calculate differences for all nutrients - FIXED with null checks
        // Calories
        if (targetFood.getCalories() != null && recommendedFood.getCalories() != null && targetFood.getCalories() > 0) {
            if (recommendedFood.getCalories() < targetFood.getCalories()) {
                improvements.put("calories", 
                    ((targetFood.getCalories() - recommendedFood.getCalories()) / targetFood.getCalories()) * 100);
            }
        }
        
        // Sugar
        if (targetFood.getSugar() != null && recommendedFood.getSugar() != null && targetFood.getSugar() > 0) {
            if (recommendedFood.getSugar() < targetFood.getSugar()) {
                improvements.put("sugar", 
                    ((targetFood.getSugar() - recommendedFood.getSugar()) / targetFood.getSugar()) * 100);
            }
        }
        
        // Saturated Fat
        if (targetFood.getSaturatedFat() != null && recommendedFood.getSaturatedFat() != null && targetFood.getSaturatedFat() > 0) {
            if (recommendedFood.getSaturatedFat() < targetFood.getSaturatedFat()) {
                improvements.put("saturatedFat", 
                    ((targetFood.getSaturatedFat() - recommendedFood.getSaturatedFat()) / targetFood.getSaturatedFat()) * 100);
            }
        }
        
        // Sodium
        if (targetFood.getSodium() != null && recommendedFood.getSodium() != null && targetFood.getSodium() > 0) {
            if (recommendedFood.getSodium() < targetFood.getSodium()) {
                improvements.put("sodium", 
                    ((targetFood.getSodium() - recommendedFood.getSodium()) / targetFood.getSodium()) * 100);
            }
        }
        
        // Positive improvements (higher is better)
        // Protein
        if (targetFood.getProtein() != null && recommendedFood.getProtein() != null && targetFood.getProtein() > 0) {
            if (recommendedFood.getProtein() > targetFood.getProtein()) {
                improvements.put("protein", 
                    ((recommendedFood.getProtein() - targetFood.getProtein()) / targetFood.getProtein()) * 100);
            }
        }
        
        // Fiber
        if (targetFood.getFiber() != null && recommendedFood.getFiber() != null && targetFood.getFiber() > 0) {
            if (recommendedFood.getFiber() > targetFood.getFiber()) {
                improvements.put("fiber", 
                    ((recommendedFood.getFiber() - targetFood.getFiber()) / targetFood.getFiber()) * 100);
            }
        }
        
        rec.setImprovements(improvements);
        
        // Generate reason for recommendation
        rec.setReason(generateRecommendationReason(recommendedFood, targetFood, improvements, mode));
        
        return rec;
    }
    
    /**
     * Generate human-readable reason for recommendation
     * FIXED: Added null checks for NutriScore comparison
     */
    private String generateRecommendationReason(Food recommended, Food target, Map<String, Double> improvements, RecommendationMode mode) {
        StringBuilder reason = new StringBuilder();
        
        // Add mode-specific context
        if (mode == RecommendationMode.SAME_CATEGORY) {
            reason.append("Similar food from same category (").append(recommended.getCategory()).append("). ");
        } else if (mode == RecommendationMode.OPPOSITE_CATEGORY) {
            reason.append("Alternative from ").append(recommended.getType()).append(" foods. ");
        }
        
        // Nutri-Score comparison with null check
        if (recommended.getNutriScore() != null && target.getNutriScore() != null) {
            String comparison = recommended.getNutriScore().compareTo(target.getNutriScore()) < 0 ? "better" : 
                               recommended.getNutriScore().equals(target.getNutriScore()) ? "same" : "different";
            reason.append(String.format("Has %s Nutri-Score (%s vs %s). ", 
                comparison, recommended.getNutriScore(), target.getNutriScore()));
        }
        
        // Top differences (not just improvements)
        List<String> topDifferences = improvements.entrySet().stream()
            .filter(e -> Math.abs(e.getValue()) > 10) // At least 10% difference
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(2)
            .map(e -> {
                String nutrient = e.getKey();
                Double value = e.getValue();
                switch (nutrient) {
                    case "calories": 
                        return String.format("%.0f%% %s calories", Math.abs(value), value > 0 ? "fewer" : "more");
                    case "sugar": 
                        return String.format("%.0f%% %s sugar", Math.abs(value), value > 0 ? "less" : "more");
                    case "saturatedFat": 
                        return String.format("%.0f%% %s saturated fat", Math.abs(value), value > 0 ? "less" : "more");
                    case "sodium": 
                        return String.format("%.0f%% %s sodium", Math.abs(value), value > 0 ? "less" : "more");
                    case "protein": 
                        return String.format("%.0f%% %s protein", Math.abs(value), value > 0 ? "more" : "less");
                    case "fiber": 
                        return String.format("%.0f%% %s fiber", Math.abs(value), value > 0 ? "more" : "less");
                    default: 
                        return "";
                }
            })
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
        
        if (!topDifferences.isEmpty()) {
            reason.append("Contains ").append(String.join(" and ", topDifferences)).append(".");
        }
        
        return reason.toString().trim();
    }
    
    /**
     * Inner class to hold food with distance
     */
    private static class FoodDistance {
        private final Food food;
        private final double distance;
        
        public FoodDistance(Food food, double distance) {
            this.food = food;
            this.distance = distance;
        }
        
        public Food getFood() { 
            return food; 
        }
        
        public double getDistance() { 
            return distance; 
        }
    }
}