// File: src/components/BMICalculator.js

import React, { useEffect, useState } from 'react';

function BMICalculator({ weight, height }) {
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (weight && height) {
      calculateBMI();
    }
  }, [weight, height]);

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(bmiValue);
    
    if (bmiValue < 18.5) {
      setCategory('Underweight');
    } else if (bmiValue < 25) {
      setCategory('Normal');
    } else if (bmiValue < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'Underweight': return 'bg-blue-100 text-blue-800';
      case 'Normal': return 'bg-green-100 text-green-800';
      case 'Overweight': return 'bg-yellow-100 text-yellow-800';
      case 'Obese': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!bmi) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">BMI Calculator</h3>
      <div className="flex items-center space-x-8">
        <div>
          <p className="text-sm text-gray-600">Your BMI</p>
          <p className="text-3xl font-bold text-gray-900">{bmi.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Category</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor()}`}>
            {category}
          </span>
        </div>
      </div>
      
      {/* BMI Scale Visualization */}
      <div className="mt-6">
        <div className="relative h-8 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full">
          <div 
            className="absolute top-0 h-8 w-1 bg-gray-900"
            style={{ left: `${Math.min(100, Math.max(0, (bmi - 15) * 3.33))}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>35+</span>
        </div>
      </div>
    </div>
  );
}

export default BMICalculator;