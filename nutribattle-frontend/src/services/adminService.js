// src/services/adminService.js
// This file handles all admin-related API calls

import API from './api';

const adminService = {
  // User Management
  getAllUsers: async (page = 0, size = 10) => {
    try {
      const response = await API.get(`/admin/users?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await API.put(`/admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  makeUserAdmin: async (userId) => {
    try {
      const response = await API.put(`/admin/users/${userId}/make-admin`);
      return response.data;
    } catch (error) {
      console.error('Error making user admin:', error);
      throw error;
    }
  },

  // Food Management
  addFood: async (foodData) => {
    try {
      const response = await API.post('/admin/foods', foodData);
      return response.data;
    } catch (error) {
      console.error('Error adding food:', error);
      throw error;
    }
  },

  updateFood: async (foodId, foodData) => {
    try {
      const response = await API.put(`/admin/foods/${foodId}`, foodData);
      return response.data;
    } catch (error) {
      console.error('Error updating food:', error);
      throw error;
    }
  },

  deleteFood: async (foodId) => {
    try {
      const response = await API.delete(`/admin/foods/${foodId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting food:', error);
      throw error;
    }
  },

  // Statistics
  getSystemStats: async () => {
    try {
      const response = await API.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },
};

export default adminService;