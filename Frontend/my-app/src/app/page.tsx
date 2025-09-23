"use client"
import React, { useState, useEffect } from 'react';
import Login from '../Pages/Login';
import AdminNavbar from '../AdminPanels/Admin/AdminNavbar';

const Page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
  };

  // Function to handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Function to handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
    // Removed the redirect since we're conditionally rendering components
  };

  return (
    <div>
      {isLoggedIn ? (
        // Show admin panel with navbar after successful login
        <div>
          <AdminNavbar onSignOut={handleSignOut} />
          {/* You can add more admin panel content here */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Admin Dashboard</h2>
            <p className="text-gray-600">You are successfully logged in!</p>
          </div>
        </div>
      ) : (
        // Show login form if not logged in
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default Page;