// File: src/main/java/com/nutribattle/controller/UserProfileController.java
// FIXED: Added proper error handling and null checks for profile data

package com.nutribattle.controller;

import com.nutribattle.dto.*;
import com.nutribattle.entity.User;
import com.nutribattle.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user profile management
 * Fixed: Added null checks and default values for all profile fields
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserProfileController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Get current user profile
     * GET /api/user/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapToProfileResponse(user));
    }
    
    /**
     * Update user profile
     * PUT /api/user/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request) {
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Update basic info with null checks
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getHeight() != null) {
            user.setHeight(request.getHeight());
        }
        if (request.getWeight() != null) {
            user.setWeight(request.getWeight());
        }
        if (request.getActivityLevel() != null) {
            user.setActivityLevel(request.getActivityLevel());
        }
        if (request.getDietaryPreference() != null) {
            user.setDietaryPreference(request.getDietaryPreference());
        }
        
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(mapToProfileResponse(updatedUser));
    }
    
    /**
     * Get nutritional goals
     * GET /api/user/goals
     */
    @GetMapping("/goals")
    public ResponseEntity<NutritionalGoalsResponse> getNutritionalGoals(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapToGoalsResponse(user));
    }
    
    /**
     * Update nutritional goals
     * PUT /api/user/goals
     */
    @PutMapping("/goals")
    public ResponseEntity<NutritionalGoalsResponse> updateNutritionalGoals(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateGoalsRequest request) {
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (request.getDailyCalorieGoal() != null) {
            user.setDailyCalorieGoal(request.getDailyCalorieGoal());
        }
        if (request.getDailyProteinGoal() != null) {
            user.setDailyProteinGoal(request.getDailyProteinGoal());
        }
        if (request.getDailyCarbGoal() != null) {
            user.setDailyCarbGoal(request.getDailyCarbGoal());
        }
        if (request.getDailyFatGoal() != null) {
            user.setDailyFatGoal(request.getDailyFatGoal());
        }
        
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(mapToGoalsResponse(updatedUser));
    }
    
    /**
     * Calculate recommended goals based on user profile
     * GET /api/user/goals/calculate
     */
    @GetMapping("/goals/calculate")
    public ResponseEntity<NutritionalGoalsResponse> calculateRecommendedGoals(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Calculate recommended goals based on user profile
        NutritionalGoalsResponse response = new NutritionalGoalsResponse();
        
        // Basic calorie calculation (simplified Harris-Benedict formula)
        double bmr = calculateBMR(user);
        double activityMultiplier = getActivityMultiplier(user.getActivityLevel());
        double recommendedCalories = bmr * activityMultiplier;
        
        // Set macronutrient goals based on balanced diet recommendations
        // FIXED: Cast long to double for setter methods
        response.setDailyCalorieGoal((double) Math.round(recommendedCalories));
        response.setDailyProteinGoal((double) Math.round(recommendedCalories * 0.25 / 4)); // 25% from protein, 4 cal/g
        response.setDailyCarbGoal((double) Math.round(recommendedCalories * 0.45 / 4)); // 45% from carbs, 4 cal/g
        response.setDailyFatGoal((double) Math.round(recommendedCalories * 0.30 / 9)); // 30% from fat, 9 cal/g
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Change password
     * PUT /api/user/password
     */
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok().body("Password changed successfully");
    }
    
    /**
     * Map User entity to UserProfileResponse DTO
     * FIXED: Added null checks and default values for all fields
     */
    private UserProfileResponse mapToProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName() != null ? user.getFullName() : "");
        response.setAge(user.getAge() != null ? user.getAge() : 0);
        response.setGender(user.getGender() != null ? user.getGender() : "");
        response.setHeight(user.getHeight() != null ? user.getHeight() : 0.0);
        response.setWeight(user.getWeight() != null ? user.getWeight() : 0.0);
        response.setActivityLevel(user.getActivityLevel() != null ? user.getActivityLevel() : "MODERATE");
        response.setDietaryPreference(user.getDietaryPreference() != null ? user.getDietaryPreference() : "NONE");
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLoginAt(user.getLastLoginAt());
        return response;
    }
    
    /**
     * Map User entity to NutritionalGoalsResponse DTO
     * FIXED: Added null checks and default values
     */
    private NutritionalGoalsResponse mapToGoalsResponse(User user) {
        NutritionalGoalsResponse response = new NutritionalGoalsResponse();
        response.setDailyCalorieGoal(user.getDailyCalorieGoal() != null ? user.getDailyCalorieGoal() : 2000.0);
        response.setDailyProteinGoal(user.getDailyProteinGoal() != null ? user.getDailyProteinGoal() : 50.0);
        response.setDailyCarbGoal(user.getDailyCarbGoal() != null ? user.getDailyCarbGoal() : 275.0);
        response.setDailyFatGoal(user.getDailyFatGoal() != null ? user.getDailyFatGoal() : 65.0);
        return response;
    }
    
    /**
     * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
     */
    private double calculateBMR(User user) {
        // Get values with defaults if null
        double weight = user.getWeight() != null ? user.getWeight() : 70; // kg
        double height = user.getHeight() != null ? user.getHeight() : 170; // cm
        int age = user.getAge() != null ? user.getAge() : 25;
        String gender = user.getGender() != null ? user.getGender() : "Male";
        
        // Mifflin-St Jeor Equation
        if ("Male".equalsIgnoreCase(gender)) {
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
    }
    
    /**
     * Get activity multiplier for TDEE calculation
     */
    private double getActivityMultiplier(String activityLevel) {
        if (activityLevel == null) return 1.5;
        
        switch(activityLevel.toUpperCase()) {
            case "SEDENTARY": 
                return 1.2;     // Little or no exercise
            case "LIGHT": 
                return 1.375;   // Light exercise 1-3 days/week
            case "MODERATE": 
                return 1.55;    // Moderate exercise 3-5 days/week
            case "ACTIVE": 
                return 1.725;   // Heavy exercise 6-7 days/week
            case "VERY_ACTIVE": 
                return 1.9;     // Very heavy physical job or training
            default: 
                return 1.5;
        }
    }
}

// DTO Classes

/**
 * Response DTO for user profile
 */
@Data
class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String activityLevel;
    private String dietaryPreference;
    private String role;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime lastLoginAt;
}

/**
 * Request DTO for updating profile
 */
@Data
class UpdateProfileRequest {
    private String fullName;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String activityLevel;
    private String dietaryPreference;
}

/**
 * Response DTO for nutritional goals
 */
@Data
class NutritionalGoalsResponse {
    private Double dailyCalorieGoal;
    private Double dailyProteinGoal;
    private Double dailyCarbGoal;
    private Double dailyFatGoal;
}

/**
 * Request DTO for updating goals
 */
@Data
class UpdateGoalsRequest {
    private Double dailyCalorieGoal;
    private Double dailyProteinGoal;
    private Double dailyCarbGoal;
    private Double dailyFatGoal;
}

/**
 * Request DTO for changing password
 */
@Data
class ChangePasswordRequest {
    @jakarta.validation.constraints.NotBlank(message = "Current password is required")
    private String currentPassword;
    
    @jakarta.validation.constraints.NotBlank(message = "New password is required")
    @jakarta.validation.constraints.Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;
}