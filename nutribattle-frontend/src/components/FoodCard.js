// File: C:\Nutribattle\nutribattle-frontend\src\components\FoodCard.js

import React, { useState } from 'react';

function FoodCard({ food, onClick }) {
  const [imageError, setImageError] = useState(false);
  
  // Function to get the color for Nutri-Score
  const getNutriScoreColor = (score) => {
    switch(score) {
      case 'A': return 'bg-green-500 shadow-green-500/50';
      case 'B': return 'bg-lime-500 shadow-lime-500/50';
      case 'C': return 'bg-yellow-500 shadow-yellow-500/50';
      case 'D': return 'bg-orange-500 shadow-orange-500/50';
      case 'E': return 'bg-red-500 shadow-red-500/50';
      default: return 'bg-gray-400 shadow-gray-400/50';
    }
  };

  // Function to get badge color based on food type
  const getTypeBadgeColor = (type) => {
    return type === 'Traditional' 
      ? 'bg-gradient-to-r from-red-500 to-nepali-red' 
      : 'bg-gradient-to-r from-blue-500 to-nepali-blue';
  };

  // Function to handle image error - don't show card if image fails
  const handleImageError = () => {
    setImageError(true);
  };

  // Function to get image URL
  const getImageUrl = (food) => {
    if (food.imageUrl) {
      // If it's already a full URL, use it
      if (food.imageUrl.startsWith('http')) {
        return food.imageUrl;
      }
      // Otherwise, assume it's a local image filename
      return `http://localhost:8080/images/foods/${food.imageUrl}`;
    }
    return null;
  };

  // Function to truncate description
  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return 'Traditional Nepali delicacy';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  // Don't render card if image has error
  if (imageError) {
    return null;
  }

  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
      onClick={() => onClick && onClick(food)}
    >
      {/* Food Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img 
          src={getImageUrl(food)}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Food Type Badge (Traditional/Modern) */}
        <div className={`absolute top-3 left-3 px-3 py-1 text-white text-xs font-bold rounded-full ${getTypeBadgeColor(food.type)} shadow-lg`}>
          {food.type}
        </div>
        
        {/* Nutri-Score Badge */}
        {food.nutriScore && (
          <div className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center text-white font-bold rounded-full ${getNutriScoreColor(food.nutriScore)} shadow-lg`}>
            {food.nutriScore}
          </div>
        )}
        
        {/* Category Badge at bottom */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
          {food.category}
        </div>
      </div>

      {/* Food Details */}
      <div className="p-4">
        {/* Food Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-nepali-blue transition-colors line-clamp-1">
          {food.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {truncateDescription(food.description)}
        </p>
        
        {/* Nutritional Highlights - Compact Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center bg-gray-50 rounded-lg px-2 py-1">
            <p className="text-xs text-gray-500">Calories</p>
            <p className="text-sm font-semibold text-gray-900">{Math.round(food.calories)}</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg px-2 py-1">
            <p className="text-xs text-gray-500">Protein</p>
            <p className="text-sm font-semibold text-gray-900">{food.protein}g</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg px-2 py-1">
            <p className="text-xs text-gray-500">Carbs</p>
            <p className="text-sm font-semibold text-gray-900">{food.carbs}g</p>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {food.fat}g fat
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
              </svg>
              {food.fiber}g fiber
            </span>
          </div>
          <span className="text-xs text-gray-400">per 100g</span>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;