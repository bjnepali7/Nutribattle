package com.nutribattle.controller;

import com.nutribattle.dto.CalorieKnnRecommendation;
import com.nutribattle.entity.User;
import com.nutribattle.repository.UserRepository;
import com.nutribattle.service.CalorieKnnService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/knn")
@RequiredArgsConstructor
public class CalorieKnnController {

    private final CalorieKnnService knnService;
    private final UserRepository userRepository;

    @GetMapping("/recommend")
    public CalorieKnnRecommendation recommend(@RequestParam String mealType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return knnService.getCalorieBasedRecommendations(currentUser, mealType);
    }
}