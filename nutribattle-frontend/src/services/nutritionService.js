// File: src/services/nutritionService.js

import API from './api';

const nutritionService = {
  // Set nutrition goals
  setNutritionGoals: async (goalsData) => {
    try {
      console.log('Setting nutrition goals:', goalsData); // Debug log
      const response = await API.post('/nutrition/goals', goalsData);
      console.log('setNutritionGoals response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error setting nutrition goals:', error);
      throw error;
    }
  },

  // Get nutrition goals
  getNutritionGoals: async () => {
    try {
      const response = await API.get('/nutrition/goals');
      console.log('getNutritionGoals response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
      // Return default values if endpoint fails
      return {
        nutritionGoal: 'MAINTAIN',
        ageGroup: 'MIDDLE_AGE',
        dailyCalorieGoal: 2000,
        dailyProteinGoal: 50,
        dailyCarbGoal: 275,
        dailyFatGoal: 65
      };
    }
  },

  // Get calorie-based KNN recommendations
  getCalorieRecommendations: async (mealType = 'LUNCH') => {
    try {
      console.log('Getting calorie recommendations for:', mealType); // Debug log
      const response = await API.get('/nutrition/recommendations/calories', {
        params: { mealType }
      });
      console.log('getCalorieRecommendations response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching calorie recommendations:', error);
      throw error;
    }
  },

  // Add food intake
  addFoodIntake: async (intakeData) => {
    try {
      console.log('Adding food intake:', intakeData); // Debug log
      const response = await API.post('/nutrition/intake', intakeData);
      console.log('addFoodIntake response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error adding food intake:', error);
      throw error;
    }
  },

  // Get daily nutrition
  getDailyNutrition: async (date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await API.get('/nutrition/daily', { params });
      console.log('getDailyNutrition response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching daily nutrition:', error);
      // Return default empty values if endpoint fails
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSodium: 0,
        calorieGoal: 2000,
        proteinGoal: 50,
        carbGoal: 275,
        fatGoal: 65,
        foodItems: []
      };
    }
  },

  // Get weekly nutrition
  getWeeklyNutrition: async (startDate = null) => {
    try {
      const params = startDate ? { startDate } : {};
      const response = await API.get('/nutrition/weekly', { params });
      console.log('getWeeklyNutrition response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly nutrition:', error);
      throw error;
    }
  },

  // Update food intake
  updateFoodIntake: async (intakeId, intakeData) => {
    try {
      const response = await API.put(`/nutrition/intake/${intakeId}`, intakeData);
      return response.data;
    } catch (error) {
      console.error('Error updating food intake:', error);
      throw error;
    }
  },

  // Delete food intake
  deleteFoodIntake: async (intakeId) => {
    try {
      const response = await API.delete(`/nutrition/intake/${intakeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting food intake:', error);
      throw error;
    }
  }
};

export default nutritionService;