package com.nutribattle.util;

import com.nutribattle.entity.User;
import com.nutribattle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Check if users already exist
        if (userRepository.count() == 0) {
            log.info("No users found. Creating default users...");
            
            // Create admin user
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@nutribattle.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Admin User");
            admin.setRole(User.Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            log.info("Admin user created - Username: admin, Password: admin123");
            
            // Create regular user
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@nutribattle.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setFullName("Regular User");
            user.setRole(User.Role.USER);
            user.setEnabled(true);
            userRepository.save(user);
            log.info("Regular user created - Username: user, Password: user123");
            
        } else {
            log.info("Users already exist. Skipping initialization.");
        }
    }
}