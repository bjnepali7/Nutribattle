// File: src/main/java/com/nutribattle/repository/FoodRepository.java

package com.nutribattle.repository;

import com.nutribattle.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
    
    List<Food> findByCategory(String category);
    
    List<Food> findByType(String type);
    
    List<Food> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT f FROM Food f WHERE f.calories BETWEEN :minCal AND :maxCal ORDER BY f.calories")
    List<Food> findByCaloriesRange(@Param("minCal") Double minCal, @Param("maxCal") Double maxCal);
    
    @Query("SELECT f FROM Food f WHERE f.protein >= :minProtein ORDER BY f.protein DESC")
    List<Food> findHighProteinFoods(@Param("minProtein") Double minProtein);
    
    @Query("SELECT f FROM Food f WHERE f.sugar <= :maxSugar ORDER BY f.sugar")
    List<Food> findLowSugarFoods(@Param("maxSugar") Double maxSugar);
    
    @Query("SELECT DISTINCT f.category FROM Food f ORDER BY f.category")
    List<String> findAllCategories();
}