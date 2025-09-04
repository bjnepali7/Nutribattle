package com.nutribattle.dto;

import com.nutribattle.entity.Food;
import lombok.Data;

import java.util.List;

/**
 * DTO for food comparison results
 */
@Data
public class ComparisonResult {
    private List<Food> foods;
    private List<NutrientComparison> nutrientComparisons;
    private Food healthiestFood;
    private List<String> recommendations;
}