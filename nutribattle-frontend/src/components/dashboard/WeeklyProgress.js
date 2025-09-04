// File: src/components/dashboard/WeeklyProgress.js

import React, { useState, useEffect } from 'react';
import nutritionService from '../../services/nutritionService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

function WeeklyProgress() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      const data = await nutritionService.getWeeklyNutrition();
      setWeeklyData(data);
    } catch (err) {
      console.error('Error fetching weekly data:', err);
      setError('Failed to load weekly progress');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!weeklyData?.dailySummaries) return [];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weeklyData.dailySummaries.map((day, index) => ({
      day: days[index],
      calories: Math.round(day.totalCalories || 0),
      protein: Math.round(day.totalProtein || 0),
      carbs: Math.round(day.totalCarbs || 0),
      fat: Math.round(day.totalFat || 0),
      goal: Math.round(day.calorieGoal || 2000)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="weekly-progress">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Progress</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Avg Daily Calories</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(weeklyData?.averageCalories || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Avg Daily Protein</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(weeklyData?.averageProtein || 0)}g
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Avg Daily Carbs</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(weeklyData?.averageCarbs || 0)}g
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Avg Daily Fat</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(weeklyData?.averageFat || 0)}g
          </p>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Weekly Calorie Intake</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="calories" 
              stroke="#3B82F6" 
              name="Calories"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="goal" 
              stroke="#EF4444" 
              name="Goal"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Macros Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Weekly Macronutrients</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="protein" fill="#10B981" name="Protein (g)" />
            <Bar dataKey="carbs" fill="#F59E0B" name="Carbs (g)" />
            <Bar dataKey="fat" fill="#8B5CF6" name="Fat (g)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most Consumed Foods */}
      {weeklyData?.mostConsumedFoods && Object.keys(weeklyData.mostConsumedFoods).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Most Consumed Foods This Week</h3>
          <div className="space-y-3">
            {Object.entries(weeklyData.mostConsumedFoods).map(([food, count]) => (
              <div key={food} className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium">{food}</span>
                <span className="text-sm text-gray-600">{count} times</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {weeklyData?.recommendations && weeklyData.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Recommendations</h3>
          <ul className="space-y-2">
            {weeklyData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WeeklyProgress;