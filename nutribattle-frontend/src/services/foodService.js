// File: src/services/foodService.js

import API from './api';

const foodService = {
  // Get all foods
  getAllFoods: async () => {
    try {
      console.log('🔄 Fetching all foods...');
      const response = await API.get('/foods');
      console.log('✅ getAllFoods response:', response.data.length, 'foods found');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all foods:', error);
      if (error.response) {
        console.error('📊 Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  // Get homepage foods (with images)
  getHomepageFoods: async () => {
    try {
      console.log('🔄 Fetching homepage foods...');
      const response = await API.get('/foods/homepage');
      console.log('✅ getHomepageFoods response:', response.data.length, 'homepage foods found');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching homepage foods:', error);
      // Fallback to all foods if homepage endpoint doesn't exist
      try {
        console.log('🔄 Falling back to all foods...');
        const fallbackResponse = await API.get('/foods');
        const fallbackData = fallbackResponse.data.slice(0, 8);
        console.log('✅ Fallback successful:', fallbackData.length, 'foods returned');
        return fallbackData;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get food by ID
  getFoodById: async (id) => {
    try {
      console.log(`🔄 Fetching food by ID: ${id}`);
      const response = await API.get(`/foods/${id}`);
      console.log('✅ getFoodById response:', response.data.name);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching food by ID ${id}:`, error);
      if (error.response?.status === 404) {
        console.error(`❌ Food with ID ${id} not found`);
      }
      throw error;
    }
  },

  // Get recommendations using KNN - with detailed error handling
  getRecommendations: async (foodId, k = 5, mode = 'MIXED') => {
    try {
      console.log(`🔄 [DEBUG] Fetching recommendations for food ${foodId}, k=${k}, mode=${mode}`);
      
      // First verify the target food exists
      try {
        const targetFood = await foodService.getFoodById(foodId);
        console.log(`✅ [DEBUG] Target food found: ${targetFood.name}`);
      } catch (targetError) {
        console.error(`❌ [DEBUG] Target food ${foodId} not found:`, targetError);
        throw new Error(`Food with ID ${foodId} not found`);
      }
      
      // Try the main recommendations endpoint
      console.log(`🌐 [DEBUG] Calling: /api/recommendations/${foodId}?k=${k}&mode=${mode}`);
      
      const response = await API.get(`/recommendations/${foodId}`, {
        params: { k, mode },
        timeout: 10000
      });
      
      console.log('✅ [DEBUG] Recommendations API response received');
      
      if (!response.data || response.data.length === 0) {
        console.warn('⚠️ [DEBUG] No recommendations found from API, using fallback');
        return foodService.fallbackRecommendations(foodId, k, mode);
      }
      
      console.log(`✅ [DEBUG] Successfully received ${response.data.length} recommendations`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [DEBUG] Error in getRecommendations:', error);
      
      if (error.code === 'ECONNABORTED') {
        console.error('⏰ [DEBUG] Request timeout - endpoint might not exist');
      }
      
      if (error.response) {
        console.error('📊 [DEBUG] Server response status:', error.response.status);
        console.error('📊 [DEBUG] Server response data:', error.response.data);
        
        if (error.response.status === 404) {
          console.error('🔍 [DEBUG] Endpoint not found (404) - using fallback');
        } else if (error.response.status === 500) {
          console.error('⚡ [DEBUG] Server error (500) - using fallback');
        }
      } else if (error.request) {
        console.error('📡 [DEBUG] No response received - endpoint might not exist');
      } else {
        console.error('🔧 [DEBUG] Error details:', error.message);
      }
      
      // Use fallback recommendations
      console.log('🔄 [DEBUG] Switching to fallback recommendations');
      return foodService.fallbackRecommendations(foodId, k, mode);
    }
  },

  // Alias method for component compatibility
  getRecommendationsWithMode: async (foodId, k = 5, mode = 'MIXED') => {
    return foodService.getRecommendations(foodId, k, mode);
  },

  // Enhanced fallback recommendation function
  fallbackRecommendations: async (foodId, k = 5, mode = 'MIXED') => {
    try {
      console.log(`🔄 [FALLBACK] Generating fallback recommendations for food ${foodId}`);
      
      const targetFood = await foodService.getFoodById(foodId);
      if (!targetFood) {
        throw new Error(`Target food ${foodId} not found`);
      }
      
      const allFoods = await foodService.getAllFoods();
      
      // Filter out target food and ensure we have valid foods
      const otherFoods = allFoods.filter(food => 
        food && food.id !== foodId && food.name && food.category
      );
      
      if (otherFoods.length === 0) {
        console.warn('⚠️ [FALLBACK] No other foods available');
        return [];
      }
      
      // Simple recommendation logic - get random foods from same category
      const sameCategoryFoods = otherFoods.filter(food => 
        food.category === targetFood.category
      );
      
      let recommendations = [];
      
      if (sameCategoryFoods.length > 0) {
        // Shuffle and take k items
        const shuffled = [...sameCategoryFoods].sort(() => 0.5 - Math.random());
        recommendations = shuffled.slice(0, k).map(food => ({
          food,
          similarityScore: 0.7 + Math.random() * 0.2, // Random score between 0.7-0.9
          improvements: {},
          reason: `Similar ${food.type} food from ${food.category} category`
        }));
      } else {
        // Fallback to any random foods
        const shuffled = [...otherFoods].sort(() => 0.5 - Math.random());
        recommendations = shuffled.slice(0, k).map(food => ({
          food,
          similarityScore: 0.5 + Math.random() * 0.3, // Random score between 0.5-0.8
          improvements: {},
          reason: `Alternative ${food.type} food`
        }));
      }
      
      console.log(`✅ [FALLBACK] Generated ${recommendations.length} fallback recommendations`);
      return recommendations;
      
    } catch (error) {
      console.error('❌ [FALLBACK] Error in fallback recommendations:', error);
      return [];
    }
  },

  // Compare foods - Use correct endpoint /api/compare
  compareFoods: async (foodIds) => {
    try {
      console.log('🔄 Comparing foods:', foodIds);
      const response = await API.post('/compare', { foodIds });
      console.log('✅ compareFoods response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error comparing foods:', error);
      console.log('🔄 Using fallback comparison');
      return foodService.fallbackCompare(foodIds);
    }
  },

  // Fallback comparison function
  fallbackCompare: async (foodIds) => {
    try {
      console.log('🔄 Using fallback comparison for foods:', foodIds);
      const foodsToCompare = await Promise.all(
        foodIds.map(id => foodService.getFoodById(id))
      );
      
      const comparison = {
        foods: foodsToCompare,
        nutrientComparisons: [],
        healthiestFood: null,
        recommendations: []
      };
      
      // Find healthiest food based on Nutri-Score
      if (foodsToCompare.length > 0) {
        let healthiest = foodsToCompare[0];
        for (const food of foodsToCompare) {
          if (food.nutriScore && healthiest.nutriScore) {
            if (food.nutriScore < healthiest.nutriScore) {
              healthiest = food;
            }
          }
        }
        comparison.healthiestFood = healthiest;
      }
      
      // Generate simple recommendations
      if (foodsToCompare.length > 0) {
        const recommendations = [];
        const highestCalorie = foodsToCompare.reduce((prev, current) => 
          (prev.calories > current.calories) ? prev : current
        );
        
        const highestProtein = foodsToCompare.reduce((prev, current) => 
          (prev.protein > current.protein) ? prev : current
        );
        
        recommendations.push(`${highestProtein.name} has the highest protein content (${highestProtein.protein}g).`);
        recommendations.push(`${highestCalorie.name} has the highest calorie content (${highestCalorie.calories}kcal).`);
        
        comparison.recommendations = recommendations;
      }
      
      return comparison;
    } catch (error) {
      console.error('❌ Error in fallback comparison:', error);
      throw error;
    }
  }
};

export default foodService;