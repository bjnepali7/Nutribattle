package com.nutribattle.controller;

import com.nutribattle.dto.ApiResponse;
import com.nutribattle.entity.Food;
import com.nutribattle.entity.User;
import com.nutribattle.repository.FoodRepository;
import com.nutribattle.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for admin operations
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {
    
    private final UserRepository userRepository;
    private final FoodRepository foodRepository;
    
    // ========== USER MANAGEMENT ==========
    
    /**
     * Get all users with pagination
     * GET /api/admin/users?page=0&size=10
     */
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users = userRepository.findAll(pageRequest);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Toggle user enabled status
     * PUT /api/admin/users/{id}/toggle-status
     */
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        
        return ResponseEntity.ok(new ApiResponse(true, 
                "User " + (user.isEnabled() ? "enabled" : "disabled") + " successfully"));
    }
    
    /**
     * Make user admin
     * PUT /api/admin/users/{id}/make-admin
     */
    @PutMapping("/users/{id}/make-admin")
    public ResponseEntity<ApiResponse> makeUserAdmin(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setRole(User.Role.ADMIN);
        userRepository.save(user);
        
        return ResponseEntity.ok(new ApiResponse(true, "User promoted to admin successfully"));
    }
    
    // ========== FOOD MANAGEMENT ==========
    
    /**
     * Add new food
     * POST /api/admin/foods
     */
    @PostMapping("/foods")
    public ResponseEntity<Food> addFood(@Valid @RequestBody Food food) {
        food.setId(null); // Ensure new food
        Food saved = foodRepository.save(food);
        return ResponseEntity.ok(saved);
    }
    
    /**
     * Update food
     * PUT /api/admin/foods/{id}
     */
    @PutMapping("/foods/{id}")
    public ResponseEntity<Food> updateFood(
            @PathVariable Long id,
            @Valid @RequestBody Food foodUpdate) {
        
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        
        // Update fields
        food.setName(foodUpdate.getName());
        food.setCategory(foodUpdate.getCategory());
        food.setType(foodUpdate.getType());
        food.setCalories(foodUpdate.getCalories());
        food.setProtein(foodUpdate.getProtein());
        food.setFat(foodUpdate.getFat());
        food.setSaturatedFat(foodUpdate.getSaturatedFat());
        food.setCarbs(foodUpdate.getCarbs());
        food.setSugar(foodUpdate.getSugar());
        food.setFiber(foodUpdate.getFiber());
        food.setSodium(foodUpdate.getSodium());
        food.setVitaminA(foodUpdate.getVitaminA());
        food.setVitaminC(foodUpdate.getVitaminC());
        food.setCalcium(foodUpdate.getCalcium());
        food.setIron(foodUpdate.getIron());
        food.setImageUrl(foodUpdate.getImageUrl());
        food.setDescription(foodUpdate.getDescription());
        
        Food updated = foodRepository.save(food);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete food
     * DELETE /api/admin/foods/{id}
     */
    @DeleteMapping("/foods/{id}")
    public ResponseEntity<ApiResponse> deleteFood(@PathVariable Long id) {
        if (!foodRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        foodRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Food deleted successfully"));
    }
    
    // ========== STATISTICS ==========
    
    /**
     * Get system statistics
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<SystemStats> getSystemStats() {
        SystemStats stats = new SystemStats();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalFoods(foodRepository.count());
        stats.setTraditionalFoods(foodRepository.findByType("Traditional").size());
        stats.setModernFoods(foodRepository.findByType("Modern").size());
        
        return ResponseEntity.ok(stats);
    }
}

// DTO for system statistics
@lombok.Data
class SystemStats {
    private Long totalUsers;
    private Long totalFoods;
    private Integer traditionalFoods;
    private Integer modernFoods;
}