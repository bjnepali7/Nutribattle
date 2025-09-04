// File: src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile data
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    dietaryPreference: ''
  });
  
  // Nutrition goals
  const [goals, setGoals] = useState({
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 50,
    dailyCarbGoal: 275,
    dailyFatGoal: 65
  });
  
  // Edit modes
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingGoals, setEditingGoals] = useState(false);
  
  // Temp data for editing
  const [tempProfile, setTempProfile] = useState({});
  const [tempGoals, setTempGoals] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileData = await userService.getProfile();
      setProfile({
        username: profileData.username || '',
        email: profileData.email || '',
        fullName: profileData.fullName || '',
        age: profileData.age || '',
        gender: profileData.gender || '',
        height: profileData.height || '',
        weight: profileData.weight || '',
        activityLevel: profileData.activityLevel || 'MODERATE',
        dietaryPreference: profileData.dietaryPreference || 'NONE'
      });
      
      // Fetch nutrition goals
      const goalsData = await userService.getNutritionGoals();
      setGoals({
        dailyCalorieGoal: goalsData.dailyCalorieGoal || goalsData.calorieGoal || 2000,
        dailyProteinGoal: goalsData.dailyProteinGoal || goalsData.proteinGoal || 50,
        dailyCarbGoal: goalsData.dailyCarbGoal || goalsData.carbGoal || 275,
        dailyFatGoal: goalsData.dailyFatGoal || goalsData.fatGoal || 65
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  // Profile editing functions
  const startEditProfile = () => {
    setTempProfile({ ...profile });
    setEditingProfile(true);
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setTempProfile({});
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await userService.updateProfile(tempProfile);
      setProfile(tempProfile);
      setEditingProfile(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  // Goals editing functions
  const startEditGoals = () => {
    setTempGoals({ ...goals });
    setEditingGoals(true);
  };

  const cancelEditGoals = () => {
    setEditingGoals(false);
    setTempGoals({});
  };

  const saveGoals = async () => {
    try {
      setSaving(true);
      
      // Prepare goals data for backend
      const goalsData = {
        dailyCalorieGoal: tempGoals.dailyCalorieGoal,
        dailyProteinGoal: tempGoals.dailyProteinGoal,
        dailyCarbGoal: tempGoals.dailyCarbGoal,
        dailyFatGoal: tempGoals.dailyFatGoal
      };
      
      await userService.updateNutritionGoals(goalsData);
      setGoals(tempGoals);
      setEditingGoals(false);
      setMessage({ type: 'success', text: 'Nutrition goals updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating goals:', error);
      setMessage({ type: 'error', text: 'Failed to update goals' });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setTempProfile({ ...tempProfile, [name]: value });
  };

  const handleGoalsChange = (e) => {
    const { name, value } = e.target;
    setTempGoals({ ...tempGoals, [name]: parseFloat(value) || 0 });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
              <p className="text-gray-600 mt-1">Manage your profile and nutrition goals</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-nepali-red border-b-2 border-nepali-red'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                👤 Profile Information
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'goals'
                    ? 'text-nepali-red border-b-2 border-nepali-red'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🎯 Nutrition Goals
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'profile' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                {!editingProfile ? (
                  <button
                    onClick={startEditProfile}
                    className="px-4 py-2 bg-nepali-red text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={cancelEditProfile}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-nepali-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Account Info (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>

                {/* Editable Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editingProfile ? tempProfile.fullName : profile.fullName}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editingProfile ? 'border-gray-300 focus:border-nepali-red focus:outline-none' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={editingProfile ? tempProfile.age : profile.age}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editingProfile ? 'border-gray-300 focus:border-nepali-red focus:outline-none' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={editingProfile ? tempProfile.gender : profile.gender}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editingProfile ? 'border-gray-300 focus:border-nepali-red focus:outline-none' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={editingProfile ? tempProfile.height : profile.height}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editingProfile ? 'border-gray-300 focus:border-nepali-red focus:outline-none' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={editingProfile ? tempProfile.weight : profile.weight}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editingProfile ? 'border-gray-300 focus:border-nepali-red focus:outline-none' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={editingProfile ? tempProfile.activityLevel : profile.activityLevel}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editingProfile ? 'border-gray-300 focus:border-nepali-red focus:outline-none' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <option value="SEDENTARY">Sedentary (little or no exercise)</option>
                    <option value="LIGHT">Light (1-3 days/week)</option>
                    <option value="MODERATE">Moderate (3-5 days/week)</option>
                    <option value="ACTIVE">Active (6-7 days/week)</option>
                    <option value="VERY_ACTIVE">Very Active (physical job)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Daily Nutrition Goals</h2>
                {!editingGoals ? (
                  <button
                    onClick={startEditGoals}
                    className="px-4 py-2 bg-nepali-red text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Edit Goals
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={cancelEditGoals}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveGoals}
                      disabled={saving}
                      className="px-4 py-2 bg-nepali-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {saving ? 'Saving...' : 'Save Goals'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">🔥</span>
                      <h3 className="text-lg font-semibold text-gray-900">Daily Calories</h3>
                    </div>
                  </div>
                  <input
                    type="number"
                    name="dailyCalorieGoal"
                    value={editingGoals ? tempGoals.dailyCalorieGoal : goals.dailyCalorieGoal}
                    onChange={handleGoalsChange}
                    disabled={!editingGoals}
                    className={`w-full px-4 py-3 text-2xl font-bold border rounded-lg ${
                      editingGoals ? 'border-orange-300 focus:border-orange-500 focus:outline-none bg-white' : 'border-orange-200 bg-orange-50'
                    }`}
                  />
                  <p className="text-sm text-gray-600 mt-2">kcal per day</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">💪</span>
                      <h3 className="text-lg font-semibold text-gray-900">Daily Protein</h3>
                    </div>
                  </div>
                  <input
                    type="number"
                    name="dailyProteinGoal"
                    value={editingGoals ? tempGoals.dailyProteinGoal : goals.dailyProteinGoal}
                    onChange={handleGoalsChange}
                    disabled={!editingGoals}
                    className={`w-full px-4 py-3 text-2xl font-bold border rounded-lg ${
                      editingGoals ? 'border-blue-300 focus:border-blue-500 focus:outline-none bg-white' : 'border-blue-200 bg-blue-50'
                    }`}
                  />
                  <p className="text-sm text-gray-600 mt-2">grams per day</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">🌾</span>
                      <h3 className="text-lg font-semibold text-gray-900">Daily Carbs</h3>
                    </div>
                  </div>
                  <input
                    type="number"
                    name="dailyCarbGoal"
                    value={editingGoals ? tempGoals.dailyCarbGoal : goals.dailyCarbGoal}
                    onChange={handleGoalsChange}
                    disabled={!editingGoals}
                    className={`w-full px-4 py-3 text-2xl font-bold border rounded-lg ${
                      editingGoals ? 'border-yellow-300 focus:border-yellow-500 focus:outline-none bg-white' : 'border-yellow-200 bg-yellow-50'
                    }`}
                  />
                  <p className="text-sm text-gray-600 mt-2">grams per day</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">🥑</span>
                      <h3 className="text-lg font-semibold text-gray-900">Daily Fat</h3>
                    </div>
                  </div>
                  <input
                    type="number"
                    name="dailyFatGoal"
                    value={editingGoals ? tempGoals.dailyFatGoal : goals.dailyFatGoal}
                    onChange={handleGoalsChange}
                    disabled={!editingGoals}
                    className={`w-full px-4 py-3 text-2xl font-bold border rounded-lg ${
                      editingGoals ? 'border-green-300 focus:border-green-500 focus:outline-none bg-white' : 'border-green-200 bg-green-50'
                    }`}
                  />
                  <p className="text-sm text-gray-600 mt-2">grams per day</p>
                </div>
              </div>

              {/* Macro Distribution Info */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Macronutrient Distribution</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {goals.dailyCalorieGoal}
                    </div>
                    <p className="text-sm text-gray-600">Total Calories</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((goals.dailyProteinGoal * 4 / goals.dailyCalorieGoal) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">From Protein</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round((goals.dailyCarbGoal * 4 / goals.dailyCalorieGoal) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">From Carbs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((goals.dailyFatGoal * 9 / goals.dailyCalorieGoal) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">From Fat</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;