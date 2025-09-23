"use client"
import React, { useState } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiChevronLeft, 
  FiChevronRight,
  FiLogOut 
} from 'react-icons/fi';

interface AdminSidebarProps {
  onSignOut: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onSignOut, isCollapsed, onToggle }) => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiHome,
      path: '/admin'
    },
    {
      id: 'authorization',
      label: 'Authorization',
      icon: FiUsers,
      path: '/admin/authorization'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FiSettings,
      path: '/admin/settings'
    }
  ];

  return (
    <div className={`bg-gray-800 text-white h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between h-16">
        {!isCollapsed && (
          <h1 className="text-xl font-bold whitespace-nowrap">Admin Panel</h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeItem === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-700'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 whitespace-nowrap">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onSignOut}
          className={`w-full flex items-center p-3 rounded-lg hover:bg-red-600 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <FiLogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 whitespace-nowrap">Sign Out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;