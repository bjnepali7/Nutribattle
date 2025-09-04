// File: src/main/java/com/nutribattle/entity/User.java

package com.nutribattle.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    
    @Column(nullable = false)
    private boolean enabled = true;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime lastLoginAt;
    
    // User preferences
    private Integer age;
    private String gender;
    private Double height; // in cm
    private Double weight; // in kg
    private String activityLevel;
    private String dietaryPreference;
    
    // NEW FIELDS for nutrition tracking
    @Enumerated(EnumType.STRING)
    private NutritionGoal nutritionGoal = NutritionGoal.MAINTAIN;
    
    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup = AgeGroup.MIDDLE_AGE;
    
    private Double bmi; // BMI calculated value
    
    // Daily nutritional goals
    private Double dailyCalorieGoal;
    private Double dailyProteinGoal;
    private Double dailyCarbGoal;
    private Double dailyFatGoal;
    
    // ENUMS
    public enum Role {
        USER, ADMIN
    }
    
    public enum NutritionGoal {
        WEIGHT_GAIN, WEIGHT_LOSS, MAINTAIN
    }
    
    public enum AgeGroup {
        CHILD, MIDDLE_AGE, OLD_AGE
    }
    
    // Calculate BMI
    public void calculateBMI() {
        if (weight != null && height != null && height > 0) {
            double heightInMeters = height / 100.0;
            this.bmi = weight / (heightInMeters * heightInMeters);
        }
    }
    
    // Get BMI Category
    public String getBMICategory() {
        if (bmi == null) return "Unknown";
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal";
        if (bmi < 30) return "Overweight";
        return "Obese";
    }
    
    // Calculate recommended calories based on goal and age group
    public Double getRecommendedCalories() {
        if (nutritionGoal == null || ageGroup == null) return 2000.0;
        
        switch (ageGroup) {
            case CHILD:
                return nutritionGoal == NutritionGoal.WEIGHT_GAIN ? 2000.0 : 
                       nutritionGoal == NutritionGoal.WEIGHT_LOSS ? 1400.0 : 1700.0;
            case MIDDLE_AGE:
                return nutritionGoal == NutritionGoal.WEIGHT_GAIN ? 2800.0 : 
                       nutritionGoal == NutritionGoal.WEIGHT_LOSS ? 1800.0 : 2300.0;
            case OLD_AGE:
                return nutritionGoal == NutritionGoal.WEIGHT_GAIN ? 2400.0 : 
                       nutritionGoal == NutritionGoal.WEIGHT_LOSS ? 1600.0 : 2000.0;
            default:
                return 2000.0;
        }
    }
    
    // UserDetails interface methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return enabled;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}