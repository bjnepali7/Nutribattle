// File: src/main/java/com/nutribattle/dto/WeeklyNutritionSummary.java

package com.nutribattle.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class WeeklyNutritionSummary {
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Averages
    private Double averageCalories;
    private Double averageProtein;
    private Double averageFat;
    private Double averageCarbs;
    
    // Daily summaries
    private List<DailyNutritionSummary> dailySummaries;
    
    // Most consumed foods (name -> count)
    private Map<String, Integer> mostConsumedFoods;
    
    // Recommendations
    private List<String> recommendations;
}