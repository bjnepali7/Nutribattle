// File: src/main/java/com/nutribattle/service/CalorieKnnService.java
package com.nutribattle.service;

import com.nutribattle.dto.CalorieKnnRecommendation;
import com.nutribattle.entity.Food;
import com.nutribattle.entity.User;
import com.nutribattle.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalorieKnnService {
    
    private final FoodRepository foodRepository;
    
    /**
     * Get KNN recommendations based on user's calorie goal
     */
    public CalorieKnnRecommendation getCalorieBasedRecommendations(User user, String mealType) {
        CalorieKnnRecommendation recommendation = new CalorieKnnRecommendation();
        
        // Calculate target calories for this meal using user's method
        Double dailyCalories = user.getRecommendedCalories();
        Double mealCalories = calculateMealCalories(dailyCalories, mealType);
        recommendation.setTargetCalories(mealCalories);
        
        // Get all foods
        List<Food> allFoods = foodRepository.findAll();
        
        // Calculate distance and create matches
        List<CalorieKnnRecommendation.FoodMatch> matches = new ArrayList<>();
        
        for (Food food : allFoods) {
            CalorieKnnRecommendation.FoodMatch match = createFoodMatch(food, mealCalories);
            matches.add(match);
        }
        
        // Sort by match score (highest first) and take top 5
        matches = matches.stream()
                .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
                .limit(5)
                .collect(Collectors.toList());
        
        recommendation.setRecommendedFoods(matches);
        recommendation.setRecommendationReason(generateRecommendationReason(user, mealType));
        
        return recommendation;
    }
    
    /**
     * Calculate calories for specific meal type
     */
    private Double calculateMealCalories(Double dailyCalories, String mealType) {
        switch (mealType.toUpperCase()) {
            case "BREAKFAST":
                return dailyCalories * 0.25; // 25% of daily calories
            case "LUNCH":
                return dailyCalories * 0.35; // 35% of daily calories
            case "DINNER":
                return dailyCalories * 0.30; // 30% of daily calories
            case "SNACK":
                return dailyCalories * 0.10; // 10% of daily calories
            default:
                return dailyCalories * 0.25;
        }
    }
    
    /**
     * Create food match with KNN scoring
     */
    private CalorieKnnRecommendation.FoodMatch createFoodMatch(Food food, Double targetCalories) {
        CalorieKnnRecommendation.FoodMatch match = new CalorieKnnRecommendation.FoodMatch();
        match.setFood(food);
        
        // Calculate optimal quantity (grams) to meet target calories
        Double quantity = (targetCalories / food.getCalories()) * 100;
        match.setQuantity(Math.round(quantity * 10.0) / 10.0); // Round to 1 decimal
        
        // Calculate actual calories with this quantity
        Double actualCalories = (quantity / 100) * food.getCalories();
        Double difference = Math.abs(actualCalories - targetCalories);
        match.setCaloriesDifference(difference);
        
        // Calculate match score (0-100)
        // Score based on: calorie match, protein content, fiber content, sugar (lower is better)
        double calorieScore = Math.max(0, 100 - (difference / targetCalories * 100));
        double proteinScore = Math.min(30, food.getProtein() * 2); // Max 30 points
        double fiberScore = Math.min(20, food.getFiber() * 4); // Max 20 points
        double sugarPenalty = Math.min(20, food.getSugar()); // Penalty for sugar
        
        double totalScore = calorieScore * 0.5 + proteinScore + fiberScore - sugarPenalty;
        match.setMatchScore(Math.max(0, Math.min(100, totalScore)));
        
        // Generate reason
        match.setReason(generateMatchReason(food, quantity, actualCalories, targetCalories));
        
        return match;
    }
    
    /**
     * Generate match reason
     */
    private String generateMatchReason(Food food, Double quantity, Double actualCalories, Double targetCalories) {
        StringBuilder reason = new StringBuilder();
        reason.append(String.format("%.0fg provides %.0f calories", quantity, actualCalories));
        
        if (food.getProtein() > 10) {
            reason.append(", high in protein");
        }
        if (food.getFiber() > 5) {
            reason.append(", good fiber content");
        }
        if (food.getSugar() < 5) {
            reason.append(", low sugar");
        }
        
        return reason.toString();
    }
    
    /**
     * Generate overall recommendation reason
     */
    private String generateRecommendationReason(User user, String mealType) {
        StringBuilder reason = new StringBuilder();
        reason.append("Based on your ");
        
        if (user.getNutritionGoal() == User.NutritionGoal.WEIGHT_GAIN) {
            reason.append("weight gain goal");
        } else if (user.getNutritionGoal() == User.NutritionGoal.WEIGHT_LOSS) {
            reason.append("weight loss goal");
        } else {
            reason.append("maintenance goal");
        }
        
        reason.append(" and ").append(user.getAgeGroup().toString().toLowerCase().replace("_", " "));
        reason.append(" age group, these foods match your ");
        reason.append(mealType.toLowerCase()).append(" calorie target.");
        
        return reason.toString();
    }
}