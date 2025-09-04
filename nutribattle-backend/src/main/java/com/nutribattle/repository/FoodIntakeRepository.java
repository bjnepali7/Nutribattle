package com.nutribattle.repository;

import com.nutribattle.entity.FoodIntake;
import com.nutribattle.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for FoodIntake entity
 */
@Repository
public interface FoodIntakeRepository extends JpaRepository<FoodIntake, Long> {
    
    // Find all intakes for a user on a specific date
    List<FoodIntake> findByUserAndIntakeDate(User user, LocalDate date);
    
    // Find all intakes for a user between dates
    List<FoodIntake> findByUserAndIntakeDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    // Find all intakes for a user for a specific meal type on a date
    List<FoodIntake> findByUserAndIntakeDateAndMealType(User user, LocalDate date, FoodIntake.MealType mealType);
    
    // Calculate total calories for a user on a specific date
    @Query("SELECT COALESCE(SUM(f.calories), 0) FROM FoodIntake f WHERE f.user = :user AND f.intakeDate = :date")
    Double getTotalCaloriesForDate(@Param("user") User user, @Param("date") LocalDate date);
    
    // Calculate total nutrients for a user on a specific date
    @Query("SELECT COALESCE(SUM(f.calories), 0) as calories, " +
           "COALESCE(SUM(f.protein), 0) as protein, " +
           "COALESCE(SUM(f.fat), 0) as fat, " +
           "COALESCE(SUM(f.carbs), 0) as carbs, " +
           "COALESCE(SUM(f.fiber), 0) as fiber, " +
           "COALESCE(SUM(f.sugar), 0) as sugar, " +
           "COALESCE(SUM(f.sodium), 0) as sodium " +
           "FROM FoodIntake f WHERE f.user = :user AND f.intakeDate = :date")
    Object[] getTotalNutrientsForDate(@Param("user") User user, @Param("date") LocalDate date);
    
    // Get most consumed foods for a user
    @Query("SELECT f.food, COUNT(f) as count FROM FoodIntake f " +
           "WHERE f.user = :user " +
           "GROUP BY f.food " +
           "ORDER BY count DESC")
    List<Object[]> getMostConsumedFoods(@Param("user") User user);
    
    // Delete all intakes for a user on a specific date
    void deleteByUserAndIntakeDate(User user, LocalDate date);
}