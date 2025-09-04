// File: C:\Nutribattle\nutribattle-backend\src\main\java\com\nutribattle\service\FoodService.java

package com.nutribattle.service;

import com.nutribattle.entity.Food;
import com.nutribattle.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Food-related business logic
 * UPDATED: Check for actual file existence
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FoodService {
    
    private final FoodRepository foodRepository;
    private final NutriScoreCalculator nutriScoreCalculator;
    
    @Value("${server.url:http://localhost:8080}")
    private String serverUrl;
    
    // Path to images folder
    private static final String IMAGE_PATH = "src/main/resources/static/images/foods/";
    
    /**
     * Get random foods for display with image URL processing
     */
    public List<Food> getRandomFoods(int limit) {
        List<Food> allFoods = foodRepository.findAll();
        
        // Shuffle the list
        Collections.shuffle(allFoods);
        
        // Return the first 'limit' items with Nutri-Score calculated and image URLs processed
        return allFoods.stream()
                .limit(limit)
                .map(this::processFood)
                .collect(Collectors.toList());
    }
    
    /**
     * Get specific foods for homepage - ONLY foods with EXISTING image files
     */
    public List<Food> getHomepageFoods(int limit) {
        List<Food> allFoods = foodRepository.findAll();
        
        // Filter only foods that have image URLs AND the file actually exists
        List<Food> foodsWithExistingImages = allFoods.stream()
                .filter(f -> f.getImageUrl() != null && !f.getImageUrl().isEmpty())
                .filter(this::imageFileExists)
                .collect(Collectors.toList());
        
        log.info("Total foods with existing image files: {}", foodsWithExistingImages.size());
        
        // Separate into traditional and modern
        List<Food> traditionalFoods = foodsWithExistingImages.stream()
                .filter(f -> "Traditional".equals(f.getType()))
                .collect(Collectors.toList());
        
        List<Food> modernFoods = foodsWithExistingImages.stream()
                .filter(f -> "Modern".equals(f.getType()))
                .collect(Collectors.toList());
        
        log.info("Traditional foods with images: {}, Modern foods with images: {}", 
                traditionalFoods.size(), modernFoods.size());
        
        // Shuffle both lists
        Collections.shuffle(traditionalFoods);
        Collections.shuffle(modernFoods);
        
        // Create balanced mix
        List<Food> mixedFoods = new ArrayList<>();
        int halfLimit = limit / 2;
        
        // Add traditional foods (up to halfLimit or available count)
        int traditionalCount = Math.min(halfLimit, traditionalFoods.size());
        mixedFoods.addAll(traditionalFoods.stream()
                .limit(traditionalCount)
                .collect(Collectors.toList()));
        
        // Add modern foods (fill remaining slots)
        int modernCount = Math.min(limit - traditionalCount, modernFoods.size());
        mixedFoods.addAll(modernFoods.stream()
                .limit(modernCount)
                .collect(Collectors.toList()));
        
        // If we still don't have enough, add more from whichever has extras
        if (mixedFoods.size() < limit) {
            int needed = limit - mixedFoods.size();
            
            // Try to add more traditional
            if (traditionalFoods.size() > traditionalCount) {
                int additionalTraditional = Math.min(needed, traditionalFoods.size() - traditionalCount);
                mixedFoods.addAll(traditionalFoods.stream()
                        .skip(traditionalCount)
                        .limit(additionalTraditional)
                        .collect(Collectors.toList()));
                needed -= additionalTraditional;
            }
            
            // Try to add more modern
            if (needed > 0 && modernFoods.size() > modernCount) {
                int additionalModern = Math.min(needed, modernFoods.size() - modernCount);
                mixedFoods.addAll(modernFoods.stream()
                        .skip(modernCount)
                        .limit(additionalModern)
                        .collect(Collectors.toList()));
            }
        }
        
        // Shuffle the mixed list so they're not grouped
        Collections.shuffle(mixedFoods);
        
        log.info("Returning {} foods for homepage", mixedFoods.size());
        
        // Process and return
        return mixedFoods.stream()
                .map(this::processFood)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if image file actually exists
     */
    private boolean imageFileExists(Food food) {
        if (food.getImageUrl() == null || food.getImageUrl().isEmpty()) {
            return false;
        }
        
        // Check if file exists
        Path imagePath = Paths.get(IMAGE_PATH + food.getImageUrl());
        boolean exists = Files.exists(imagePath);
        
        if (!exists) {
            log.debug("Image file not found: {}", food.getImageUrl());
        }
        
        return exists;
    }
    
    /**
     * Get all foods
     */
    public List<Food> getAllFoods() {
        return foodRepository.findAll().stream()
                .map(this::processFood)
                .collect(Collectors.toList());
    }
    
    /**
     * Get food by ID
     */
    public Food getFoodById(Long id) {
        Food food = foodRepository.findById(id).orElse(null);
        if (food != null) {
            processFood(food);
        }
        return food;
    }
    
    /**
     * Search foods by name
     */
    public List<Food> searchFoods(String name) {
        return foodRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::processFood)
                .collect(Collectors.toList());
    }
    
    /**
     * Get foods by type
     */
    public List<Food> getFoodsByType(String type) {
        return foodRepository.findByType(type).stream()
                .map(this::processFood)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all categories
     */
    public List<String> getAllCategories() {
        return foodRepository.findAllCategories();
    }
    
    /**
     * Process food item - calculate Nutri-Score and format image URL
     */
    private Food processFood(Food food) {
        // Calculate Nutri-Score
        String nutriScore = nutriScoreCalculator.calculateNutriScore(food);
        food.setNutriScore(nutriScore);
        
        // Format image URL to use local server path
        if (food.getImageUrl() != null && !food.getImageUrl().isEmpty()) {
            // If imageUrl is just filename, prepend server URL
            if (!food.getImageUrl().startsWith("http")) {
                food.setImageUrl(serverUrl + "/images/foods/" + food.getImageUrl());
            }
        }
        
        // Truncate description if too long for card display
        if (food.getDescription() != null && food.getDescription().length() > 100) {
            // Keep original description but frontend will truncate for display
        }
        
        return food;
    }
}