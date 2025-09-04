package com.nutribattle.controller;

import com.nutribattle.dto.ComparisonResult;
import com.nutribattle.service.ComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for food comparison endpoints
 */
@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ComparisonController {
    
    private final ComparisonService comparisonService;
    
    /**
     * Compare multiple foods
     * POST /api/compare
     * Body: { "foodIds": [1, 2, 3] }
     */
    @PostMapping
    public ResponseEntity<ComparisonResult> compareFoods(@RequestBody Map<String, List<Long>> request) {
        List<Long> foodIds = request.get("foodIds");
        
        if (foodIds == null || foodIds.isEmpty() || foodIds.size() > 3) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            ComparisonResult result = comparisonService.compareFoods(foodIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}