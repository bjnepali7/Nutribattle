package com.nutribattle.util;

import com.nutribattle.entity.Food;
import com.nutribattle.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/**
 * Component that loads CSV data into the database on application startup.
 * Implements CommandLineRunner to run after Spring Boot starts.
 */
@Component
@RequiredArgsConstructor  // Lombok creates constructor for final fields
@Slf4j  // Lombok creates logger
public class CsvDataLoader implements CommandLineRunner {
    
    private final FoodRepository foodRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (foodRepository.count() > 0) {
            log.info("Database already contains {} food items. Skipping CSV import.", 
                    foodRepository.count());
            return;
        }
        
        log.info("Starting CSV data import...");
        
        try {
            // Load CSV file from resources folder
            ClassPathResource resource = new ClassPathResource("data/nepali_foods.csv");
            
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                
                // Skip header line
                String header = reader.readLine();
                log.debug("CSV Header: {}", header);
                
                String line;
                int count = 0;
                int errors = 0;
                
                while ((line = reader.readLine()) != null) {
                    try {
                        Food food = parseCsvLine(line);
                        foodRepository.save(food);
                        count++;
                        
                        // Log progress every 50 items
                        if (count % 50 == 0) {
                            log.info("Imported {} foods...", count);
                        }
                    } catch (Exception e) {
                        errors++;
                        log.error("Error parsing line: {}", line, e);
                    }
                }
                
                log.info("CSV import completed! Imported {} foods with {} errors.", count, errors);
                
            }
        } catch (Exception e) {
            log.error("Failed to load CSV data", e);
        }
    }
    
    /**
     * Parse a CSV line into a Food object.
     * Handles quoted values and proper data type conversion.
     */
    private Food parseCsvLine(String line) {
        // Split by comma, but respect quotes
        String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
        
        // Remove quotes and trim
        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim().replaceAll("^\"|\"$", "");
        }
        
        Food food = new Food();
        
        // Skip ID (parts[0]) - let database auto-generate it
        food.setName(parts[1]);
        food.setCategory(parts[2]);
        food.setType(parts[3]);
        food.setCalories(parseDouble(parts[4]));
        food.setProtein(parseDouble(parts[5]));
        food.setFat(parseDouble(parts[6]));
        food.setSaturatedFat(parseDouble(parts[7]));
        food.setCarbs(parseDouble(parts[8]));
        food.setSugar(parseDouble(parts[9]));
        food.setFiber(parseDouble(parts[10]));
        food.setSodium(parseDouble(parts[11]));
        food.setVitaminA(parseDouble(parts[12]));
        food.setVitaminC(parseDouble(parts[13]));
        food.setCalcium(parseDouble(parts[14]));
        food.setIron(parseDouble(parts[15]));
        food.setImageUrl(parts[16]);
        food.setDescription(parts.length > 17 ? parts[17] : "");
        
        return food;
    }
    
    /**
     * Safely parse a string to Double, returning 0.0 if parsing fails
     */
    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            log.warn("Failed to parse double value: {}", value);
            return 0.0;
        }
    }
}