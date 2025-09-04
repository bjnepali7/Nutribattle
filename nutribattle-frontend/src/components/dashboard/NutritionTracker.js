// src/components/dashboard/NutritionTracker.js
import React, { useState, useEffect } from 'react';
import foodService from '../../services/foodService';
import nutritionService from '../../services/nutritionService';
import userService from '../../services/userService';

function NutritionTracker() {
  const [allFoods, setAllFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState('BREAKFAST');
  const [notes, setNotes] = useState('');
  const [todayIntakes, setTodayIntakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // New state for goal setting
  const [userProfile, setUserProfile] = useState({
    weight: '',
    height: '',
    ageGroup: '',
    nutritionGoal: ''
  });
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [recommendedCalories, setRecommendedCalories] = useState(null);
  const [calorieRecommendations, setCalorieRecommendations] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(true);
  const [goalSaved, setGoalSaved] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchFoods();
    fetchTodayIntakes();
  }, []);

  const fetchUserData = async () => {
    try {
      const profile = await userService.getProfile();
      setUserProfile({
        weight: profile.weight || '',
        height: profile.height || '',
        ageGroup: profile.ageGroup || '',
        nutritionGoal: profile.nutritionGoal || ''
      });
      
      // Calculate BMI if we have weight and height
      if (profile.weight && profile.height) {
        calculateBMI(profile.weight, profile.height);
        setShowGoalForm(false);
        setGoalSaved(true);
      }
      
      // Get recommended calories if we have goals
      if (profile.nutritionGoal && profile.ageGroup) {
        calculateRecommendedCalories(profile.nutritionGoal, profile.ageGroup, profile.weight, profile.height);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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

  const fetchTodayIntakes = async () => {
    try {
      const summary = await nutritionService.getDailyNutrition();
      setTodayIntakes(summary.foodItems || []);
    } catch (error) {
      console.error('Error fetching today intakes:', error);
    }
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(bmiValue.toFixed(1));
    
    if (bmiValue < 18.5) {
      setBmiCategory('Underweight');
    } else if (bmiValue < 25) {
      setBmiCategory('Normal weight');
    } else if (bmiValue < 30) {
      setBmiCategory('Overweight');
    } else {
      setBmiCategory('Obese');
    }
  };

  const calculateRecommendedCalories = (goal, ageGroup, weight, height) => {
    // Base metabolic rate calculation (simplified)
    let bmr;
    if (ageGroup === 'CHILD') {
      bmr = 22.5 * weight + 499;
    } else if (ageGroup === 'MIDDLE_AGED') {
      bmr = 13.75 * weight + 5 * height - 6.76 * 35 + 66;
    } else { // OLD
      bmr = 13.75 * weight + 5 * height - 6.76 * 65 + 66;
    }
    
    // Adjust based on goal
    let recommended;
    if (goal === 'WEIGHT_LOSS') {
      recommended = bmr * 0.8; // 20% deficit
    } else if (goal === 'WEIGHT_GAIN') {
      recommended = bmr * 1.2; // 20% surplus
    } else { // MAINTENANCE
      recommended = bmr;
    }
    
    setRecommendedCalories(Math.round(recommended));
    generateCalorieRecommendations(Math.round(recommended));
  };

  const generateCalorieRecommendations = (calories) => {
    // Simple meal planning based on calorie goal
    const recommendations = [
      {
        meal: 'Breakfast',
        calories: Math.round(calories * 0.25),
        description: 'Focus on protein and fiber to start your day right'
      },
      {
        meal: 'Lunch',
        calories: Math.round(calories * 0.35),
        description: 'Balanced meal with complex carbs, protein, and healthy fats'
      },
      {
        meal: 'Dinner',
        calories: Math.round(calories * 0.30),
        description: 'Lighter meal with emphasis on protein and vegetables'
      },
      {
        meal: 'Snack',
        calories: Math.round(calories * 0.10),
        description: 'Healthy snack to keep energy levels stable'
      }
    ];
    
    setCalorieRecommendations(recommendations);
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setUserProfile({ ...userProfile, [name]: value });
  };

  const handleSaveGoals = async () => {
    if (!userProfile.weight || !userProfile.height || !userProfile.ageGroup || !userProfile.nutritionGoal) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Update profile with goals
      await userService.updateProfile({
        weight: parseFloat(userProfile.weight),
        height: parseFloat(userProfile.height),
        ageGroup: userProfile.ageGroup,
        nutritionGoal: userProfile.nutritionGoal
      });

      // Calculate and display results
      calculateBMI(userProfile.weight, userProfile.height);
      calculateRecommendedCalories(
        userProfile.nutritionGoal, 
        userProfile.ageGroup, 
        userProfile.weight, 
        userProfile.height
      );
      
      setShowGoalForm(false);
      setGoalSaved(true);
      alert('Goals saved successfully!');
    } catch (error) {
      console.error('Error saving goals:', error);
      alert('Failed to save goals. Please try again.');
    }
  };

  const handleFoodSelect = (foodId) => {
    const food = allFoods.find(f => f.id === parseInt(foodId));
    setSelectedFood(food);
  };

  const handleAddIntake = async () => {
    if (!selectedFood) {
      alert('Please select a food');
      return;
    }

    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      setAdding(true);
      const intakeData = {
        foodId: selectedFood.id,
        quantity: quantity,
        mealType: mealType,
        notes: notes,
        intakeDate: new Date().toISOString().split('T')[0]
      };

      await nutritionService.addFoodIntake(intakeData);
      
      // Reset form
      setSelectedFood(null);
      setQuantity(100);
      setNotes('');
      
      // Refresh today's intakes
      await fetchTodayIntakes();
      
      alert('Food intake added successfully!');
    } catch (error) {
      console.error('Error adding food intake:', error);
      alert('Failed to add food intake. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteIntake = async (intakeId) => {
    if (!window.confirm('Are you sure you want to delete this food intake?')) {
      return;
    }

    try {
      await nutritionService.deleteFoodIntake(intakeId);
      await fetchTodayIntakes();
      alert('Food intake deleted successfully!');
    } catch (error) {
      console.error('Error deleting food intake:', error);
      alert('Failed to delete food intake.');
    }
  };

  const calculateNutrition = (nutrient) => {
    if (!selectedFood) return 0;
    return ((selectedFood[nutrient] * quantity) / 100).toFixed(1);
  };

  const getBmiColor = () => {
    if (!bmiCategory) return 'bg-gray-100 text-gray-800';
    if (bmiCategory.includes('Underweight')) return 'bg-blue-100 text-blue-800';
    if (bmiCategory.includes('Normal')) return 'bg-green-100 text-green-800';
    if (bmiCategory.includes('Overweight')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Goal Setting Section */}
      {showGoalForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Your Nutrition Goals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={userProfile.weight}
                  onChange={handleGoalChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                  placeholder="Enter your weight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="height"
                  value={userProfile.height}
                  onChange={handleGoalChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                  placeholder="Enter your height"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="ageGroup"
                  value={userProfile.ageGroup}
                  onChange={handleGoalChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                >
                  <option value="">Select Age Group</option>
                  <option value="CHILD">Child (0-17 years)</option>
                  <option value="MIDDLE_AGED">Middle Aged (18-64 years)</option>
                  <option value="OLD">Old (65+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nutrition Goal <span className="text-red-500">*</span>
                </label>
                <select
                  name="nutritionGoal"
                  value={userProfile.nutritionGoal}
                  onChange={handleGoalChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                >
                  <option value="">Select Goal</option>
                  <option value="WEIGHT_LOSS">Weight Loss</option>
                  <option value="WEIGHT_GAIN">Weight Gain</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveGoals}
            className="mt-6 px-6 py-3 bg-nepali-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Goals & Calculate Recommendations
          </button>
        </div>
      )}

      {/* Results Section */}
      {goalSaved && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Nutrition Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">BMI</h3>
              <p className="text-3xl font-bold text-gray-900">{bmi}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getBmiColor()}`}>
                {bmiCategory}
              </span>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Calorie Goal</h3>
              <p className="text-3xl font-bold text-gray-900">{recommendedCalories}</p>
              <p className="text-sm text-gray-600 mt-1">calories per day</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal</h3>
              <p className="text-xl font-bold text-gray-900 capitalize">
                {userProfile.nutritionGoal.toLowerCase().replace('_', ' ')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {userProfile.ageGroup === 'CHILD' && 'Child (0-17 years)'}
                {userProfile.ageGroup === 'MIDDLE_AGED' && 'Middle Aged (18-64 years)'}
                {userProfile.ageGroup === 'OLD' && 'Old (65+ years)'}
              </p>
            </div>
          </div>

          {/* Calorie Recommendations */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Meal Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {calorieRecommendations.map((rec, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{rec.meal}</h4>
                  <p className="text-2xl font-bold text-nepali-blue">{rec.calories} kcal</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowGoalForm(true)}
            className="mt-6 px-4 py-2 text-nepali-blue border border-nepali-blue rounded-lg hover:bg-blue-50 transition-colors"
          >
            Edit Goals
          </button>
        </div>
      )}

      {/* Food Logging Section (only shown after goals are set) */}
      {goalSaved && (
        <>
          {/* Add Food Intake Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Log Food Intake</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Food Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Food <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedFood?.id || ''}
                    onChange={(e) => handleFoodSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                    disabled={loading}
                  >
                    <option value="">Choose a food...</option>
                    {allFoods.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.name} ({food.type}) - {food.calories} kcal/100g
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (grams) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard serving sizes: Small (50g), Medium (100g), Large (150g)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                  >
                    <option value="BREAKFAST">🌅 Breakfast</option>
                    <option value="LUNCH">☀️ Lunch</option>
                    <option value="DINNER">🌙 Dinner</option>
                    <option value="SNACK">🍿 Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nepali-blue"
                    rows="2"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              {/* Right Column - Nutrition Preview */}
              <div>
                {selectedFood ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Nutrition Preview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                        <span className="font-medium text-gray-900">{selectedFood.name}</span>
                        <span className="text-sm text-gray-600">{quantity}g serving</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Calories</p>
                          <p className="text-lg font-bold text-orange-600">
                            {calculateNutrition('calories')} kcal
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Protein</p>
                          <p className="text-lg font-bold text-blue-600">
                            {calculateNutrition('protein')}g
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Carbs</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {calculateNutrition('carbs')}g
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Fat</p>
                          <p className="text-lg font-bold text-green-600">
                            {calculateNutrition('fat')}g
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fiber:</span>
                          <span className="font-medium">{calculateNutrition('fiber')}g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sugar:</span>
                          <span className="font-medium">{calculateNutrition('sugar')}g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sodium:</span>
                          <span className="font-medium">{calculateNutrition('sodium')}mg</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Nutri-Score</span>
                          <span className={`inline-block px-3 py-1 text-sm font-bold text-white rounded-full
                            ${selectedFood.nutriScore === 'A' ? 'bg-green-500' : ''}
                            ${selectedFood.nutriScore === 'B' ? 'bg-lime-500' : ''}
                            ${selectedFood.nutriScore === 'C' ? 'bg-yellow-500' : ''}
                            ${selectedFood.nutriScore === 'D' ? 'bg-orange-500' : ''}
                            ${selectedFood.nutriScore === 'E' ? 'bg-red-500' : ''}
                          `}>
                            {selectedFood.nutriScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 h-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl mb-3 block">🍽️</span>
                      <p className="text-gray-500">Select a food to see nutrition preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAddIntake}
              disabled={!selectedFood || adding}
              className={`mt-6 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !selectedFood || adding
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-nepali-blue to-blue-600 text-white hover:shadow-lg'
              }`}
            >
              {adding ? 'Adding...' : 'Add to Today\'s Intake'}
            </button>
          </div>

          {/* Today's Food Log */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Food Log</h3>
            
            {todayIntakes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Food</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Meal</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Calories</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Protein</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayIntakes.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{item.foodName}</p>
                          <p className="text-xs text-gray-500">{item.foodCategory}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm capitalize">
                            {item.mealType === 'BREAKFAST' && '🌅 '}
                            {item.mealType === 'LUNCH' && '☀️ '}
                            {item.mealType === 'DINNER' && '🌙 '}
                            {item.mealType === 'SNACK' && '🍿 '}
                            {item.mealType.toLowerCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm">{item.quantity}g</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium">{item.calories.toFixed(0)} kcal</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm">{item.protein.toFixed(1)}g</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteIntake(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">📝</span>
                <p className="text-gray-500">No foods logged for today yet</p>
                <p className="text-sm text-gray-400 mt-1">Start by adding your first meal above</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NutritionTracker;