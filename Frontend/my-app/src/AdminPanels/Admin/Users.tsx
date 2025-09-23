// AdminPanels/Admin/Users.tsx
"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaSearch, FaEye, FaEdit, FaToggleOn, FaToggleOff, FaTrash, FaTimes, FaSpinner, FaCircle } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface User {
  id: number;
  fullName: string;
  userName: string;
  photoUrl: string;
  email: string;
  dob: string;
  password?: string;
  resetPassword: boolean;
  provider_id: number;
  userType: string;
  gender: string;
  street: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  profilePhoto: string;
  contactNo: string;
  lastLogin: string;
  isSuperUser: boolean;
  isStaff: boolean;
  isActive: boolean;
  psychastricPhysician: boolean;
  defaultpracticeId: number;
  defaultFacilityId: number;
  dateJoined: string;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  updatedBy: string;
  roleId: number;
  isVerified: boolean;
  mobileLogin: boolean;
  status: string;
  signUrl: string;
  userpractices: string;
  signbase64: string;
  base64: string;
  token: string;
  practices: number;
  confirmPassword?: string;
}

interface UserFormData {
  fullName: string;
  userName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  contactNo: string;
  userType: string;
  roleId: number;
  gender: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
  isStaff: boolean;
}

// Axios interceptor to add JWT token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: '',
    userType: 'user',
    roleId: 0,
    gender: 'male',
    dob: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isActive: true,
    isStaff: false
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('jwtToken');
  };

  const createAuthApi = () => {
    const token = getAuthToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const authApi = createAuthApi();
      const response = await authApi.get(`${API_BASE_URL}/api/Users/GetUsers`);
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        handleTokenExpired();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenExpired = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.userName.trim()) errors.userName = 'Username is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.contactNo.trim()) errors.contactNo = 'Contact number is required';
    if (!formData.userType) errors.userType = 'User type is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = {
        ...formData,
        resetPassword: false,
        provider_id: 0,
        psychastricPhysician: false,
        defaultpracticeId: 0,
        defaultFacilityId: 0,
        isSuperUser: false,
        isVerified: true,
        mobileLogin: false,
        status: "active",
        practices: 0,
        confirmPassword: undefined,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/Users/userRegistration`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage('User registered successfully!');
      setShowAddUserModal(false);
      resetForm();
      fetchUsers();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error registering user:', error);
      if (error.response?.status === 401) {
        handleTokenExpired();
      } else if (error.response?.data) {
        setFormErrors({ submit: error.response.data.message || 'Failed to register user' });
      } else {
        setFormErrors({ submit: 'Failed to register user. Please try again.' });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      contactNo: '',
      userType: 'user',
      roleId: 0,
      gender: 'male',
      dob: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isActive: true,
      isStaff: false
    });
    setFormErrors({});
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      const token = getAuthToken();
      await axios.put(`${API_BASE_URL}/api/Users/${userId}/status`, {
        isActive: !currentStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      if (error.response?.status === 401) {
        handleTokenExpired();
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = getAuthToken();
      await axios.delete(`${API_BASE_URL}/api/Users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUsers();
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.response?.status === 401) {
        handleTokenExpired();
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) return { text: 'Inactive', class: 'bg-red-100 text-red-800' };
    if (!user.isVerified) return { text: 'Unverified', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Active', class: 'bg-green-100 text-green-800' };
  };

  const getUserTypeBadge = (userType: string) => {
    const types: { [key: string]: string } = {
      'admin': 'bg-purple-100 text-purple-800',
      'staff': 'bg-blue-100 text-blue-800',
      'user': 'bg-gray-100 text-gray-800',
      'physician': 'bg-orange-100 text-orange-800'
    };
    return types[userType] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green-500" />
        <div className="text-lg ml-2">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
        User Management 👥
      </h1>
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg shadow-md flex items-center">
          <FaCircle className="text-green-500 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <FaUserPlus />
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type & Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const statusBadge = getStatusBadge(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {user.photoUrl ? (
                            <img 
                              src={user.photoUrl} 
                              alt={user.fullName}
                              className="h-12 w-12 rounded-full object-cover border-2 border-green-500"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold">
                              {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                          <div className="text-xs text-gray-500">@{user.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.contactNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeBadge(user.userType)}`}>
                        {user.userType}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">Role ID: {user.roleId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.isSuperUser && 'Super User'}
                        {user.isStaff && ' | Staff'}
                        {user.psychastricPhysician && ' | Physician'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors" title="Edit User">
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        className={`p-1 rounded-full transition-colors ${
                          user.isActive 
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-100' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-100'
                        }`}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching your search criteria. 😞
          </div>
        )}
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl transform scale-95 md:scale-100 transition-transform">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">Register New User</h3>
              <button 
                onClick={() => {
                  setShowAddUserModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {formErrors.userName && <p className="text-red-500 text-xs mt-1">{formErrors.userName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {formErrors.contactNo && <p className="text-red-500 text-xs mt-1">{formErrors.contactNo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User Type <span className="text-red-500">*</span></label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="physician">Physician</option>
                  </select>
                  {formErrors.userType && <p className="text-red-500 text-xs mt-1">{formErrors.userType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role ID</label>
                  <input
                    type="number"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isStaff"
                      checked={formData.isStaff}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Staff</label>
                  </div>
                </div>
              </div>

              {formErrors.submit && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                  {formErrors.submit}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2 justify-center"
                >
                  {submitLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl transform scale-95 md:scale-100 transition-transform">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">User Details</h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div className="space-y-1">
                <label className="font-semibold text-sm">Full Name:</label>
                <p className="text-md">{selectedUser.fullName}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-sm">Username:</label>
                <p className="text-md">@{selectedUser.userName}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-sm">Email:</label>
                <p className="text-md">{selectedUser.email}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-sm">Phone:</label>
                <p className="text-md">{selectedUser.contactNo || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-sm">User Type:</label>
                <p className="text-md capitalize">{selectedUser.userType}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-sm">Role ID:</label>
                <p className="text-md">{selectedUser.roleId}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-sm">Date Joined:</label>
                <p className="text-md">{formatDate(selectedUser.dateJoined)}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-sm">Last Login:</label>
                <p className="text-md">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
              </div>
              <div className="space-y-1 col-span-1 md:col-span-2">
                <label className="font-semibold text-sm">Address:</label>
                <p className="text-md">{selectedUser.address || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setShowUserModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;