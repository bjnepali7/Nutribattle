// src/components/admin/FoodManagement.js
// Admin component for managing foods

import React, { useState, useEffect } from 'react';
import foodService from '../../services/foodService';
import adminService from '../../services/adminService';

function FoodManagement({ onEditFood }) {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterCategory, foods]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await foodService.getAllFoods();
      setFoods(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(food => food.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching foods:', error);
      alert('Failed to fetch foods');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...foods];

    // Apply type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(food => food.type === filterType);
    }

    // Apply category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(food => food.category === filterCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFoods(filtered);
  };

  const handleDeleteFood = async (foodId, foodName) => {
    if (window.confirm(`Are you sure you want to delete "${foodName}"? This action cannot be undone.`)) {
      try {
        await adminService.deleteFood(foodId);
        await fetchFoods(); // Refresh the list
        alert('Food deleted successfully');
      } catch (error) {
        console.error('Error deleting food:', error);
        alert('Failed to delete food. It might be referenced in user food logs.');
      }
    }
  };

  // Get Nutri-Score color
  const getNutriScoreColor = (score) => {
    switch(score) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-lime-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'E': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Food Management</h2>
            <p className="text-gray-600 mt-1">
              Total Foods: {foods.length} | Showing: {filteredFoods.length}
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => onEditFood(null)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New Food
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="All">All Types</option>
              <option value="Traditional">Traditional</option>
              <option value="Modern">Modern</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Foods Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Food</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Nutri-Score</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Calories</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Protein</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Carbs</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Fat</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food) => (
                    <tr key={food.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {food.imageUrl ? (
                            <img 
                              src={food.imageUrl} 
                              alt={food.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`${food.imageUrl ? 'hidden' : 'flex'} w-10 h-10 rounded-lg bg-gray-200 items-center justify-center mr-3`}
                          >
                            <span className="text-lg">🍽️</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{food.name}</p>
                            <p className="text-xs text-gray-500">ID: {food.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{food.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${
                          food.type === 'Traditional' ? 'bg-nepali-red' : 'bg-nepali-blue'
                        }`}>
                          {food.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-bold text-white rounded-full ${
                          getNutriScoreColor(food.nutriScore)
                        }`}>
                          {food.nutriScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-700">{food.calories}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-700">{food.protein}g</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-700">{food.carbs}g</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-700">{food.fat}g</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => onEditFood(food)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Food"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteFood(food.id, food.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Food"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-gray-500">
                      No foods found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodManagement;