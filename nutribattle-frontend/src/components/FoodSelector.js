// File: src/components/FoodSelector.js

import React, { useState, useEffect, useCallback } from 'react';
import foodService from '../services/foodService';
import nutritionService from '../services/nutritionService';

function FoodSelector({ mealType, onFoodSelect }) {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [knnRecommendations, setKnnRecommendations] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showKnn, setShowKnn] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchFoods = useCallback(async () => {
    try {
      const data = await foodService.getAllFoods();
      setFoods(data);
      setFilteredFoods(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const filterFoods = useCallback(() => {
    if (!searchTerm) {
      setFilteredFoods(foods);
      return;
    }
    
    const filtered = foods.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFoods(filtered);
  }, [searchTerm, foods]);

  useEffect(() => {
    filterFoods();
  }, [filterFoods]);

  const fetchKnnRecommendations = async () => {
    setLoading(true);
    try {
      const data = await nutritionService.getCalorieRecommendations(mealType);
      setKnnRecommendations(data);
      setShowKnn(true);
    } catch (error) {
      console.error('Error fetching KNN recommendations:', error);
      alert('Failed to get AI recommendations. Please ensure you have set up your nutrition goals first.');
    } finally {
      setLoading(false);
    }
  };

  const handleFoodClick = (food, quantity = 100) => {
    onFoodSelect({
      foodId: food.id,
      foodName: food.name,
      quantity: quantity,
      mealType: mealType
    });
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Select Food for {mealType}</h4>
        <button
          onClick={fetchKnnRecommendations}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : '🤖 Get AI Recommendations'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* KNN Recommendations */}
      {showKnn && knnRecommendations && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h5 className="font-semibold text-green-900 mb-3">
            🤖 AI Recommendations for {mealType} ({knnRecommendations.targetCalories?.toFixed(0)} kcal target)
          </h5>
          <div className="space-y-2">
            {knnRecommendations.recommendedFoods?.map((match, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-green-100"
                onClick={() => handleFoodClick(match.food, match.quantity)}
              >
                <div>
                  <p className="font-semibold">{match.food.name}</p>
                  <p className="text-sm text-gray-600">{match.reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    Match: {match.matchScore?.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {match.quantity?.toFixed(0)}g
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3 italic">
            {knnRecommendations.recommendationReason}
          </p>
        </div>
      )}

      {/* Food List */}
      <div className="max-h-96 overflow-y-auto border rounded-lg p-2">
        {filteredFoods.length > 0 ? (
          <div className="space-y-2">
            {filteredFoods.map(food => (
              <div
                key={food.id}
                className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleFoodClick(food)}
              >
                <div>
                  <p className="font-semibold">{food.name}</p>
                  <p className="text-sm text-gray-600">
                    {food.category} | {food.calories} kcal/100g
                  </p>
                </div>
                <div className="text-right text-sm">
                  <span className="text-gray-600">P: {food.protein}g | </span>
                  <span className="text-gray-600">C: {food.carbs}g | </span>
                  <span className="text-gray-600">F: {food.fat}g</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No foods found. Try searching or refreshing.</p>
        )}
      </div>
    </div>
  );
}

export default FoodSelector;