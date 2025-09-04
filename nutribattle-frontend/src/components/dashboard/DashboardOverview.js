// src/components/dashboard/DashboardOverview.js
// Dashboard overview showing daily summary and quick stats

import React, { useState, useEffect } from 'react';
import nutritionService from '../../services/nutritionService';
import userService from '../../services/userService';

function DashboardOverview() {
  const [dailySummary, setDailySummary] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch today's nutrition summary
      const summary = await nutritionService.getDailyNutrition();
      setDailySummary(summary);
      
      // Fetch user profile
      const profile = await userService.getProfile();
      setUserProfile(profile);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage of goal achieved
  const calculatePercentage = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.round((current / goal) * 100);
  };

  // Get color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-green-500';
    return 'bg-purple-500'; // Over 100%
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Calories Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Today</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Calories</h3>
          <p className="text-2xl font-bold text-gray-900">
            {dailySummary?.totalCalories?.toFixed(0) || 0}
            <span className="text-sm font-normal text-gray-500">
              {' '}/ {dailySummary?.calorieGoal?.toFixed(0) || 2000} kcal
            </span>
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(dailySummary?.caloriePercentage || 0)}`}
              style={{ width: `${Math.min(dailySummary?.caloriePercentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {dailySummary?.caloriePercentage?.toFixed(0) || 0}% of daily goal
          </p>
        </div>

        {/* Protein Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Today</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Protein</h3>
          <p className="text-2xl font-bold text-gray-900">
            {dailySummary?.totalProtein?.toFixed(1) || 0}g
            <span className="text-sm font-normal text-gray-500">
              {' '}/ {dailySummary?.proteinGoal?.toFixed(0) || 50}g
            </span>
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(dailySummary?.proteinPercentage || 0)}`}
              style={{ width: `${Math.min(dailySummary?.proteinPercentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {dailySummary?.proteinPercentage?.toFixed(0) || 0}% of daily goal
          </p>
        </div>

        {/* Carbs Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Today</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Carbs</h3>
          <p className="text-2xl font-bold text-gray-900">
            {dailySummary?.totalCarbs?.toFixed(1) || 0}g
            <span className="text-sm font-normal text-gray-500">
              {' '}/ {dailySummary?.carbGoal?.toFixed(0) || 275}g
            </span>
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(dailySummary?.carbPercentage || 0)}`}
              style={{ width: `${Math.min(dailySummary?.carbPercentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {dailySummary?.carbPercentage?.toFixed(0) || 0}% of daily goal
          </p>
        </div>

        {/* Fat Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🥑</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Today</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Fat</h3>
          <p className="text-2xl font-bold text-gray-900">
            {dailySummary?.totalFat?.toFixed(1) || 0}g
            <span className="text-sm font-normal text-gray-500">
              {' '}/ {dailySummary?.fatGoal?.toFixed(0) || 65}g
            </span>
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(dailySummary?.fatPercentage || 0)}`}
              style={{ width: `${Math.min(dailySummary?.fatPercentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {dailySummary?.fatPercentage?.toFixed(0) || 0}% of daily goal
          </p>
        </div>
      </div>

      {/* Today's Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Meals</h2>
          <div className="space-y-3">
            {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((mealType) => {
              const meal = dailySummary?.mealBreakdown?.[mealType];
              return (
                <div key={mealType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {mealType === 'BREAKFAST' && '🌅'}
                      {mealType === 'LUNCH' && '☀️'}
                      {mealType === 'DINNER' && '🌙'}
                      {mealType === 'SNACK' && '🍿'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{mealType.toLowerCase()}</p>
                      <p className="text-sm text-gray-500">
                        {meal?.itemCount || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {meal?.calories?.toFixed(0) || 0} kcal
                    </p>
                    <p className="text-xs text-gray-500">
                      P: {meal?.protein?.toFixed(0) || 0}g | 
                      C: {meal?.carbs?.toFixed(0) || 0}g | 
                      F: {meal?.fat?.toFixed(0) || 0}g
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '#tracker'}
              className="w-full p-4 bg-gradient-to-r from-nepali-blue to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">➕</span>
                <span className="font-medium">Log Food Intake</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => window.location.href = '#compare'}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚖️</span>
                <span className="font-medium">Compare Foods</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => window.location.href = '#recommend'}
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <span className="font-medium">Get AI Recommendations</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Food Items */}
      {dailySummary?.foodItems && dailySummary.foodItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Food Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Food</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Meal</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Quantity</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Calories</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Nutri-Score</th>
                </tr>
              </thead>
              <tbody>
                {dailySummary.foodItems.slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <p className="font-medium text-gray-900">{item.foodName}</p>
                      <p className="text-xs text-gray-500">{item.foodCategory}</p>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-sm capitalize text-gray-700">
                        {item.mealType.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-sm text-gray-700">{item.quantity}g</span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {item.calories.toFixed(0)} kcal
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-bold text-white rounded-full
                        ${item.nutriScore === 'A' ? 'bg-green-500' : ''}
                        ${item.nutriScore === 'B' ? 'bg-lime-500' : ''}
                        ${item.nutriScore === 'C' ? 'bg-yellow-500' : ''}
                        ${item.nutriScore === 'D' ? 'bg-orange-500' : ''}
                        ${item.nutriScore === 'E' ? 'bg-red-500' : ''}
                      `}>
                        {item.nutriScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!dailySummary?.foodItems || dailySummary.foodItems.length === 0) && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">🍽️</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No meals logged today</h3>
          <p className="text-gray-600 mb-6">Start tracking your nutrition by logging your first meal</p>
          <button
            onClick={() => window.location.href = '#tracker'}
            className="bg-gradient-to-r from-nepali-blue to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Log Your First Meal
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardOverview;