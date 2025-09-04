// src/pages/TestAPI.js
// Temporary debug page to test API connections

import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';

function TestAPI() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  // Test basic backend connection
  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/test');
      setResults(prev => ({
        ...prev,
        backend: { success: true, data: response.data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        backend: { success: false, error: error.message }
      }));
    }
    setLoading(false);
  };

  // Test username check
  const testUsernameCheck = async () => {
    setLoading(true);
    try {
      // Test with a username that should exist
      const response1 = await authService.checkUsername('admin');
      // Test with a username that shouldn't exist
      const response2 = await authService.checkUsername('newuser999');
      
      setResults(prev => ({
        ...prev,
        usernameCheck: {
          success: true,
          admin: response1.data,
          newuser: response2.data
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        usernameCheck: { success: false, error: error.message }
      }));
    }
    setLoading(false);
  };

  // Test email check
  const testEmailCheck = async () => {
    setLoading(true);
    try {
      // Test with an email that should exist
      const response1 = await authService.checkEmail('admin@nutribattle.com');
      // Test with an email that shouldn't exist
      const response2 = await authService.checkEmail('new999@example.com');
      
      setResults(prev => ({
        ...prev,
        emailCheck: {
          success: true,
          existing: response1.data,
          new: response2.data
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        emailCheck: { success: false, error: error.message }
      }));
    }
    setLoading(false);
  };

  // Test all foods endpoint
  const testFoodsEndpoint = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/foods');
      setResults(prev => ({
        ...prev,
        foods: { 
          success: true, 
          count: response.data.length,
          sample: response.data.slice(0, 2)
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        foods: { success: false, error: error.message }
      }));
    }
    setLoading(false);
  };

  // Run all tests
  const runAllTests = async () => {
    setResults({});
    await testBackendConnection();
    await testUsernameCheck();
    await testEmailCheck();
    await testFoodsEndpoint();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testBackendConnection}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Test Backend
            </button>
            <button
              onClick={testUsernameCheck}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Test Username Check
            </button>
            <button
              onClick={testEmailCheck}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              Test Email Check
            </button>
            <button
              onClick={testFoodsEndpoint}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
            >
              Test Foods API
            </button>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              Run All Tests
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2">Running tests...</p>
            </div>
          )}
          
          {Object.keys(results).length > 0 && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}
          
          {!loading && Object.keys(results).length === 0 && (
            <p className="text-gray-500">Click a button above to run tests</p>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Results:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✅ Backend test should return: {`{ message: "API is working!" }`}</li>
            <li>✅ Username "admin" should return: {`{ success: false }` } (taken)</li>
            <li>✅ Username "newuser999" should return: {`{ success: true }` } (available)</li>
            <li>✅ Email "admin@nutribattle.com" should return: {`{ success: false }` } (taken)</li>
            <li>✅ Email "new999@example.com" should return: {`{ success: true }` } (available)</li>
            <li>✅ Foods endpoint should return array of food items</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TestAPI;