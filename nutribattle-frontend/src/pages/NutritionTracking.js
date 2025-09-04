import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import nutritionService from '../../services/nutritionService';
import foodService from '../../services/foodService';

function NutritionTracker() {
  const [nutritionGoals, setNutritionGoals] = useState(null);
  const [todaysFoods, setTodaysFoods] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('BREAKFAST');
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(true);
  const [foodRecommendations, setFoodRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [todaysProgress, setTodaysProgress] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Fetch recommendations when meal type changes
    if (nutritionGoals) {
      fetchFoodRecommendations();
    }
  }, [selectedMeal, nutritionGoals]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch nutrition goals
      let goals = null;
      try {
        goals = await nutritionService.getNutritionGoals();
        setNutritionGoals(goals);
      } catch (error) {
        console.log('No nutrition goals set yet');
      }
      
      // Fetch all foods
      try {
        const foodsResponse = await foodService.getAllFoods();
        console.log('Fetched foods:', foodsResponse);
        setAllFoods(foodsResponse || []);
      } catch (error) {
        console.error('Error fetching foods:', error);
        // If API fails, try to get from localStorage or use mock data
        const mockFoods = [
          { id: 1, name: 'Momo', calories: 250, protein: 12.5, carbs: 35.6, fat: 8.2 },
          { id: 2, name: 'Dal Bhat', calories: 420, protein: 18.3, carbs: 72.4, fat: 6.8 },
          { id: 3, name: 'Sel Roti', calories: 380, protein: 6.2, carbs: 52.3, fat: 18.5 },
          { id: 4, name: 'Gundruk', calories: 45, protein: 3.8, carbs: 8.2, fat: 0.5 },
          { id: 5, name: 'Dhido', calories: 365, protein: 8.5, carbs: 78.5, fat: 2.3 }
        ];
        setAllFoods(mockFoods);
      }
      
      // Fetch today's tracking
      try {
        const tracking = await nutritionService.getTodaysTracking();
        if (tracking) {
          setTodaysFoods(tracking.foods || []);
          setTodaysProgress({
            calories: tracking.totalCalories || 0,
            protein: tracking.totalProtein || 0,
            carbs: tracking.totalCarbs || 0,
            fat: tracking.totalFat || 0
          });
        }
      } catch (error) {
        console.log('No tracking data for today');
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodRecommendations = async () => {
    if (!nutritionGoals || !nutritionGoals.dailyCalorieGoal) return;
    
    try {
      setLoadingRecommendations(true);
      
      // Calculate remaining calories for the meal
      const remainingCalories = nutritionGoals.dailyCalorieGoal - todaysProgress.calories;
      const mealCalories = getMealCalorieTarget(selectedMeal, remainingCalories);
      
      // Fetch KNN recommendations from backend
      const recommendations = await nutritionService.getCalorieRecommendations(
        mealCalories,
        selectedMeal
      );
      
      setFoodRecommendations(recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to simple filtering if KNN fails
      const mealCalories = getMealCalorieTarget(
        selectedMeal, 
        nutritionGoals.dailyCalorieGoal - todaysProgress.calories
      );
      
      const filtered = allFoods
        .filter(food => {
          const diff = Math.abs(food.calories - mealCalories);
          return diff <= 100; // Within 100 calories
        })
        .sort((a, b) => {
          const diffA = Math.abs(a.calories - mealCalories);
          const diffB = Math.abs(b.calories - mealCalories);
          return diffA - diffB;
        })
        .slice(0, 5);
      
      setFoodRecommendations(filtered);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getMealCalorieTarget = (mealType, remainingCalories) => {
    // Distribute remaining calories based on meal type
    const mealDistribution = {
      BREAKFAST: 0.25,
      LUNCH: 0.35,
      DINNER: 0.30,
      SNACK: 0.10
    };
    
    return Math.round(remainingCalories * (mealDistribution[mealType] || 0.25));
  };

  const handleAddFood = async () => {
    if (!selectedFood) {
      alert('Please select a food item');
      return;
    }

    try {
      await nutritionService.trackFood({
        foodId: selectedFood,
        mealType: selectedMeal,
        quantity: quantity
      });
      
      // Refresh the tracking data
      await fetchData();
      
      // Reset form
      setSelectedFood('');
      setQuantity(100);
      
      alert('Food added successfully!');
    } catch (error) {
      console.error('Error adding food:', error);
      alert('Failed to add food');
    }
  };

  const handleQuickAdd = async (foodId) => {
    try {
      await nutritionService.trackFood({
        foodId: foodId,
        mealType: selectedMeal,
        quantity: 100
      });
      
      await fetchData();
      alert('Food added successfully!');
    } catch (error) {
      console.error('Error adding food:', error);
      alert('Failed to add food');
    }
  };

  const getProgressColor = (current, goal) => {
    const percentage = (current / goal) * 100;
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-green-500';
    return 'bg-purple-500';
  };

  const getProgressPercentage = (current, goal) => {
    if (!goal || goal === 0) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100);
  };

  const calculateRecommendedCalories = () => {
    if (!nutritionGoals) return null;
    
    const { weight, height, age, gender, activityLevel } = nutritionGoals;
    if (!weight || !height || !age) return null;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'MALE') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Adjust based on goal
    let recommendedCalories = tdee;
    if (nutritionGoals.nutritionGoal === 'LOSE_WEIGHT') {
      recommendedCalories = tdee - 500;
    } else if (nutritionGoals.nutritionGoal === 'GAIN_WEIGHT' || nutritionGoals.nutritionGoal === 'BUILD_MUSCLE') {
      recommendedCalories = tdee + 300;
    }

    return Math.round(recommendedCalories);
  };

  const removeFood = async (foodEntryId) => {
    try {
      await nutritionService.removeFoodEntry(foodEntryId);
      await fetchData();
      alert('Food removed successfully!');
    } catch (error) {
      console.error('Error removing food:', error);
      alert('Failed to remove food');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="nutrition-tracker">
      {/* Header with Setup Goals Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nutrition Tracking</h2>
        <Link
          to="/nutrition-goals"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Setup Goals
        </Link>
      </div>

      {/* Goals Overview Card */}
      {nutritionGoals && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Your Nutrition Goals</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Goal</p>
              <p className="font-bold">{nutritionGoals.nutritionGoal?.replace('_', ' ') || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age Group</p>
              <p className="font-bold">{nutritionGoals.ageGroup?.replace('_', ' ') || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">BMI</p>
              <p className="font-bold">
                {nutritionGoals.bmi ? `${nutritionGoals.bmi.toFixed(1)} (${nutritionGoals.bmiCategory})` : 'Not Calculated'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Target Calories</p>
              <p className="font-bold">{nutritionGoals.recommendedCalories || nutritionGoals.dailyCalorieGoal || 2000} kcal</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Goal</p>
              <p className="font-bold">{nutritionGoals.dailyCalorieGoal || 2000} kcal</p>
            </div>
          </div>

          {/* Calorie Recommendation */}
          {calculateRecommendedCalories() && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Recommended Daily Calories:</span> {calculateRecommendedCalories()} kcal
                <span className="text-xs ml-2">(based on your profile and {nutritionGoals.nutritionGoal?.toLowerCase().replace('_', ' ')} goal)</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Today's Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-sm text-gray-600">
                {todaysProgress.calories} / {nutritionGoals?.dailyCalorieGoal || 2000} kcal
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(todaysProgress.calories, nutritionGoals?.dailyCalorieGoal || 2000)}`}
                style={{ width: `${getProgressPercentage(todaysProgress.calories, nutritionGoals?.dailyCalorieGoal || 2000)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Protein</span>
              <span className="text-sm text-gray-600">
                {todaysProgress.protein.toFixed(1)}g / {nutritionGoals?.dailyProteinGoal || 50}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(todaysProgress.protein, nutritionGoals?.dailyProteinGoal || 50)}`}
                style={{ width: `${getProgressPercentage(todaysProgress.protein, nutritionGoals?.dailyProteinGoal || 50)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Carbs</span>
              <span className="text-sm text-gray-600">
                {todaysProgress.carbs.toFixed(1)}g / {nutritionGoals?.dailyCarbsGoal || 275}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(todaysProgress.carbs, nutritionGoals?.dailyCarbsGoal || 275)}`}
                style={{ width: `${getProgressPercentage(todaysProgress.carbs, nutritionGoals?.dailyCarbsGoal || 275)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Fat</span>
              <span className="text-sm text-gray-600">
                {todaysProgress.fat.toFixed(1)}g / {nutritionGoals?.dailyFatGoal || 65}g
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(todaysProgress.fat, nutritionGoals?.dailyFatGoal || 65)}`}
                style={{ width: `${getProgressPercentage(todaysProgress.fat, nutritionGoals?.dailyFatGoal || 65)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Food Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add Food</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Type
            </label>
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Food
            </label>
            <select
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a food...</option>
              {allFoods && allFoods.length > 0 ? (
                allFoods.map(food => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.calories} kcal/100g)
                  </option>
                ))
              ) : (
                <option disabled>No foods available</option>
              )}
            </select>
            {allFoods.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No foods loaded. Check your API connection.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (g)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddFood}
          className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Food to {selectedMeal.charAt(0) + selectedMeal.slice(1).toLowerCase()}
        </button>
      </div>

      {/* Smart Food Recommendations */}
      {nutritionGoals && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🤖 AI Food Recommendations for {selectedMeal.charAt(0) + selectedMeal.slice(1).toLowerCase()}
            </h3>
            {loadingRecommendations && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Can't decide what to eat? Here are foods that match your calorie goals:
          </p>
          
          {foodRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {foodRecommendations.map((food, index) => (
                <div 
                  key={food.id || index} 
                  className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{food.name}</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {food.calories} kcal
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    <div>Protein: {food.protein}g</div>
                    <div>Carbs: {food.carbs}g</div>
                    <div>Fat: {food.fat}g</div>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(food.id)}
                    className="w-full text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                  >
                    Quick Add (100g)
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {loadingRecommendations ? 'Loading recommendations...' : 'No recommendations available. Set your goals first!'}
            </div>
          )}
        </div>
      )}

      {/* Today's Foods List */}
      {todaysFoods.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Foods</h3>
          <div className="space-y-2">
            {todaysFoods.map((entry, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{entry.food?.name || 'Unknown Food'}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({entry.quantity}g) - {entry.mealType?.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {Math.round((entry.food?.calories || 0) * entry.quantity / 100)} kcal
                  </span>
                  <button
                    onClick={() => removeFood(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Foods Message */}
      {todaysFoods.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-4">No foods tracked today yet</p>
          <p className="text-sm text-gray-400">Start by adding your first meal above!</p>
        </div>
      )}
    </div>
  );
}

export default NutritionTracker;