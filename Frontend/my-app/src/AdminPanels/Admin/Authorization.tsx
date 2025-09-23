// AdminPanels/Admin/Authorization.tsx
"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Authorization = () => {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Module/GetRoles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Module/getModulesList`);
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleModuleToggle = (moduleId) => {
    setSelectedModules(prevModules =>
      prevModules.includes(moduleId)
        ? prevModules.filter(id => id !== moduleId)
        : [...prevModules, moduleId]
    );
  };

  const handleAssignModules = async () => {
    try {
      const payload = selectedModules.map(moduleId => ({
        roleId: parseInt(selectedRole),
        moduleId: moduleId,
        inactive: false,
        practiceId: 0,
        createdBy: 'your_user_id',
        updatedBy: 'your_user_id'
      }));

      await axios.post(`${API_BASE_URL}/api/Module/AddRolesModules`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert('Modules assigned successfully!');
      setSelectedRole('');
      setSelectedModules([]);
    } catch (error) {
      console.error('Error assigning modules:', error);
      alert('Failed to assign modules.');
    }
  };

  const renderModuleTree = (modules) => {
    return (
      <ul>
        {modules.map(module => (
          <li key={module.id}>
            <input
              type="checkbox"
              checked={selectedModules.includes(module.id)}
              onChange={() => handleModuleToggle(module.id)}
            />
            {module.name}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Authorization Management</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Roles Module */}
        <div style={{ border: '1px solid #ccc', padding: '15px', flex: 1 }}>
          <h2>Rights</h2>
          <select value={selectedRole} onChange={handleRoleChange}>
            <option value="">Select a Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Modules Module */}
        <div style={{ border: '1px solid #ccc', padding: '15px', flex: 1 }}>
          <h2>Roles</h2>
          {renderModuleTree(modules)}
        </div>

        {/* Permissions Management Module */}
        <div style={{ border: '1px solid #ccc', padding: '15px', flex: 1 }}>
          <h2> Modules </h2>
          {selectedRole && (
            <div>
              <p>Selected Role: <strong>{roles.find(r => r.id.toString() === selectedRole)?.name}</strong></p>
              <button onClick={handleAssignModules} disabled={selectedModules.length === 0}>
                Assign Selected Modules
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Authorization;