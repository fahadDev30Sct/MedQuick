"use client"
import React, { useState } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiChevronLeft, 
  FiChevronRight,
  FiLogOut,
  FiBarChart2,
  FiDatabase,
  FiShield
} from 'react-icons/fi';

interface AdminSidebarProps {
  onSignOut: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onItemClick: (itemId: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  onSignOut, 
  isCollapsed, 
  onToggle, 
  onItemClick 
}) => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiHome,
      path: '/admin'
    },
    {
      id: 'users',
      label: 'Users',
      icon: FiUsers,
      path: '/admin/users'
    },
    {
      id: 'authorization',
      label: 'Authorization',
      icon: FiShield,
      path: '/admin/authorization'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FiSettings,
      path: '/admin/settings'
    }
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    onItemClick(itemId);
  };

  return (
    <div 
      className={`bg-green-800 text-white flex flex-col transition-all duration-300 h-full ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Button Only */}
      <div className="p-4 flex items-center justify-end">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 pb-4 overflow-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeItem === item.id 
                    ? 'bg-green-700 text-white shadow-md' 
                    : 'hover:bg-green-700 hover:shadow-sm'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 whitespace-nowrap font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={onSignOut}
          className={`w-full flex items-center p-3 rounded-lg hover:bg-red-600 transition-all duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <FiLogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 whitespace-nowrap font-medium">Sign Out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;