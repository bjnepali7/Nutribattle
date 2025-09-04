// src/components/admin/AddEditFood.js
// Admin component for adding or editing foods

import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

function AddEditFood({ editingFood, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: 'Traditional',
    calories: '',
    protein: '',
    fat: '',
    saturatedFat: '',
    carbs: '',
    sugar: '',
    fiber: '',
    sodium: '',
    vitaminA: '',
    vitaminC: '',
    calcium: '',
    iron: '',
    imageUrl: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Common food categories
  const categories = [
    'Main Dish', 'Snack', 'Beverage', 'Dessert', 'Soup', 
    'Bread', 'Rice Dish', 'Curry', 'Street Food', 'Dairy',
    'Vegetable', 'Fruit', 'Meat', 'Fast Food'
  ];

  useEffect(() => {
    if (editingFood) {
      setFormData({
        name: editingFood.name || '',
        category: editingFood.category || '',
        type: editingFood.type || 'Traditional',
        calories: editingFood.calories || '',
        protein: editingFood.protein || '',
        fat: editingFood.fat || '',
        saturatedFat: editingFood.saturatedFat || '',
        carbs: editingFood.carbs || '',
        sugar: editingFood.sugar || '',
        fiber: editingFood.fiber || '',
        sodium: editingFood.sodium || '',
        vitaminA: editingFood.vitaminA || '',
        vitaminC: editingFood.vitaminC || '',
        calcium: editingFood.calcium || '',
        iron: editingFood.iron || '',
        imageUrl: editingFood.imageUrl || '',
        description: editingFood.description || ''
      });
    }
  }, [editingFood]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.type) newErrors.type = 'Type is required';
    
    // Nutritional values (must be numbers)
    const nutritionFields = ['calories', 'protein', 'fat', 'saturatedFat', 'carbs', 'sugar', 'fiber', 'sodium'];
    nutritionFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (isNaN(formData[field]) || parseFloat(formData[field]) < 0) {
        newErrors[field] = 'Must be a valid positive number';
      }
    });

    // Optional nutrition fields (if provided, must be valid)
    const optionalFields = ['vitaminA', 'vitaminC', 'calcium', 'iron'];
    optionalFields.forEach(field => {
      if (formData[field] && (isNaN(formData[field]) || parseFloat(formData[field]) < 0)) {
        newErrors[field] = 'Must be a valid positive number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);

      // Convert string values to numbers
      const foodData = {
        ...formData,
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein),
        fat: parseFloat(formData.fat),
        saturatedFat: parseFloat(formData.saturatedFat),
        carbs: parseFloat(formData.carbs),
        sugar: parseFloat(formData.sugar),
        fiber: parseFloat(formData.fiber),
        sodium: parseFloat(formData.sodium),
        vitaminA: formData.vitaminA ? parseFloat(formData.vitaminA) : 0,
        vitaminC: formData.vitaminC ? parseFloat(formData.vitaminC) : 0,
        calcium: formData.calcium ? parseFloat(formData.calcium) : 0,
        iron: formData.iron ? parseFloat(formData.iron) : 0
      };

      if (editingFood) {
        await adminService.updateFood(editingFood.id, foodData);
        alert('Food updated successfully!');
      } else {
        await adminService.addFood(foodData);
        alert('Food added successfully!');
      }

      // Reset form if adding new food
      if (!editingFood) {
        setFormData({
          name: '',
          category: '',
          type: 'Traditional',
          calories: '',
          protein: '',
          fat: '',
          saturatedFat: '',
          carbs: '',
          sugar: '',
          fiber: '',
          sodium: '',
          vitaminA: '',
          vitaminC: '',
          calcium: '',
          iron: '',
          imageUrl: '',
          description: ''
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Failed to save food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingFood ? 'Edit Food' : 'Add New Food'}
          </h2>
          {editingFood && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="e.g., Dal Bhat"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Traditional">Traditional</option>
                  <option value="Modern">Modern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Brief description of the food..."
              />
            </div>
          </div>

          {/* Nutritional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nutritional Information (per 100g)
            </h3>
            
            {/* Main Macros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.calories ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.calories && <p className="text-red-500 text-xs mt-1">{errors.calories}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protein (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.protein ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.protein && <p className="text-red-500 text-xs mt-1">{errors.protein}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbs (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.carbs ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.carbs && <p className="text-red-500 text-xs mt-1">{errors.carbs}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fat (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="fat"
                  value={formData.fat}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.fat ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.fat && <p className="text-red-500 text-xs mt-1">{errors.fat}</p>}
              </div>
            </div>

            {/* Additional Nutrients */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturated Fat (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="saturatedFat"
                  value={formData.saturatedFat}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.saturatedFat ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.saturatedFat && <p className="text-red-500 text-xs mt-1">{errors.saturatedFat}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sugar (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="sugar"
                  value={formData.sugar}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.sugar ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.sugar && <p className="text-red-500 text-xs mt-1">{errors.sugar}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiber (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="fiber"
                  value={formData.fiber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.fiber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.fiber && <p className="text-red-500 text-xs mt-1">{errors.fiber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sodium (mg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="sodium"
                  value={formData.sodium}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.sodium ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="0"
                />
                {errors.sodium && <p className="text-red-500 text-xs mt-1">{errors.sodium}</p>}
              </div>
            </div>
          </div>

          {/* Vitamins and Minerals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vitamins & Minerals (Optional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vitamin A (μg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="vitaminA"
                  value={formData.vitaminA}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vitamin C (mg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="vitaminC"
                  value={formData.vitaminC}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calcium (mg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="calcium"
                  value={formData.calcium}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Iron (mg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="iron"
                  value={formData.iron}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            {editingFood && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg'
              }`}
            >
              {loading ? 'Saving...' : (editingFood ? 'Update Food' : 'Add Food')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditFood;