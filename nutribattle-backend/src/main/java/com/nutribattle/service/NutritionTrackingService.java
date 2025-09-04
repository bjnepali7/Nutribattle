// File: src/main/java/com/nutribattle/service/NutritionTrackingService.java

package com.nutribattle.service;

import com.nutribattle.dto.*;
import com.nutribattle.entity.Food;
import com.nutribattle.entity.FoodIntake;
import com.nutribattle.entity.User;
import com.nutribattle.repository.FoodIntakeRepository;
import com.nutribattle.repository.FoodRepository;
import com.nutribattle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NutritionTrackingService {
    
    private final FoodIntakeRepository foodIntakeRepository;
    private final FoodRepository foodRepository;
    private final UserRepository userRepository;
    private final NutriScoreCalculator nutriScoreCalculator;
    
    /**
     * Add food intake for a user
     */
    @Transactional
    public FoodIntakeResponse addFoodIntake(User user, AddFoodIntakeRequest request) {
        // Get the food
        Food food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        
        // Create food intake
        FoodIntake intake = new FoodIntake();
        intake.setUser(user);
        intake.setFood(food);
        intake.setQuantity(request.getQuantity());
        intake.setMealType(request.getMealType());
        intake.setIntakeDate(request.getIntakeDate() != null ? 
                request.getIntakeDate() : LocalDate.now());
        intake.setNotes(request.getNotes());
        
        // Calculate nutrition based on quantity
        intake.calculateNutrition();
        
        // Save
        FoodIntake saved = foodIntakeRepository.save(intake);
        
        return mapToResponse(saved);
    }
    
    /**
     * Get daily nutrition summary for a user
     */
    public DailyNutritionSummary getDailyNutritionSummary(User user, LocalDate date) {
        // Get all intakes for the date
        List<FoodIntake> intakes = foodIntakeRepository.findByUserAndIntakeDate(user, date);
        
        DailyNutritionSummary summary = new DailyNutritionSummary();
        summary.setDate(date);
        
        // Set user goals
        summary.setCalorieGoal(user.getDailyCalorieGoal());
        summary.setProteinGoal(user.getDailyProteinGoal());
        summary.setFatGoal(user.getDailyFatGoal());
        summary.setCarbGoal(user.getDailyCarbGoal());
        
        // Calculate totals
        double totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
        double totalFiber = 0, totalSugar = 0, totalSodium = 0;
        
        Map<FoodIntake.MealType, MealSummary> mealBreakdown = new HashMap<>();
        List<FoodIntakeResponse> foodItems = new ArrayList<>();
        
        for (FoodIntake intake : intakes) {
            // Add to totals
            totalCalories += intake.getCalories();
            totalProtein += intake.getProtein();
            totalFat += intake.getFat();
            totalCarbs += intake.getCarbs();
            totalFiber += intake.getFiber();
            totalSugar += intake.getSugar();
            totalSodium += intake.getSodium();
            
            // Add to meal breakdown
            MealSummary mealSummary = mealBreakdown.computeIfAbsent(intake.getMealType(), 
                k -> new MealSummary());
            mealSummary.setMealType(intake.getMealType());
            mealSummary.setCalories(mealSummary.getCalories() + intake.getCalories());
            mealSummary.setProtein(mealSummary.getProtein() + intake.getProtein());
            mealSummary.setFat(mealSummary.getFat() + intake.getFat());
            mealSummary.setCarbs(mealSummary.getCarbs() + intake.getCarbs());
            
            // Add to food items list
            foodItems.add(mapToResponse(intake));
        }
        
        // Set totals
        summary.setTotalCalories(totalCalories);
        summary.setTotalProtein(totalProtein);
        summary.setTotalFat(totalFat);
        summary.setTotalCarbs(totalCarbs);
        summary.setTotalFiber(totalFiber);
        summary.setTotalSugar(totalSugar);
        summary.setTotalSodium(totalSodium);
        
        // Calculate percentages
        summary.setCaloriePercentage(calculatePercentage(totalCalories, user.getDailyCalorieGoal()));
        summary.setProteinPercentage(calculatePercentage(totalProtein, user.getDailyProteinGoal()));
        summary.setFatPercentage(calculatePercentage(totalFat, user.getDailyFatGoal()));
        summary.setCarbPercentage(calculatePercentage(totalCarbs, user.getDailyCarbGoal()));
        
        // Set breakdown and items
        summary.setMealBreakdown(new ArrayList<>(mealBreakdown.values()));
        summary.setFoodItems(foodItems);
        
        return summary;
    }
    
    /**
     * Get weekly nutrition summary
     */
    public WeeklyNutritionSummary getWeeklyNutritionSummary(User user, LocalDate startDate) {
        WeeklyNutritionSummary summary = new WeeklyNutritionSummary();
        summary.setStartDate(startDate);
        summary.setEndDate(startDate.plusDays(6));
        
        List<DailyNutritionSummary> dailySummaries = new ArrayList<>();
        double totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
        
        // Get summary for each day
        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            DailyNutritionSummary dailySummary = getDailyNutritionSummary(user, date);
            dailySummaries.add(dailySummary);
            
            totalCalories += dailySummary.getTotalCalories();
            totalProtein += dailySummary.getTotalProtein();
            totalFat += dailySummary.getTotalFat();
            totalCarbs += dailySummary.getTotalCarbs();
        }
        
        summary.setDailySummaries(dailySummaries);
        
        // Calculate averages
        summary.setAverageCalories(totalCalories / 7);
        summary.setAverageProtein(totalProtein / 7);
        summary.setAverageFat(totalFat / 7);
        summary.setAverageCarbs(totalCarbs / 7);
        
        // Get all intakes for the week
        List<FoodIntake> weekIntakes = foodIntakeRepository.findByUserAndIntakeDateBetween(
            user, startDate, startDate.plusDays(6));
        
        // Find most consumed foods
        Map<String, Long> foodFrequency = weekIntakes.stream()
            .collect(Collectors.groupingBy(
                intake -> intake.getFood().getName(),
                Collectors.counting()
            ));
        
        Map<String, Integer> mostConsumedMap = new LinkedHashMap<>();
        foodFrequency.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .forEach(entry -> {
                mostConsumedMap.put(entry.getKey(), entry.getValue().intValue());
            });
        
        summary.setMostConsumedFoods(mostConsumedMap);
        
        // Generate recommendations
        summary.setRecommendations(generateWeeklyRecommendations(user, summary));
        
        return summary;
    }
    
    /**
     * Update food intake
     */
    @Transactional
    public FoodIntakeResponse updateFoodIntake(User user, Long intakeId, AddFoodIntakeRequest request) {
        FoodIntake intake = foodIntakeRepository.findById(intakeId)
                .orElseThrow(() -> new IllegalArgumentException("Food intake not found"));
        
        // Check if intake belongs to user
        if (!intake.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this intake");
        }
        
        // Update fields
        if (request.getQuantity() != null) {
            intake.setQuantity(request.getQuantity());
        }
        if (request.getMealType() != null) {
            intake.setMealType(request.getMealType());
        }
        if (request.getNotes() != null) {
            intake.setNotes(request.getNotes());
        }
        
        // Recalculate nutrition
        intake.calculateNutrition();
        
        FoodIntake updated = foodIntakeRepository.save(intake);
        return mapToResponse(updated);
    }
    
    /**
     * Delete food intake
     */
    @Transactional
    public void deleteFoodIntake(User user, Long intakeId) {
        FoodIntake intake = foodIntakeRepository.findById(intakeId)
                .orElseThrow(() -> new IllegalArgumentException("Food intake not found"));
        
        // Check if intake belongs to user
        if (!intake.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this intake");
        }
        
        foodIntakeRepository.delete(intake);
    }
    
    /**
     * Set nutrition goals for user
     */
    @Transactional
    public NutritionGoalResponse setNutritionGoals(User user, NutritionGoalRequest request) {
        // Update user fields
        user.setNutritionGoal(request.getNutritionGoal());
        user.setAgeGroup(request.getAgeGroup());
        
        if (request.getWeight() != null) {
            user.setWeight(request.getWeight());
        }
        if (request.getHeight() != null) {
            user.setHeight(request.getHeight());
        }
        
        // Calculate BMI
        user.calculateBMI();
        
        // Set recommended calories
        Double recommendedCalories = user.getRecommendedCalories();
        user.setDailyCalorieGoal(recommendedCalories);
        
        // Calculate macros based on calories
        user.setDailyProteinGoal(recommendedCalories * 0.20 / 4); // 20% from protein
        user.setDailyCarbGoal(recommendedCalories * 0.50 / 4); // 50% from carbs
        user.setDailyFatGoal(recommendedCalories * 0.30 / 9); // 30% from fat
        
        User savedUser = userRepository.save(user);
        
        return mapToNutritionGoalResponse(savedUser);
    }
    
    /**
     * Get current nutrition goals
     */
    public NutritionGoalResponse getNutritionGoals(User user) {
        return mapToNutritionGoalResponse(user);
    }
    
    /**
     * Map FoodIntake to FoodIntakeResponse
     */
    private FoodIntakeResponse mapToResponse(FoodIntake intake) {
        FoodIntakeResponse response = new FoodIntakeResponse();
        response.setId(intake.getId());
        response.setFoodId(intake.getFood().getId());
        response.setFoodName(intake.getFood().getName());
        response.setFoodCategory(intake.getFood().getCategory());
        response.setQuantity(intake.getQuantity());
        response.setMealType(intake.getMealType());
        response.setIntakeDate(intake.getIntakeDate());
        response.setCalories(intake.getCalories());
        response.setProtein(intake.getProtein());
        response.setFat(intake.getFat());
        response.setCarbs(intake.getCarbs());
        response.setFiber(intake.getFiber());
        response.setSugar(intake.getSugar());
        response.setSodium(intake.getSodium());
        response.setNotes(intake.getNotes());
        response.setNutriScore(nutriScoreCalculator.calculateNutriScore(intake.getFood()));
        
        return response;
    }
    
    /**
     * Map User to NutritionGoalResponse
     */
    private NutritionGoalResponse mapToNutritionGoalResponse(User user) {
        NutritionGoalResponse response = new NutritionGoalResponse();
        response.setNutritionGoal(user.getNutritionGoal());
        response.setAgeGroup(user.getAgeGroup());
        response.setBmi(user.getBmi());
        response.setBmiCategory(user.getBMICategory());
        response.setRecommendedCalories(user.getRecommendedCalories());
        response.setDailyCalorieGoal(user.getDailyCalorieGoal());
        response.setDailyProteinGoal(user.getDailyProteinGoal());
        response.setDailyCarbGoal(user.getDailyCarbGoal());
        response.setDailyFatGoal(user.getDailyFatGoal());
        response.setWeight(user.getWeight());
        response.setHeight(user.getHeight());
        return response;
    }
    
    /**
     * Calculate percentage of goal achieved
     */
    private Double calculatePercentage(Double actual, Double goal) {
        if (goal == null || goal == 0) return 0.0;
        return (actual / goal) * 100;
    }
    
    /**
     * Generate weekly recommendations
     */
    private List<String> generateWeeklyRecommendations(User user, WeeklyNutritionSummary summary) {
        List<String> recommendations = new ArrayList<>();
        
        // Check calorie intake
        if (summary.getAverageCalories() < user.getDailyCalorieGoal() * 0.8) {
            recommendations.add("Your average calorie intake is below target. Consider adding healthy snacks.");
        } else if (summary.getAverageCalories() > user.getDailyCalorieGoal() * 1.2) {
            recommendations.add("Your average calorie intake exceeds your goal. Try reducing portion sizes.");
        }
        
        // Check protein intake
        if (summary.getAverageProtein() < user.getDailyProteinGoal() * 0.8) {
            recommendations.add("You're not meeting your protein goals. Add more lean meats, legumes, or dairy.");
        }
        
        // Check if eating too much of one food
        if (!summary.getMostConsumedFoods().isEmpty()) {
            Map.Entry<String, Integer> topFood = summary.getMostConsumedFoods().entrySet().iterator().next();
            if (topFood.getValue() > 10) {
                recommendations.add(String.format("You've consumed %s %d times this week. Try to diversify your diet.",
                    topFood.getKey(), topFood.getValue()));
            }
        }
        
        return recommendations;
    }
}