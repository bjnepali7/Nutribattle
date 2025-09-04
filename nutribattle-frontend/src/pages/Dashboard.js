// src/pages/Dashboard.js
// Main dashboard page with tabs for different features

import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import FoodComparison from '../components/dashboard/FoodComparison';
import FoodRecommendations from '../components/dashboard/FoodRecommendations';
import NutritionTracker from '../components/dashboard/NutritionTracker';
import DashboardOverview from '../components/dashboard/DashboardOverview';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user info
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tracker', label: 'Track Nutrition', icon: '🍽️' },
    { id: 'compare', label: 'Compare Foods', icon: '⚖️' },
    { id: 'recommend', label: 'AI Recommendations', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Dashboard Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.fullName || user?.username}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Track your nutrition and make healthier food choices
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today's Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-nepali-blue to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 border-b-3 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-nepali-blue border-nepali-blue bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'tracker' && <NutritionTracker />}
        {activeTab === 'compare' && <FoodComparison />}
        {activeTab === 'recommend' && <FoodRecommendations />}
      </div>
    </div>
  );
}

export default Dashboard;