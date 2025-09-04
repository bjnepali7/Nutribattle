// src/components/admin/AdminOverview.js
// Admin dashboard overview showing system statistics

import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-sm font-medium text-gray-500">All Time</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.totalUsers || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Registered users in the system
          </p>
        </div>

        {/* Total Foods Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Database</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Foods</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.totalFoods || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Foods available in database
          </p>
        </div>

        {/* Traditional Foods Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🍛</span>
            </div>
            <span className="text-sm font-medium text-nepali-red">Traditional</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Traditional Foods</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.traditionalFoods || 0}
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Percentage:</span>
              <span className="font-medium">
                {stats?.totalFoods > 0 
                  ? ((stats.traditionalFoods / stats.totalFoods) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Modern Foods Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🍔</span>
            </div>
            <span className="text-sm font-medium text-nepali-blue">Modern</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Modern Foods</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.modernFoods || 0}
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Percentage:</span>
              <span className="font-medium">
                {stats?.totalFoods > 0 
                  ? ((stats.modernFoods / stats.totalFoods) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '#user-management'}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👥</span>
                <span className="font-medium">Manage Users</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => window.location.href = '#food-management'}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🍽️</span>
                <span className="font-medium">Manage Foods</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => window.location.href = '#add-food'}
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">➕</span>
                <span className="font-medium">Add New Food</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Database Status</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">API Status</span>
              </div>
              <span className="text-green-600 font-medium">Operational</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Last Update</span>
              </div>
              <span className="text-blue-600 font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Food Distribution Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Food Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">By Type</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Traditional</span>
                  <span className="font-medium">{stats?.traditionalFoods || 0}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-nepali-red h-4 rounded-full"
                    style={{ 
                      width: `${stats?.totalFoods > 0 
                        ? (stats.traditionalFoods / stats.totalFoods) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Modern</span>
                  <span className="font-medium">{stats?.modernFoods || 0}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-nepali-blue h-4 rounded-full"
                    style={{ 
                      width: `${stats?.totalFoods > 0 
                        ? (stats.modernFoods / stats.totalFoods) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stats?.totalFoods || 0}
                </p>
                <p className="text-sm text-gray-600">Total Foods in Database</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-nepali-red">
                    {stats?.totalFoods > 0 
                      ? ((stats.traditionalFoods / stats.totalFoods) * 100).toFixed(0) 
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-600">Traditional</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-nepali-blue">
                    {stats?.totalFoods > 0 
                      ? ((stats.modernFoods / stats.totalFoods) * 100).toFixed(0) 
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-600">Modern</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;