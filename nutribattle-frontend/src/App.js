// src/App.js
// This is the main component of our application with all routing
// COMPLETE UPDATED VERSION WITH ALL FEATURES

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Homepage from './pages/Homepage';
import AllFoods from './pages/AllFoods';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TestAPI from './pages/TestAPI';
import Profile from './pages/Profile'; // Import the Profile component

function App() {
  return (
    <Router>
      {/* Navbar appears on all pages */}
      <Navbar />
      
      {/* Main content area */}
      <div className="min-h-screen">
        <Routes>
          {/* Public Routes - Anyone can access these */}
          <Route path="/" element={<Homepage />} />
          <Route path="/foods" element={<AllFoods />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/test-api" element={<TestAPI />} />
          
          {/* Protected Routes - Require login */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Profile Route - Require login */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Require admin role */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          {/* 404 Page - When no route matches */}
          <Route path="*" element={
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <a href="/" className="text-nepali-blue hover:underline">Go back to homepage</a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;