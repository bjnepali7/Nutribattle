// File: src/components/dashboard/DashboardNavigation.js
// Save this file in: C:\Nutribattle\nutribattle-frontend\src\components\dashboard\DashboardNavigation.js

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function DashboardNavigation({ activeTab, setActiveTab }) {
  const location = useLocation();
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'food-diary', label: 'Food Diary', icon: '📝' },
    { id: 'battle', label: 'Battle', icon: '⚔️' },
    { id: 'progress', label: 'Progress', icon: '📈' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-nepali-red to-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Quick Links */}
        <div className="flex items-center space-x-4">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-gray-700 hover:text-nepali-red transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings & Goals
          </Link>
          
          <Link
            to="/foods"
            className="flex items-center px-4 py-2 text-gray-700 hover:text-nepali-red transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            All Foods
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardNavigation;