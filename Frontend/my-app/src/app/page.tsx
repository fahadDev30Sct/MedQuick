"use client"
import React, { useState, useEffect } from 'react';
import Login from '../Pages/Login';
import AdminNavbar from '../AdminPanels/Admin/AdminNavbar';
import AdminSidebar from '../AdminPanels/Admin/AdminSidebar';

const Page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div>
      {isLoggedIn ? (
        // Fixed layout structure
        <div className="flex h-screen bg-gray-100 overflow-hidden">
          {/* Sidebar - Fixed positioning */}
          <div className={`fixed left-0 top-0 z-40 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}>
            <AdminSidebar 
              onSignOut={handleSignOut}
              isCollapsed={isSidebarCollapsed}
              onToggle={toggleSidebar}
            />
          </div>
          
          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            {/* Navbar - Fixed to top */}
            <div className="fixed top-0 right-0 left-0 z-30 transition-all duration-300"
              style={{
                left: isSidebarCollapsed ? '4rem' : '16rem',
                right: 0
              }}
            >
              <AdminNavbar onSignOut={handleSignOut} />
            </div>
            
            {/* Dashboard Content - Pushed below navbar */}
            <div className="flex-1 pt-20 p-6 overflow-auto mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600">You are successfully logged in!</p>
              
              {/* Dashboard content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">Dashboard Stats</h3>
                  <p className="text-gray-600">Some important statistics here...</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                  <p className="text-gray-600">Recent user activities...</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                  <p className="text-gray-600">Common admin actions...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default Page;