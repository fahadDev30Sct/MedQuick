"use client";

import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheck, 
  FiX, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSave, 
  FiUser, 
  FiShield, 
  FiGrid, 
  FiChevronDown, 
  FiChevronRight, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiList
} from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Role {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  inactive?: boolean;
  updatedDate?: string;
  createdDate?: string;
  practiceId?: number;
}

interface ModuleNode {
  id: number;
  name: string;
  value?: string;
  nodesvalues?: any;
  parentId: number;
  children?: ModuleNode[] | null;
  inactive?: boolean;
}

interface RoleModule {
  id: number;
  roleId: number;
  moduleId: number;
  inactive: boolean;
  practiceId: number;
  createdDate?: string;
  updatedDate?: string;
  createdBy: string;
  updatedBy: string;
}

interface DeleteModulesRequest {
  moduleIds: number[];
  practiceId: number;
  deletedBy: string;
}

const Authorization = () => {
  const [activeTab, setActiveTab] = useState<'rights' | 'roles' | 'modules'>('rights');
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [roleModules, setRoleModules] = useState<RoleModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '', practiceId: 0 });
  const [userEmail, setUserEmail] = useState('');
  const [userRoleModules, setUserRoleModules] = useState<any[]>([]);

  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleNode | null>(null);
  const [newModuleData, setNewModuleData] = useState({
    name: '',
    value: '',
    parentId: 0,
    nodesvalues: '',
    inactive: false,
  });

  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRoleModules(selectedRole.id);
    }
  }, [selectedRole]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    return {
      'accept': '*/*',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/Module/Roles`, {
        headers: getAuthHeaders()
      });
      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/Module/getModulesList`, {
        headers: getAuthHeaders()
      });
      if (response.data && response.data.length > 0) {
        setModules(response.data);
        const rootNodes = response.data.filter((m: ModuleNode) => m.parentId === 0);
        if (rootNodes.length > 0) {
          setExpandedNodes(new Set([rootNodes[0].id]));
        }
      }
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      setError('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleModules = async (roleId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Module/getRolesModules?id=${roleId}`, {
        headers: getAuthHeaders()
      });
      setRoleModules(Array.isArray(response.data) ? response.data : []);
      
      const moduleIds = Array.isArray(response.data) 
        ? response.data.map((rm: RoleModule) => rm.moduleId) 
        : [];
      setSelectedModules(moduleIds);
    } catch (error: any) {
      console.error('Error fetching role modules:', error);
    }
  };

  const handleBulkDeleteModules = async () => {
    if (selectedModuleIds.length === 0) {
      setError('Please select at least one module to delete');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const deleteRequest: DeleteModulesRequest = {
        moduleIds: selectedModuleIds,
        practiceId: 2,
        deletedBy: "admin"
      };

      await axios.post(`${API_BASE_URL}/api/Module/DeleteModules`, deleteRequest, {
        headers: getAuthHeaders()
      });

      setSuccess(`Successfully deleted ${selectedModuleIds.length} module(s)`);
      setSelectedModuleIds([]);
      setShowDeleteConfirmation(false);
      await fetchModules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error deleting modules:', error);
      setError('Failed to delete modules');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        const deleteRequest: DeleteModulesRequest = {
          moduleIds: [moduleId],
          practiceId: 2,
          deletedBy: "admin"
        };

        await axios.post(`${API_BASE_URL}/api/Module/DeleteModules`, deleteRequest, {
          headers: getAuthHeaders()
        });

        setSuccess('Module deleted successfully!');
        await fetchModules();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        console.error('Error with bulk delete API, trying single delete:', error);
        
        try {
          await axios.delete(`${API_BASE_URL}/api/Module/DeleteModule?id=${moduleId}`, {
            headers: getAuthHeaders()
          });
          setSuccess('Module deleted successfully!');
          await fetchModules();
          setTimeout(() => setSuccess(''), 3000);
        } catch (fallbackError) {
          console.error('Error deleting module:', fallbackError);
          setError('Failed to delete module');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleModuleSelection = (moduleId: number) => {
    setSelectedModuleIds(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectAllModules = () => {
    const allModuleIds = getAllModuleIds(modules);
    setSelectedModuleIds(allModuleIds);
  };

  const clearAllSelections = () => {
    setSelectedModuleIds([]);
  };

  const getAllModuleIds = (moduleList: ModuleNode[]): number[] => {
    let ids: number[] = [];
    moduleList.forEach(module => {
      ids.push(module.id);
      if (module.children && module.children.length > 0) {
        ids = [...ids, ...getAllModuleIds(module.children)];
      }
    });
    return ids;
  };

  const handleModuleToggle = (moduleId: number) => {
    setSelectedModules(prevModules =>
      prevModules.includes(moduleId)
        ? prevModules.filter(id => id !== moduleId)
        : [...prevModules, moduleId]
    );
  };

  const toggleNodeExpansion = (nodeId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const fetchUserRoleModules = async (email: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/Module/getUserRolesModules?email=${email}`, {
        headers: getAuthHeaders()
      });
      setUserRoleModules(Array.isArray(response.data) ? response.data : []);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSuccess(`Permissions found for user: ${email}`);
      } else {
        setError(`No permissions found for user: ${email}`);
      }
    } catch (error: any) {
      console.error('Error fetching user role modules:', error);
      setError('Failed to fetch user permissions');
    } finally {
      setLoading(false);
    }
  };

  const openAddRoleModal = (roleToEdit?: Role) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleFormData({
        name: roleToEdit.name,
        description: roleToEdit.description || '',
        practiceId: roleToEdit.practiceId || 0
      });
    } else {
      setEditingRole(null);
      setRoleFormData({ name: '', description: '', practiceId: 0 });
    }
    setShowAddRoleModal(true);
  };

  const handleAddOrUpdateRole = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        id: editingRole ? editingRole.id : 0,
        name: roleFormData.name,
        description: roleFormData.description,
       
        inactive: false,
        
      };

      await axios.post(`${API_BASE_URL}/api/Module/AddRoles`, payload, {
        headers: getAuthHeaders(),
        timeout: 10000
      });

      setSuccess(`Role ${editingRole ? 'updated' : 'added'} successfully!`);
      setShowAddRoleModal(false);
      await fetchRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error(`Error ${editingRole ? 'updating' : 'adding'} role:`, error);
      setError(`Failed to ${editingRole ? 'update' : 'add'} role`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('Are you sure you want to delete this role? This cannot be undone.')) {
      try {
        setLoading(true);
        setError('');
        await axios.delete(`${API_BASE_URL}/api/Module/DeleteRoles?id=${roleId}`, {
          headers: getAuthHeaders()
        });
        setSuccess('Role deleted successfully!');
        await fetchRoles();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        console.error('Error deleting role:', error);
        setError('Failed to delete role');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveRights = async () => {
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const roleId = selectedRole.id;
      const existingModuleIds = new Set(roleModules.map(rm => rm.moduleId));
      
      const modulesToAdd = selectedModules.filter(id => !existingModuleIds.has(id));
      const modulesToRemove = roleModules.filter(rm => !selectedModules.includes(rm.moduleId));
      
      for (const moduleToDelete of modulesToRemove) {
        try {
          await axios.delete(`${API_BASE_URL}/api/Module/DeleteRolesModules?id=${moduleToDelete.id}`, {
            headers: getAuthHeaders(),
            timeout: 10000
          });
        } catch (deleteError) {
          console.error(`Error deleting role module ${moduleToDelete.id}:`, deleteError);
        }
      }

      for (const moduleId of modulesToAdd) {
        try {
          const payload = {
            id: 0,
            roleId: roleId,
            moduleId: moduleId,
            inactive: false,
            practiceId: selectedRole.practiceId || 0,
            createdBy: "admin",
            updatedBy: "admin"
          };
          
          await axios.post(`${API_BASE_URL}/api/Module/AddRolesModules`, payload, {
            headers: getAuthHeaders(),
            timeout: 10000
          });
        } catch (addError: any) {
          console.error(`Error adding module ${moduleId}:`, addError.response?.data || addError.message);
        }
      }

      setSuccess('Role permissions updated successfully!');
      await fetchRoleModules(roleId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating rights:', error);
      setError('Failed to update rights: Network or server error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        id: 0,
        ...newModuleData,
        practiceId: 2,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        createdBy: "admin",
        updatedBy: "admin"
      };

      await axios.post(`${API_BASE_URL}/api/Module/AddModules`, [payload], {
        headers: getAuthHeaders()
      });

      setSuccess('Module added successfully!');
      setShowAddModuleModal(false);
      setNewModuleData({ name: '', value: '', parentId: 0, nodesvalues: '', inactive: false });
      await fetchModules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding module:', error);
      setError('Failed to add module');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    try {
      setLoading(true);
      setError('');
      const payload = {
        ...editingModule,
        name: newModuleData.name,
        value: newModuleData.value,
        parentId: newModuleData.parentId,
        nodesvalues: newModuleData.nodesvalues,
        updatedDate: new Date().toISOString()
      };

      await axios.post(`${API_BASE_URL}/api/Module/AddModules`, payload, {
        headers: getAuthHeaders()
      });
      
      setSuccess('Module updated successfully!');
      setShowAddModuleModal(false);
      setEditingModule(null);
      await fetchModules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating module:', error);
      setError('Failed to update module');
    } finally {
      setLoading(false);
    }
  };

  const openAddModuleModal = (moduleToEdit?: ModuleNode) => {
    if (moduleToEdit) {
      setEditingModule(moduleToEdit);
      setNewModuleData({
        name: moduleToEdit.name,
        value: moduleToEdit.value || '',
        parentId: moduleToEdit.parentId,
        nodesvalues: moduleToEdit.nodesvalues || '',
        inactive: moduleToEdit.inactive || false,
      });
    } else {
      setEditingModule(null);
      setNewModuleData({ name: '', value: '', parentId: 0, nodesvalues: '', inactive: false });
    }
    setShowAddModuleModal(true);
  };

  const renderModuleTree = (node: ModuleNode, level: number = 0): ReactElement => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && Array.isArray(node.children) && node.children.length > 0;
    const isSelected = selectedModules.includes(node.id);
    const indentation = level * 20;

    return (
      <div key={node.id} className="w-full">
        <div 
          className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-green-50"
          style={{ paddingLeft: `${indentation + 12}px` }}
          onClick={() => hasChildren ? toggleNodeExpansion(node.id) : handleModuleToggle(node.id)}
        >
          {hasChildren ? (
            <motion.button
              onClick={(e) => { e.stopPropagation(); toggleNodeExpansion(node.id); }}
              className="text-gray-500 hover:text-green-700 p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
            </motion.button>
          ) : (
            <div className="w-8"></div>
          )}

          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-green-200">
            <FiGrid size={16} className="text-green-800" />
          </div>
          
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); handleModuleToggle(node.id); }}
            className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
          />
          
          <span className="text-gray-800 font-medium whitespace-now-wrap">{node.name}</span>
        </div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {node.children!.map(child => renderModuleTree(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderModuleItem = (module: ModuleNode, level: number = 0): ReactElement => {
    const isSelected = selectedModuleIds.includes(module.id);
    const hasChildren = module.children && module.children.length > 0;
    const indentation = level * 20;

    return (
      <div key={module.id}>
        <div 
          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200 shadow-sm"
          style={{ paddingLeft: `${indentation + 12}px` }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleModuleSelection(module.id)}
            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 mr-3"
          />
          
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100">
              <FiList size={12} className="text-green-600" />
            </div>
            <span className="text-gray-700 font-medium">{module.name}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => openAddModuleModal(module)}
              className="text-orange-600 hover:text-orange-800 p-2 rounded-full hover:bg-orange-100 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title="Edit module"
            >
              <FiEdit2 size={18} />
            </motion.button>
            <motion.button
              onClick={() => handleDeleteModule(module.id)}
              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title="Delete module"
            >
              <FiTrash2 size={18} />
            </motion.button>
          </div>
        </div>

        {hasChildren && (
          <div className="ml-8 mt-2 space-y-2">
            {module.children!.map(child => renderModuleItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderRightsSection = () => (
    <motion.div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiShield className="mr-2 text-green-600" />
          Rights Management
        </h3>
        <motion.button
          onClick={handleSaveRights}
          disabled={!selectedRole || loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition duration-200 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiSave size={16} />
          <span>Save Permissions</span>
        </motion.button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Role to Manage
          </label>
          <select
            value={selectedRole?.id || ''}
            onChange={(e) => {
              const role = roles.find(r => r.id === parseInt(e.target.value));
              setSelectedRole(role || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          >
            <option value="">Select a role...</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto shadow-inner">
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Module Permissions:</h4>
          {modules.length > 0 ? (
            <div className="space-y-2">
              {modules.map(module => renderModuleTree(module))}
            </div>
          ) : (
            <p className="text-gray-500">Loading modules...</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderRolesSection = () => (
    <motion.div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiUser className="mr-2 text-green-600" />
          Role Directory
        </h3>
        <motion.button
          onClick={() => openAddRoleModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition duration-200 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus size={16} />
          <span>Add New Role</span>
        </motion.button>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
        <h4 className="font-semibold mb-3 text-gray-800">Check User Permissions:</h4>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter user email address"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
          <motion.button
            onClick={() => userEmail && fetchUserRoleModules(userEmail)}
            disabled={!userEmail || loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition duration-200 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Check Permissions
          </motion.button>
        </div>
        <AnimatePresence>
          {userRoleModules.length > 0 && (
            <motion.div
              className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-sm font-medium">User has permissions for {userRoleModules.length} modules.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer ${
              selectedRole?.id === role.id ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-white hover:bg-gray-50'
            } transition duration-200`}
            onClick={() => setSelectedRole(role)}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex-1 space-y-1 mb-2 md:mb-0">
              <h4 className="text-lg text-gray-800 font-semibold">{role.name}</h4>
              {role.description && (
                <p className="text-sm text-gray-500">{role.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>ID: {role.id}</span>
                <span>Practice: {role.practiceId || 'N/A'}</span>
                {role.createdDate && (
                  <span>Created: {new Date(role.createdDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={(e) => { e.stopPropagation(); openAddRoleModal(role); }}
                className="text-orange-600 hover:text-orange-800 p-2 rounded-full hover:bg-orange-100 transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title="Edit role"
              >
                <FiEdit2 size={18} />
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title="Delete role"
              >
                <FiTrash2 size={18} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddRoleModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddRoleModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingRole ? 'Edit Role' : 'Add New Role'}
                  </h3>
                  <button onClick={() => setShowAddRoleModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                    <input
                      type="text"
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="e.g., Administrator, Staff"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Brief description of the role"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice ID</label>
                    <input
                      type="number"
                      value={roleFormData.practiceId}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, practiceId: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <motion.button
                    onClick={() => setShowAddRoleModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    onClick={handleAddOrUpdateRole}
                    disabled={!roleFormData.name.trim() || loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition duration-200 flex items-center space-x-2 shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-t-2 border-white border-t-transparent animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave size={16} />
                        <span>{editingRole ? 'Update Role' : 'Add Role'}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderModulesSection = () => (
    <motion.div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiGrid className="mr-2 text-green-600" />
            Module Library
          </h3>
          <p className="text-gray-600 mt-1">View all available modules and their hierarchy. Select multiple modules for bulk operations.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {selectedModuleIds.length > 0 && (
            <motion.button
              onClick={() => setShowDeleteConfirmation(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiTrash2 size={16} />
              <span>Delete Selected ({selectedModuleIds.length})</span>
            </motion.button>
          )}
          <motion.button
            onClick={() => openAddModuleModal()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus size={16} />
            <span>Add Module</span>
          </motion.button>
        </div>
      </div>

      {modules.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <motion.button
            onClick={selectAllModules}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Select All
          </motion.button>
          <motion.button
            onClick={clearAllSelections}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Selection
          </motion.button>
          {selectedModuleIds.length > 0 && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
              {selectedModuleIds.length} module(s) selected
            </span>
          )}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto shadow-inner">
        {modules.length > 0 ? (
          <div className="space-y-2">
            {modules.map(module => renderModuleItem(module))}
          </div>
        ) : (
          <p className="text-gray-500">No modules found. Add a new one to get started.</p>
        )}
      </div>
    </motion.div>
  );

  const renderAddModuleModal = () => (
    <AnimatePresence>
      {showAddModuleModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAddModuleModal(false)}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h3>
                <button onClick={() => setShowAddModuleModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Name *</label>
                  <input
                    type="text"
                    value={newModuleData.name}
                    onChange={(e) => setNewModuleData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="e.g., User Management"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Value</label>
                  <input
                    type="text"
                    value={newModuleData.value}
                    onChange={(e) => setNewModuleData(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="e.g., /admin/users"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Module (ID)</label>
                  <select
                    value={newModuleData.parentId}
                    onChange={(e) => setNewModuleData(prev => ({ ...prev, parentId: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value={0}>No Parent (Root Module)</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.name} (ID: {module.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={editingModule ? handleUpdateModule : handleAddModule}
                  disabled={!newModuleData.name.trim() || loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition duration-200 flex items-center space-x-2 shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-2 border-white border-t-transparent animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      <span>{editingModule ? 'Update Module' : 'Add Module'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDeleteConfirmationModal = () => (
    <AnimatePresence>
      {showDeleteConfirmation && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDeleteConfirmation(false)}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Delete Modules</h3>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete {selectedModuleIds.length} selected module(s)? 
                This will permanently remove the modules and their associations.
              </p>
              
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleBulkDeleteModules}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition duration-200 flex items-center space-x-2 shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-2 border-white border-t-transparent animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      <span>Delete {selectedModuleIds.length} Module(s)</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Authorization Manager</h1>
        <p className="text-lg text-gray-600">Administer roles, permissions, and system modules.</p>
      </motion.div>

      <motion.div
        className="flex space-x-1 mb-6 bg-white p-1 rounded-xl border border-gray-200 w-fit shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { id: 'rights', label: 'Rights', icon: FiShield },
          { id: 'roles', label: 'Roles', icon: FiUser },
          { id: 'modules', label: 'Modules', icon: FiGrid }
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id as 'rights' | 'roles' | 'modules')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
              activeTab === id
                ? 'bg-green-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="mb-4 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-sm flex items-center space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="alert"
          >
            <FiAlertTriangle size={20} className="text-red-500" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            className="mb-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-sm flex items-center space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="alert"
          >
            <FiCheckCircle size={20} className="text-green-500" />
            <span className="font-medium">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'rights' && renderRightsSection()}
        {activeTab === 'roles' && renderRolesSection()}
        {activeTab === 'modules' && renderModulesSection()}
      </motion.div>

      {renderAddModuleModal()}
      {renderDeleteConfirmationModal()}

      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="w-8 h-8 rounded-full border-4 border-t-4 border-green-600 border-t-transparent animate-spin"></div>
              <span className="text-lg text-gray-700 font-semibold">Loading...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Authorization;