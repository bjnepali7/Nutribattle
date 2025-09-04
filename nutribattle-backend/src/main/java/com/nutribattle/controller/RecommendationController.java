// RecommendationController.java
package com.nutribattle.controller;

import com.nutribattle.dto.FoodRecommendation;
import com.nutribattle.service.KnnRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for food recommendation endpoints
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendationController {
    
    private final KnnRecommendationService knnRecommendationService;
    
    /**
     * Get healthier alternatives for a food using KNN with category mode
     * GET /api/recommendations/{foodId}?k=5&mode=MIXED
     * 
     * @param foodId The food to get recommendations for
     * @param k Number of recommendations (default 5)
     * @param mode Recommendation mode: SAME_CATEGORY, OPPOSITE_CATEGORY, or MIXED (default MIXED)
     */
    @GetMapping("/{foodId}")
    public ResponseEntity<List<FoodRecommendation>> getRecommendations(
            @PathVariable Long foodId,
            @RequestParam(defaultValue = "5") int k,
            @RequestParam(defaultValue = "MIXED") String mode) {
        
        if (k < 1 || k > 10) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate mode
        KnnRecommendationService.RecommendationMode recMode;
        try {
            recMode = KnnRecommendationService.RecommendationMode.valueOf(mode.toUpperCase());
        } catch (IllegalArgumentException e) {
            recMode = KnnRecommendationService.RecommendationMode.MIXED;
        }
        
        try {
            List<FoodRecommendation> recommendations = 
                knnRecommendationService.getHealthierAlternatives(foodId, k, recMode);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}