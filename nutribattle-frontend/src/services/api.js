// src/services/api.js
// This file handles all our API communication with the backend
import axios from 'axios';

// Create an axios instance with default settings
const API = axios.create({
baseURL: 'http://localhost:8080/api', // Your Spring Boot backend URL
headers: {
'Content-Type': 'application/json',
},
});

// Add a request interceptor to include the JWT token in every request
API.interceptors.request.use(
(config) => {
// Get the token from localStorage (we'll save it there after login)
const token = localStorage.getItem('token');
// If we have a token, add it to the Authorization header
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}

return config;
},
(error) => {
return Promise.reject(error);
}
);

// Add a response interceptor to handle errors globally
API.interceptors.response.use(
(response) => {
// If the request succeeds, just return the response
return response;
},
(error) => {
// If we get a 401 error, it means our token is invalid or expired
if (error.response && error.response.status === 401) {
// Clear the invalid token
localStorage.removeItem('token');
localStorage.removeItem('user');

  // Redirect to login page (we'll implement this later)
  window.location.href = '/login';
}

return Promise.reject(error);
}
);

export default API;