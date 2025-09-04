// src/components/dashboard/FoodRecommendations.js
// FIXED: Updated method call to use correct service method
// UPDATED: Changed search to select dropdown

import React, { useState, useEffect } from 'react';
import foodService from '../../services/foodService';

function FoodRecommendations() {
  const [allFoods, setAllFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [numberOfRecs, setNumberOfRecs] = useState(5);
  const [recommendationMode, setRecommendationMode] = useState('MIXED');

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const foods = await foodService.getAllFoods();
      setAllFoods(foods);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!selectedFood) {
      alert('Please select a food first');
      return;
    }

    try {
      setFetching(true);
      // FIXED: Using the correct method name
      const recs = await foodService.getRecommendationsWithMode(
        selectedFood.id, 
        numberOfRecs, 
        recommendationMode
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleFoodSelect = (e) => {
    const foodId = e.target.value;
    if (foodId === "") {
      setSelectedFood(null);
      return;
    }
    
    const food = allFoods.find(f => f.id === parseInt(foodId));
    setSelectedFood(food);
    setRecommendations([]); // Clear previous recommendations
  };

  // Get improvement badge color
  const getImprovementColor = (value) => {
    if (value > 30) return 'text-green-600 bg-green-50';
    if (value > 10) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Get mode description
  const getModeDescription = (mode) => {
    switch(mode) {
      case 'SAME_CATEGORY':
        return 'Recommends foods from the same category as your selection';
      case 'OPPOSITE_CATEGORY':
        return 'Recommends foods from opposite type (Traditional ↔ Modern)';
      case 'MIXED':
        return 'Recommends foods from all categories for best matches';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Food Recommendations</h2>
        <p className="text-gray-600">
          Get personalized healthier alternatives using our KNN (K-Nearest Neighbors) algorithm
        </p>
      </div>

      {/* Food Selection and Mode */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Settings</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Food Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Food
              </label>
              <select
                value={selectedFood?.id || ""}
                onChange={handleFoodSelect}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                disabled={loading}
              >
                <option value="">Choose a food...</option>
                {allFoods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} - {food.category} ({food.type})
                  </option>
                ))}
              </select>
              {loading && (
                <p className="text-sm text-gray-500 mt-1">Loading foods...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of recommendations
              </label>
              <select
                value={numberOfRecs}
                onChange={(e) => setNumberOfRecs(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
              >
                <option value="3">3 recommendations</option>
                <option value="5">5 recommendations</option>
                <option value="7">7 recommendations</option>
                <option value="10">10 recommendations</option>
              </select>
            </div>
          </div>

          {/* Right Column - Recommendation Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recommendation Mode
            </label>
            <div className="space-y-3">
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value="MIXED"
                  checked={recommendationMode === 'MIXED'}
                  onChange={(e) => setRecommendationMode(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">Mixed</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Recommended</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {getModeDescription('MIXED')}
                  </p>
                </div>
              </label>

              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value="SAME_CATEGORY"
                  checked={recommendationMode === 'SAME_CATEGORY'}
                  onChange={(e) => setRecommendationMode(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-grow">
                  <div className="font-medium text-gray-900">Same Category</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {getModeDescription('SAME_CATEGORY')}
                  </p>
                </div>
              </label>

              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value='OPPOSITE_CATEGORY'
                  checked={recommendationMode === 'OPPOSITE_CATEGORY'}
                  onChange={(e) => setRecommendationMode(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-grow">
                  <div className="font-medium text-gray-900">Opposite Type</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {getModeDescription('OPPOSITE_CATEGORY')}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Selected Food Preview */}
        {selectedFood && (
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Selected Food</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{selectedFood.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <span className={`inline-block px-2 py-1 text-xs font-bold text-white rounded ${
                  selectedFood.type === 'Traditional' ? 'bg-nepali-red' : 'bg-nepali-blue'
                }`}>
                  {selectedFood.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{selectedFood.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Calories</p>
                <p className="font-medium">{selectedFood.calories} kcal</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={getRecommendations}
          disabled={!selectedFood || fetching}
          className={`mt-6 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            !selectedFood || fetching
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          {fetching ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting AI Recommendations...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="text-xl mr-2">🤖</span>
              Get AI Recommendations
            </span>
          )}
        </button>
      </div>

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              <span className="text-2xl mr-2">✨</span>
              AI-Powered Recommendations
              {recommendationMode !== 'MIXED' && (
                <span className="ml-3 text-sm font-normal px-3 py-1 bg-white rounded-full">
                  Mode: {recommendationMode === 'SAME_CATEGORY' ? 'Same Category' : 'Opposite Type'}
                </span>
              )}
            </h3>
            <p className="text-gray-700">
              Based on nutritional similarity and health scores, here are better alternatives to {selectedFood?.name}:
            </p>
          </div>

          {recommendations.map((rec, index) => (
            <div key={rec.food.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl font-bold text-gray-300">#{index + 1}</span>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{rec.food.name}</h4>
                      <p className="text-sm text-gray-600">{rec.food.category}</p>
                    </div>
                  </div>

                  {/* Similarity Score */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Similarity Score:</span>
                      <div className="flex-grow max-w-xs">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(rec.similarityScore * 100).toFixed(0)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {(rec.similarityScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Improvements */}
                  {rec.improvements && Object.keys(rec.improvements).length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Nutritional Improvements:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(rec.improvements).map(([key, value]) => (
                          <span
                            key={key}
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getImprovementColor(value)}`}
                          >
                            {key === 'calories' && `${value.toFixed(0)}% fewer calories`}
                            {key === 'sugar' && `${value.toFixed(0)}% less sugar`}
                            {key === 'saturatedFat' && `${value.toFixed(0)}% less sat. fat`}
                            {key === 'sodium' && `${value.toFixed(0)}% less sodium`}
                            {key === 'protein' && `${value.toFixed(0)}% more protein`}
                            {key === 'fiber' && `${value.toFixed(0)}% more fiber`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <p className="text-gray-700 italic">{rec.reason}</p>

                  {/* Nutritional Info */}
                  <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Calories</p>
                      <p className="text-sm font-semibold">{rec.food.calories} kcal</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Protein</p>
                      <p className="text-sm font-semibold">{rec.food.protein}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Carbs</p>
                      <p className="text-sm font-semibold">{rec.food.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fat</p>
                      <p className="text-sm font-semibold">{rec.food.fat}g</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col space-y-2 ml-4">
                  <span className={`inline-block px-3 py-1 text-xs font-bold text-white rounded ${
                    rec.food.type === 'Traditional' ? 'bg-nepali-red' : 'bg-nepali-blue'
                  }`}>
                    {rec.food.type}
                  </span>
                  <span className={`inline-block px-3 py-2 text-sm font-bold text-white rounded-full text-center
                    ${rec.food.nutriScore === 'A' ? 'bg-green-500' : ''}
                    ${rec.food.nutriScore === 'B' ? 'bg-lime-500' : ''}
                    ${rec.food.nutriScore === 'C' ? 'bg-yellow-500' : ''}
                    ${rec.food.nutriScore === 'D' ? 'bg-orange-500' : ''}
                    ${rec.food.nutriScore === 'E' ? 'bg-red-500' : ''}
                  `}>
                    Score<br/>{rec.food.nutriScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FoodRecommendations;