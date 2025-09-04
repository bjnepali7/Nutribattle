// src/services/authService.js
// This file contains all authentication-related functions

import API from './api';

const authService = {
  // Login function - sends username and password to backend
  login: async (username, password) => {
    try {
      const response = await API.post('/auth/login', {
        username,
        password,
      });
      
      // If login is successful, save the token and user info
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Signup function - registers a new user
  signup: async (userData) => {
    try {
      const response = await API.post('/auth/signup', userData);
      
      // If signup is successful, save the token and user info
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check username availability - Fixed to use correct API format
  checkUsername: async (username) => {
    try {
      // Use regular axios without auth token for public endpoint
      const response = await API.get(`/auth/check-username`, {
        params: { username: username }
      });
      return response;
    } catch (error) {
      console.error('Error checking username:', error);
      // Return a safe default if API fails
      return { data: { success: true, message: 'Unable to check' } };
    }
  },

  // Check email availability - Fixed to use correct API format
  checkEmail: async (email) => {
    try {
      // Use regular axios without auth token for public endpoint
      const response = await API.get(`/auth/check-email`, {
        params: { email: email }
      });
      return response;
    } catch (error) {
      console.error('Error checking email:', error);
      // Return a safe default if API fails
      return { data: { success: true, message: 'Unable to check' } };
    }
  },

  // Logout function - clears stored data
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'ADMIN';
  },
}

export default authService;