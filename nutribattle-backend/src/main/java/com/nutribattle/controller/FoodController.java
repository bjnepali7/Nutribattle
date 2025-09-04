package com.nutribattle.controller;

import com.nutribattle.entity.Food;
import com.nutribattle.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Food-related endpoints.
 * Handles HTTP requests for food data.
 */
@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FoodController {
    
    private final FoodService foodService;
    
    /**
     * Get all foods
     * GET /api/foods
     */
    @GetMapping
    public List<Food> getAllFoods() {
        return foodService.getAllFoods();
    }
    
    /**
     * Get food by ID
     * GET /api/foods/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Food> getFoodById(@PathVariable Long id) {
        Food food = foodService.getFoodById(id);
        return food != null ? ResponseEntity.ok(food) : ResponseEntity.notFound().build();
    }
    
    /**
     * Get foods by type (Traditional or Modern)
     * GET /api/foods/type/{type}
     */
    @GetMapping("/type/{type}")
    public List<Food> getFoodsByType(@PathVariable String type) {
        return foodService.getFoodsByType(type);
    }
    
    /**
     * Search foods by name
     * GET /api/foods/search?name=momo
     */
    @GetMapping("/search")
    public List<Food> searchFoods(@RequestParam String name) {
        return foodService.searchFoods(name);
    }
    
    /**
     * Get all food categories
     * GET /api/foods/categories
     */
    @GetMapping("/categories")
    public List<String> getCategories() {
        return foodService.getAllCategories();
    }
    
    /**
     * Get random foods for homepage with limit of 60
     * GET /api/foods/random?limit=60
     */
    @GetMapping("/random")
    public List<Food> getRandomFoods(@RequestParam(defaultValue = "60") int limit) {
        return foodService.getRandomFoods(Math.min(limit, 60)); // Cap at 60
    }
    
    /**
     * Get limited foods for homepage display
     * GET /api/foods/homepage
     */
    @GetMapping("/homepage")
    public List<Food> getHomepageFoods() {
        return foodService.getHomepageFoods(60); // Fixed 60 foods for homepage
    }
}