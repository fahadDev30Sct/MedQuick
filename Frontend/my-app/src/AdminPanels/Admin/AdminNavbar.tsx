import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import CryptoJS from 'crypto-js';

interface ResetPasswordData {
  emailAddress: string;
  currentPassword: string;
  newPassword: string;
  resetPassword: boolean;
}

interface AdminNavbarProps {
  onSignOut: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onSignOut }) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState<ResetPasswordData>({
    emailAddress: '',
    currentPassword: '',
    newPassword: '',
    resetPassword: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Handle input changes for reset password form
  const handleResetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Function to encrypt password with MD5
  const encryptPassword = (password: string): string => {
    return CryptoJS.MD5(password).toString();
  };

  // Handle reset password submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const encryptedResetData = {
        ...resetData,
        currentPassword: encryptPassword(resetData.currentPassword),
        newPassword: encryptPassword(resetData.newPassword)
      };

      console.log('Reset password data:', encryptedResetData);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Users/resetPassword`,
        encryptedResetData,
        {
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        console.log('Password reset successful:', response.data);
        setSuccess('Password reset successfully!');
        setTimeout(() => {
          setShowResetModal(false);
          setResetData({
            emailAddress: '',
            currentPassword: '',
            newPassword: '',
            resetPassword: true
          });
          setSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const errorData = err.response.data;
          
          if (status === 400) {
            setError('Invalid current password or email address');
          } else if (status === 404) {
            setError('User not found');
          } else if (status === 401) {
            setError('Current password is incorrect');
          } else if (status >= 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(errorData?.message || 'Password reset failed. Please check your information.');
          }
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timeout. Please try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out - now calls the parent function
  const handleSignOut = () => {
    onSignOut();
  };

  return (
    <>
      {/* Admin Navbar */}
      <motion.nav 
        className="bg-green-800 shadow-lg px-6 py-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {/* Logo */}
            <motion.div 
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/assets/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </motion.div>
            
            {/* Title */}
            <div>
              <h1 className="text-white text-2xl font-bold">MedQuick Admin</h1>
              <p className="text-green-200 text-sm">Dashboard Panel</p>
            </div>
          </motion.div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-4">
            {/* Reset Password Button */}
            <motion.button
              onClick={() => setShowResetModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Reset Password</span>
            </motion.button>

            {/* Sign Out Button */}
            <motion.button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetModal(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-green-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-xl font-semibold">Reset Password</h3>
                  <motion.button
                    onClick={() => setShowResetModal(false)}
                    className="text-white hover:text-green-200 transition duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={resetData.emailAddress}
                      onChange={handleResetInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={resetData.currentPassword}
                        onChange={handleResetInputChange}
                        required
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition duration-200"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={resetData.newPassword}
                        onChange={handleResetInputChange}
                        required
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition duration-200"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div 
                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        key="error"
                      >
                        <div className="flex items-center">
                          <motion.svg 
                            className="w-5 h-5 text-red-400 mr-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </motion.svg>
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success Message */}
                  <AnimatePresence mode="wait">
                    {success && (
                      <motion.div 
                        className="bg-green-50 border border-green-200 rounded-lg p-3"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        key="success"
                      >
                        <div className="flex items-center">
                          <motion.svg 
                            className="w-5 h-5 text-green-400 mr-2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </motion.svg>
                          <p className="text-sm text-green-600">{success}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-800 hover:bg-green-900 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition duration-200 relative overflow-hidden"
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                      <span className="flex items-center justify-center">
                        {loading ? (
                          <>
                            <motion.svg 
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </motion.svg>
                            Resetting...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Dashboard Content Area */}
      <div className="min-h-screen bg-gray-100 p-6">
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
          <p className="text-gray-600">Welcome to the MedQuick Admin Panel. Use the navigation above to manage your account.</p>
          
          {/* API Configuration Display */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-2">API Configuration</h3>
            <p className="text-xs text-green-600">Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
            <p className="text-xs text-green-600">Reset Password Endpoint: /api/Users/resetPassword</p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminNavbar;