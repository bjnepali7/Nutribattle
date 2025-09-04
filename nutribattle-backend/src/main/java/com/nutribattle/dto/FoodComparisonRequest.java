// File: src/main/java/com/nutribattle/dto/FoodComparisonRequest.java

package com.nutribattle.dto;

import lombok.Data;
import java.util.List;

@Data
public class FoodComparisonRequest {
    private List<Long> foodIds;
}