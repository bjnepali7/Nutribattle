// src/pages/AllFoods.js
// SAVE THIS FILE IN: C:\Nutribattle\nutribattle-frontend\src\pages\AllFoods.js

import React, { useState, useEffect } from 'react';
import FoodCard from '../components/FoodCard';
import foodService from '../services/foodService';

function AllFoods() {
  // State for all foods
  const [foods, setFoods] = useState([]);
  // State for filtered foods (what we actually display)
  const [filteredFoods, setFilteredFoods] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  // State for filter type (All, Traditional, Modern)
  const [filterType, setFilterType] = useState('All');
  // State for category filter
  const [selectedCategory, setSelectedCategory] = useState('All');
  // State for unique categories
  const [categories, setCategories] = useState([]);

  // Load all foods when component mounts
  useEffect(() => {
    fetchAllFoods();
  }, []);

  // Apply filters whenever search term or filter type changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, selectedCategory, foods]);

  // Fetch all foods from backend
  const fetchAllFoods = async () => {
    try {
      setLoading(true);
      const data = await foodService.getAllFoods();
      setFoods(data);
      setFilteredFoods(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(food => food.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and type filters
  const applyFilters = () => {
    let filtered = [...foods];

    // Apply type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(food => food.type === filterType);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(food => food.category === selectedCategory);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <span className="bg-gradient-to-r from-nepali-red to-nepali-blue text-white text-sm font-semibold px-4 py-2 rounded-full">
              🍽️ Complete Food Database
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              Explore All Foods
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Browse our complete collection of traditional and modern foods
            </p>
          </div>

          {/* Modern Filter Controls */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-xl p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by food name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-nepali-blue transition-colors text-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-4">
              {/* Type Filters */}
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold text-gray-600 mb-2">Food Type</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType('All')}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      filterType === 'All' 
                        ? 'bg-gradient-to-r from-nepali-blue to-blue-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                    <span className="ml-1 text-xs opacity-75">({foods.length})</span>
                  </button>
                  <button
                    onClick={() => setFilterType('Traditional')}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      filterType === 'Traditional' 
                        ? 'bg-gradient-to-r from-red-500 to-nepali-red text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Traditional
                  </button>
                  <button
                    onClick={() => setFilterType('Modern')}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      filterType === 'Modern' 
                        ? 'bg-gradient-to-r from-blue-500 to-nepali-blue text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Modern
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold text-gray-600 mb-2">Category</p>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-nepali-blue transition-colors"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredFoods.length}</span> of {foods.length} foods
              </p>
              {(searchTerm || filterType !== 'All' || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('All');
                    setSelectedCategory('All');
                  }}
                  className="text-sm text-nepali-blue hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-nepali-blue"></div>
            <p className="mt-4 text-gray-600">Loading delicious foods...</p>
          </div>
        )}

        {/* Foods Grid */}
        {!loading && (
          <>
            {filteredFoods.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFoods.map((food) => (
                  <FoodCard 
                    key={food.id} 
                    food={food}
                    onClick={(food) => console.log('Food clicked:', food)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                  <span className="text-6xl block mb-4">🔍</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No foods found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search term
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('All');
                      setSelectedCategory('All');
                    }}
                    className="bg-gradient-to-r from-nepali-blue to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AllFoods;