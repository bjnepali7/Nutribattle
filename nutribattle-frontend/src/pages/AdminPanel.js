// src/pages/AdminPanel.js
// Main admin panel page with tabs for different admin features

import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import AdminOverview from '../components/admin/AdminOverview';
import UserManagement from '../components/admin/UserManagement';
import FoodManagement from '../components/admin/FoodManagement';
import AddEditFood from '../components/admin/AddEditFood';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [editingFood, setEditingFood] = useState(null);

  useEffect(() => {
    // Get current user info
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Verify admin role
    if (!authService.isAdmin()) {
      window.location.href = '/dashboard';
    }
  }, []);

  // Handle food edit
  const handleEditFood = (food) => {
    setEditingFood(food);
    setActiveTab('add-food');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingFood(null);
    setActiveTab('food-management');
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'user-management', label: 'Users', icon: '👥' },
    { id: 'food-management', label: 'Foods', icon: '🍽️' },
    { id: 'add-food', label: editingFood ? 'Edit Food' : 'Add Food', icon: '➕' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Panel 🛡️
              </h1>
              <p className="text-gray-600 mt-1">
                Manage users, foods, and monitor system activity
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  Admin Access
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.username}
                  </p>
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
                onClick={() => {
                  if (tab.id !== 'add-food' || !editingFood) {
                    setEditingFood(null);
                  }
                  setActiveTab(tab.id);
                }}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 border-b-3 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-red-600 border-red-600 bg-red-50'
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
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'user-management' && <UserManagement />}
        {activeTab === 'food-management' && <FoodManagement onEditFood={handleEditFood} />}
        {activeTab === 'add-food' && (
          <AddEditFood 
            editingFood={editingFood} 
            onCancel={handleCancelEdit}
            onSuccess={() => {
              setEditingFood(null);
              setActiveTab('food-management');
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AdminPanel;