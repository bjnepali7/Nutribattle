// src/components/Navbar.js - UPDATED VERSION
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function Navbar() {
  const navigate = useNavigate();
  
  // Check if user is logged in and get user info
  const isLoggedIn = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand - Always visible */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-nepali-red">🍛 NutriBattle</span>
          </Link>

          {/* Desktop Menu - Hidden on mobile, visible on medium screens and up */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Public Links - Always visible */}
            <Link 
              to="/" 
              className="text-gray-700 hover:text-nepali-blue transition duration-300"
            >
              Home
            </Link>
            
            <Link 
              to="/foods" 
              className="text-gray-700 hover:text-nepali-blue transition duration-300"
            >
              All Foods
            </Link>

            {/* Logged-in User Links */}
            {isLoggedIn ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-nepali-blue transition duration-300"
                >
                  Dashboard
                </Link>
                
                {/* ADD THIS PROFILE LINK */}
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-nepali-blue transition duration-300"
                >
                  Profile
                </Link>
                
                {/* Admin-only Link */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-nepali-red transition duration-300"
                  >
                    Admin Panel
                  </Link>
                )}
                
                {/* User Info and Logout */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.fullName || user?.username}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              /* Not Logged In - Show Login/Signup buttons */
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-nepali-blue transition duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-nepali-blue text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Visible only on small screens */}
          <div className="md:hidden">
            <button
              onClick={() => {
                // Toggle mobile menu
                const mobileMenu = document.getElementById('mobile-menu');
                mobileMenu.classList.toggle('hidden');
              }}
              className="text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Hidden by default */}
        <div id="mobile-menu" className="hidden md:hidden pb-4">
          <Link to="/" className="block py-2 text-gray-700 hover:text-nepali-blue">
            Home
          </Link>
          <Link to="/foods" className="block py-2 text-gray-700 hover:text-nepali-blue">
            All Foods
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-nepali-blue">
                Dashboard
              </Link>
              
              {/* ADD PROFILE LINK TO MOBILE MENU TOO */}
              <Link to="/profile" className="block py-2 text-gray-700 hover:text-nepali-blue">
                Profile
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="block py-2 text-gray-700 hover:text-nepali-red">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700 hover:text-nepali-blue">
                Login
              </Link>
              <Link to="/signup" className="block py-2 text-nepali-blue font-semibold">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;