// File: src/main/java/com/nutribattle/controller/NutritionTrackingController.java

package com.nutribattle.controller;

import com.nutribattle.dto.*;
import com.nutribattle.entity.User;
import com.nutribattle.service.CalorieKnnService;
import com.nutribattle.service.NutritionTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NutritionTrackingController {
    
    private final NutritionTrackingService nutritionTrackingService;
    private final CalorieKnnService calorieKnnService;
    
    /**
     * Set nutrition goals
     * POST /api/nutrition/goals
     */
    @PostMapping("/goals")
    public ResponseEntity<NutritionGoalResponse> setNutritionGoals(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NutritionGoalRequest request) {
        
        NutritionGoalResponse response = nutritionTrackingService.setNutritionGoals(user, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current nutrition goals
     * GET /api/nutrition/goals
     */
    @GetMapping("/goals")
    public ResponseEntity<NutritionGoalResponse> getNutritionGoals(@AuthenticationPrincipal User user) {
        NutritionGoalResponse response = nutritionTrackingService.getNutritionGoals(user);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get KNN food recommendations based on calorie goal
     * GET /api/nutrition/recommendations/calories?mealType=LUNCH
     */
    @GetMapping("/recommendations/calories")
    public ResponseEntity<CalorieKnnRecommendation> getCalorieRecommendations(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "LUNCH") String mealType) {
        
        CalorieKnnRecommendation recommendations = calorieKnnService.getCalorieBasedRecommendations(user, mealType);
        return ResponseEntity.ok(recommendations);
    }
    
    // Existing endpoints...
    @PostMapping("/intake")
    public ResponseEntity<FoodIntakeResponse> addFoodIntake(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddFoodIntakeRequest request) {
        
        FoodIntakeResponse response = nutritionTrackingService.addFoodIntake(user, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/daily")
    public ResponseEntity<DailyNutritionSummary> getDailyNutrition(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        if (date == null) {
            date = LocalDate.now();
        }
        
        DailyNutritionSummary summary = nutritionTrackingService.getDailyNutritionSummary(user, date);
        return ResponseEntity.ok(summary);
    }
    
    @GetMapping("/weekly")
    public ResponseEntity<WeeklyNutritionSummary> getWeeklyNutrition(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        
        if (startDate == null) {
            LocalDate now = LocalDate.now();
            startDate = now.minusDays(now.getDayOfWeek().getValue() - 1);
        }
        
        WeeklyNutritionSummary summary = nutritionTrackingService.getWeeklyNutritionSummary(user, startDate);
        return ResponseEntity.ok(summary);
    }
    
    @PutMapping("/intake/{intakeId}")
    public ResponseEntity<FoodIntakeResponse> updateFoodIntake(
            @AuthenticationPrincipal User user,
            @PathVariable Long intakeId,
            @Valid @RequestBody AddFoodIntakeRequest request) {
        
        FoodIntakeResponse response = nutritionTrackingService.updateFoodIntake(user, intakeId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/intake/{intakeId}")
    public ResponseEntity<Void> deleteFoodIntake(
            @AuthenticationPrincipal User user,
            @PathVariable Long intakeId) {
        
        nutritionTrackingService.deleteFoodIntake(user, intakeId);
        return ResponseEntity.noContent().build();
    }
}