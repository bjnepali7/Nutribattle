// src/services/calorieKnnService.js
import api from './api';

const calorieKnnService = {
  getRecommendations: async (mealType) => {
    try {
      const response = await api.get(`/api/knn/recommend?mealType=${mealType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching calorie recommendations:', error);
      throw error;
    }
  }
};

export default calorieKnnService;