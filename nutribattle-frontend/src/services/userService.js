// src/services/userService.js
// This file handles all user profile API calls

import API from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await API.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get nutrition goals
  getNutritionGoals: async () => {
    try {
      const response = await API.get('/user/goals');
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
      throw error;
    }
  },

  // Update nutrition goals
  updateNutritionGoals: async (goalsData) => {
    try {
      const response = await API.put('/user/goals', goalsData);
      return response.data;
    } catch (error) {
      console.error('Error updating nutrition goals:', error);
      throw error;
    }
  },

  // Calculate recommended goals
  calculateRecommendedGoals: async () => {
    try {
      const response = await API.get('/user/goals/calculate');
      return response.data;
    } catch (error) {
      console.error('Error calculating recommended goals:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await API.put('/user/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },
};

export default userService;