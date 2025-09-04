package com.nutribattle.util;

import com.nutribattle.entity.User;
import com.nutribattle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Create default admin user on application startup
 */
@Component
@Order(2) // Run after CSV data loader
@RequiredArgsConstructor
@Slf4j
public class AdminDataLoader implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Check if admin already exists
        if (userRepository.existsByUsername("admin")) {
            log.info("Admin user already exists");
            return;
        }
        
        // Create default admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@nutribattle.com");
        admin.setPassword(passwordEncoder.encode("admin123")); // Change this in production!
        admin.setFullName("System Administrator");
        admin.setRole(User.Role.ADMIN);
        admin.setEnabled(true);
        admin.setCreatedAt(LocalDateTime.now());
        
        // Set nutritional goals
        admin.setDailyCalorieGoal(2000.0);
        admin.setDailyProteinGoal(50.0);
        admin.setDailyCarbGoal(275.0);
        admin.setDailyFatGoal(65.0);
        
        userRepository.save(admin);
        log.info("Default admin user created - username: admin, password: admin123");
        
        // Create a test user
        if (!userRepository.existsByUsername("testuser")) {
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setEmail("test@nutribattle.com");
            testUser.setPassword(passwordEncoder.encode("test123"));
            testUser.setFullName("Test User");
            testUser.setRole(User.Role.USER);
            testUser.setEnabled(true);
            testUser.setCreatedAt(LocalDateTime.now());
            
            // Set user profile
            testUser.setAge(25);
            testUser.setGender("MALE");
            testUser.setHeight(175.0); // cm
            testUser.setWeight(70.0);  // kg
            testUser.setActivityLevel("MODERATE");
            testUser.setDietaryPreference("NONE");
            
            // Set nutritional goals
            testUser.setDailyCalorieGoal(2500.0);
            testUser.setDailyProteinGoal(65.0);
            testUser.setDailyCarbGoal(325.0);
            testUser.setDailyFatGoal(80.0);
            
            userRepository.save(testUser);
            log.info("Test user created - username: testuser, password: test123");
        }
    }
}