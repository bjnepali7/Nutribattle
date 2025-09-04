// File: C:\Nutribattle\nutribattle-frontend\src\pages\Homepage.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import foodService from '../services/foodService';

function Homepage() {
  const [displayFoods, setDisplayFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomepageFoods();
  }, []);

  // Function to fetch foods for homepage
  const fetchHomepageFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch foods for homepage - backend will only return foods with existing images
      const foods = await foodService.getHomepageFoods();
      setDisplayFoods(foods);
      console.log(`Loaded ${foods.length} foods with images`);
    } catch (err) {
      console.error('Error fetching foods:', err);
      setError('Failed to load foods. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Handle food click - navigate to food detail
  const handleFoodClick = (food) => {
    // Navigate to food detail page (you can implement this later)
    console.log('Clicked on food:', food);
    // navigate(`/food/${food.id}`); // Uncomment when food detail page is ready
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Welcome text */}
            <div className="text-left">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-nepali-red to-nepali-blue text-white text-sm font-semibold px-4 py-2 rounded-full">
                  🎯 Nutrition Battle
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-nepali-red to-nepali-blue bg-clip-text text-transparent">
                  NutriBattle
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Discover the nutritional battle between traditional Nepali foods 
                and modern alternatives. Make informed choices for a healthier you.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/foods"
                  className="px-6 py-3 bg-gradient-to-r from-nepali-red to-nepali-blue text-white font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Explore All Foods
                </Link>
                <Link
                  to="/compare"
                  className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-full border-2 border-gray-200 hover:border-nepali-blue hover:text-nepali-blue transition-all duration-300"
                >
                  Compare Foods
                </Link>
              </div>
            </div>
            
              {/* Right side - Nutrition image/illustration */}
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop" 
                  alt="Healthy Food"
                  className="rounded-2xl shadow-2xl w-full"
                  onError={(e) => {
                    // Fallback to a gradient box with emoji if image fails
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="hidden w-full h-96 rounded-2xl bg-gradient-to-br from-nepali-red/20 to-nepali-blue/20 items-center justify-center"
                  style={{ display: 'none' }}
                >
                  <div className="text-center">
                    <div className="text-8xl mb-4">🥗</div>
                    <p className="text-xl font-semibold text-gray-700">Nutritious Foods</p>
                  </div>
                </div>
              </div>
              </div>
          </div>
        </div>
      </section>

      {/* Food Gallery Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="bg-gradient-to-r from-nepali-red to-nepali-blue text-white text-sm font-semibold px-4 py-2 rounded-full">
              🍽️ Featured Collection
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-6 mb-4">
              Discover Popular Nepali Foods
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {displayFoods.length > 0 
                ? `Explore ${displayFoods.length} authentic foods with detailed nutritional information`
                : 'Loading delicious foods...'}
            </p>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-nepali-blue"></div>
              <p className="mt-4 text-gray-600">Loading delicious foods...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchHomepageFoods}
                className="px-6 py-2 bg-nepali-blue text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Food Grid */}
          {!loading && !error && displayFoods.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayFoods.map(food => (
                  <FoodCard 
                    key={food.id} 
                    food={food} 
                    onClick={handleFoodClick}
                  />
                ))}
              </div>
              
              {/* View All Button */}
              <div className="text-center mt-12">
                <Link 
                  to="/foods"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-nepali-red to-nepali-blue text-white font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  View All Foods
                </Link>
              </div>
            </>
          )}
          
          {/* No Foods Message */}
          {!loading && !error && displayFoods.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-600 text-lg mb-4">
                No foods with images available yet.
              </p>
              <p className="text-gray-500">
                Please add food images to the server to see them here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose NutriBattle?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-nepali-red rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🍛</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Traditional Foods</h3>
              <p className="text-sm text-gray-600">
                Complete nutritional data for authentic Nepali dishes
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-nepali-blue rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">⚖️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Comparison</h3>
              <p className="text-sm text-gray-600">
                Compare multiple foods side-by-side instantly
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Recommendations</h3>
              <p className="text-sm text-gray-600">
                Get personalized healthier alternatives using KNN
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600">
                Monitor your daily nutritional intake easily
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;