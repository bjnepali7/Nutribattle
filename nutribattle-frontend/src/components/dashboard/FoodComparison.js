// src/components/dashboard/FoodComparison.js
// Component for comparing multiple foods side by side

import React, { useState, useEffect } from 'react';
import foodService from '../../services/foodService';

function FoodComparison() {
  const [allFoods, setAllFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([null, null, null]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);

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

  const handleFoodSelect = (index, foodId) => {
    const newSelectedFoods = [...selectedFoods];
    newSelectedFoods[index] = foodId ? allFoods.find(f => f.id === parseInt(foodId)) : null;
    setSelectedFoods(newSelectedFoods);
  };

  const handleCompare = async () => {
    const foodIds = selectedFoods.filter(f => f !== null).map(f => f.id);
    
    if (foodIds.length < 2) {
      alert('Please select at least 2 foods to compare');
      return;
    }

    try {
      setComparing(true);
      const result = await foodService.compareFoods(foodIds);
      setComparisonResult(result);
    } catch (error) {
      console.error('Error comparing foods:', error);
      alert('Failed to compare foods. Please try again.');
    } finally {
      setComparing(false);
    }
  };

  const clearComparison = () => {
    setSelectedFoods([null, null, null]);
    setComparisonResult(null);
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Food Comparison Tool</h2>
        <p className="text-gray-600">Select 2-3 foods to compare their nutritional values side by side</p>
      </div>

      {/* Food Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Foods to Compare</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Food {index + 1} {index < 2 && <span className="text-red-500">*</span>}
              </label>
              <select
                value={selectedFoods[index]?.id || ''}
                onChange={(e) => handleFoodSelect(index, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                disabled={loading}
              >
                <option value="">Select a food...</option>
                {allFoods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.type})
                  </option>
                ))}
              </select>
              {selectedFoods[index] && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedFoods[index].name}</p>
                  <p className="text-sm text-gray-600">{selectedFoods[index].category}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-block px-2 py-1 text-xs font-bold text-white rounded ${
                      selectedFoods[index].type === 'Traditional' ? 'bg-nepali-red' : 'bg-nepali-blue'
                    }`}>
                      {selectedFoods[index].type}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleCompare}
            disabled={comparing || selectedFoods.filter(f => f !== null).length < 2}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              comparing || selectedFoods.filter(f => f !== null).length < 2
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-nepali-blue to-blue-600 text-white hover:shadow-lg'
            }`}
          >
            {comparing ? 'Comparing...' : 'Compare Foods'}
          </button>
          <button
            onClick={clearComparison}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <>
          {/* Nutrient Comparison Table */}
          <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Comparison (per 100g)</h3>
            
            {/* Nutri-Score Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-3">Nutri-Score Comparison:</p>
              <div className="flex flex-wrap gap-4">
                {comparisonResult.foods.map((food) => (
                  <div key={food.id} className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{food.name}:</span>
                    <span className={`inline-block px-3 py-1 text-sm font-bold text-white rounded-full ${
                      getNutriScoreColor(food.nutriScore)
                    }`}>
                      {food.nutriScore}
                    </span>
                    {comparisonResult.healthiestFood.id === food.id && (
                      <span className="text-green-600 font-bold">✓ Best</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nutrient</th>
                  {comparisonResult.foods.map((food) => (
                    <th key={food.id} className="text-center py-3 px-4 font-medium text-gray-700">
                      {food.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonResult.nutrientComparisons.map((nutrient) => (
                  <tr key={nutrient.nutrientName} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {nutrient.nutrientName}
                      <span className="text-sm text-gray-500 ml-1">({nutrient.unit})</span>
                    </td>
                    {nutrient.values.map((value) => (
                      <td key={value.foodId} className="text-center py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          value.isBest ? 'bg-green-100 text-green-800' :
                          value.isWorst ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {value.value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Winner Card - Based on Nutri-Score */}
          {comparisonResult.healthiestFood && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🏆</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900">Winner - Best Nutri-Score!</h3>
                  <p className="text-lg text-gray-700 mt-1">
                    <span className="font-semibold text-2xl">{comparisonResult.healthiestFood.name}</span>
                  </p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-sm text-gray-600">Nutri-Score:</span>
                    <span className={`inline-block px-4 py-2 text-lg font-bold text-white rounded-full ${
                      getNutriScoreColor(comparisonResult.healthiestFood.nutriScore)
                    }`}>
                      {comparisonResult.healthiestFood.nutriScore}
                    </span>
                    <span className="text-sm text-gray-600">
                      (Best nutritional quality among compared foods)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {comparisonResult.healthiestFood.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {comparisonResult.recommendations && comparisonResult.recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span className="text-2xl mr-2">💡</span>
                Insights & Recommendations
              </h3>
              <ul className="space-y-3">
                {comparisonResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-nepali-blue mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FoodComparison;