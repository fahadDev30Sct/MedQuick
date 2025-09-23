"use client"
import React, { useState, useEffect } from 'react';
import Login from '../Pages/Login';
import AdminNavbar from '../AdminPanels/Admin/AdminNavbar';
import AdminSidebar from '../AdminPanels/Admin/AdminSidebar';
import Authorization from '../AdminPanels/Admin/Authorization';
import Users from '../AdminPanels/Admin/Users'; // Import the Users component

const Page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeComponent, setActiveComponent] = useState('dashboard');

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

  const handleSidebarItemClick = (componentId: string) => {
    setActiveComponent(componentId);
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
          </div>
        );
      case 'users':
        return <Users />;
      case 'authorization':
        return <Authorization />;
      case 'settings':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your application settings here.</p>
          </div>
        );
      default:
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn ? (
        <div className="flex flex-col h-screen">
          <div className="fixed top-0 left-0 right-0 z-50 h-16">
            <AdminNavbar onSignOut={handleSignOut} />
          </div>
          
          <div className="flex flex-1 pt-16 h-full">
            <div className={`fixed top-16 left-0 bottom-0 z-40 transition-all duration-300 ${
              isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}>
              <AdminSidebar 
                onSignOut={handleSignOut}
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
                onItemClick={handleSidebarItemClick}
              />
            </div>
            
            <main className={`flex-1 transition-all duration-300 min-h-full ${
              isSidebarCollapsed ? 'ml-20' : 'ml-64'
            }`}>
              <div className="p-8 h-full overflow-auto">
                {renderActiveComponent()}
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default Page;