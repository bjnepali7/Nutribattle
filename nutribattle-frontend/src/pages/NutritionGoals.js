import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import nutritionService from '../services/nutritionService';

function NutritionGoals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nutritionGoals, setNutritionGoals] = useState(null);
  const [calculatedBMI, setCalculatedBMI] = useState(null);
  const [recommendedCalories, setRecommendedCalories] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'MALE',
    activityLevel: 'MODERATELY_ACTIVE',
    nutritionGoal: 'MAINTAIN',
    ageGroup: 'YOUNG_ADULT',
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 50,
    dailyCarbsGoal: 275,
    dailyFatGoal: 65
  });

  useEffect(() => {
    fetchCurrentGoals();
  }, []);

  useEffect(() => {
    // Calculate BMI when weight or height changes
    if (formData.weight && formData.height) {
      const heightInMeters = formData.height / 100;
      const bmi = formData.weight / (heightInMeters * heightInMeters);
      setCalculatedBMI({
        value: bmi,
        category: getBMICategory(bmi)
      });
    }
  }, [formData.weight, formData.height]);

  useEffect(() => {
    // Calculate recommended calories when relevant fields change
    if (formData.weight && formData.height && formData.age && formData.gender && formData.activityLevel) {
      const calories = calculateRecommendedCalories();
      setRecommendedCalories(calories);
    }
  }, [formData.weight, formData.height, formData.age, formData.gender, formData.activityLevel, formData.nutritionGoal]);

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const calculateRecommendedCalories = () => {
    const { weight, height, age, gender, activityLevel, nutritionGoal } = formData;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'MALE') {
      bmr = (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) + 5;
    } else {
      bmr = (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) - 161;
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
    let calories = tdee;
    if (nutritionGoal === 'LOSE_WEIGHT') {
      calories = tdee - 500; // 500 calorie deficit for ~1 lb/week loss
    } else if (nutritionGoal === 'GAIN_WEIGHT' || nutritionGoal === 'BUILD_MUSCLE') {
      calories = tdee + 300; // 300 calorie surplus
    }

    return Math.round(calories);
  };

  const fetchCurrentGoals = async () => {
    try {
      setLoading(true);
      const goals = await nutritionService.getNutritionGoals();
      if (goals) {
        setNutritionGoals(goals);
        // Pre-fill form with existing data
        setFormData(prev => ({
          ...prev,
          age: goals.age || '',
          weight: goals.weight || '',
          height: goals.height || '',
          gender: goals.gender || 'MALE',
          activityLevel: goals.activityLevel || 'MODERATELY_ACTIVE',
          nutritionGoal: goals.nutritionGoal || 'MAINTAIN',
          ageGroup: goals.ageGroup || 'YOUNG_ADULT',
          dailyCalorieGoal: goals.dailyCalorieGoal || 2000,
          dailyProteinGoal: goals.dailyProteinGoal || 50,
          dailyCarbsGoal: goals.dailyCarbsGoal || 275,
          dailyFatGoal: goals.dailyFatGoal || 65
        }));
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyRecommendedCalories = () => {
    if (recommendedCalories) {
      // Calculate macros based on recommended calories
      const protein = Math.round(recommendedCalories * 0.25 / 4); // 25% of calories from protein
      const carbs = Math.round(recommendedCalories * 0.45 / 4); // 45% of calories from carbs
      const fat = Math.round(recommendedCalories * 0.30 / 9); // 30% of calories from fat
      
      setFormData(prev => ({
        ...prev,
        dailyCalorieGoal: recommendedCalories,
        dailyProteinGoal: protein,
        dailyCarbsGoal: carbs,
        dailyFatGoal: fat
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await nutritionService.setNutritionGoals(formData);
      alert('Nutrition goals updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error setting goals:', error);
      alert('Failed to update nutrition goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !nutritionGoals) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Nutrition Goals Setup</h1>
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {/* Personal Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Real-time BMI Display */}
              {calculatedBMI && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">BMI:</span> {calculatedBMI.value.toFixed(1)} 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      calculatedBMI.category === 'Normal' ? 'bg-green-100 text-green-800' :
                      calculatedBMI.category === 'Underweight' ? 'bg-yellow-100 text-yellow-800' :
                      calculatedBMI.category === 'Overweight' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {calculatedBMI.category}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Activity & Goals */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Activity & Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Level
                  </label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SEDENTARY">Sedentary (little or no exercise)</option>
                    <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
                    <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
                    <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
                    <option value="EXTRA_ACTIVE">Extra Active (very hard daily exercise)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nutrition Goal
                  </label>
                  <select
                    name="nutritionGoal"
                    value={formData.nutritionGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LOSE_WEIGHT">Lose Weight</option>
                    <option value="MAINTAIN">Maintain Weight</option>
                    <option value="GAIN_WEIGHT">Gain Weight</option>
                    <option value="BUILD_MUSCLE">Build Muscle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Group
                  </label>
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CHILD">Child (Under 12)</option>
                    <option value="TEENAGER">Teenager (13-19)</option>
                    <option value="YOUNG_ADULT">Young Adult (20-35)</option>
                    <option value="MIDDLE_AGE">Middle Age (36-55)</option>
                    <option value="SENIOR">Senior (56+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calorie Recommendation */}
            {recommendedCalories && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Recommended Daily Calories
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {recommendedCalories} kcal/day
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Based on your profile and {formData.nutritionGoal.toLowerCase().replace('_', ' ')} goal
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={applyRecommendedCalories}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Apply Recommendation
                  </button>
                </div>
              </div>
            )}

            {/* Daily Targets */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Daily Nutrition Targets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Calories (kcal)
                  </label>
                  <input
                    type="number"
                    name="dailyCalorieGoal"
                    value={formData.dailyCalorieGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Protein (g)
                  </label>
                  <input
                    type="number"
                    name="dailyProteinGoal"
                    value={formData.dailyProteinGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Carbs (g)
                  </label>
                  <input
                    type="number"
                    name="dailyCarbsGoal"
                    value={formData.dailyCarbsGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Fat (g)
                  </label>
                  <input
                    type="number"
                    name="dailyFatGoal"
                    value={formData.dailyFatGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/dashboard"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NutritionGoals;