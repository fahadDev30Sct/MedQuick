"use client"
import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface FormData {
  userName: string;
  password: string;
  app: boolean;
}

interface ApiErrorResponse {
  message?: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    password: '',
    app: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Users/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      if (response.status === 200) {
        console.log('Login successful:', response.data);
        setSuccessMessage('Login successful!');
        
        const jwtToken = response.data.token; 
        if (jwtToken) {
          localStorage.setItem('jwtToken', jwtToken);
          console.log('JWT Token stored successfully');
        } else {
          console.error('Login successful, but no JWT token received.');
          setError('Login successful, but a session token was not provided.');
        }
      }
      
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const errorData = axiosError.response.data;
          
          if (status === 401) {
            setError('Invalid username or password');
          } else if (status >= 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(errorData?.message || 'Login failed. Please check your credentials.');
          }
        } else if (axiosError.request) {
          setError('Network error. Please check your connection.');
        } else if (axiosError.code === 'ECONNABORTED') {
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

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      y: 20, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12
      }
    }
  };

  const inputFocusVariants: Variants = {
    initial: { scale: 1, borderColor: "#bbf7d0" },
    focused: { 
      scale: 1.02, 
      borderColor: "#16a34a",
      boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const buttonVariants: Variants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    loading: {
      scale: 0.98,
      opacity: 0.8
    }
  };

  const messageVariants: Variants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      marginTop: 0,
      marginBottom: 0
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      marginTop: "0.75rem",
      marginBottom: "0.75rem",
      transition: {
        opacity: { duration: 0.3 },
        height: { duration: 0.4 },
        margin: { duration: 0.4 }
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3 },
        margin: { duration: 0.3 }
      }
    }
  };

  const logoVariants: Variants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.5
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const backgroundVariants: Variants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Fixed floating animation variants
  const floatingVariants: Variants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse" as const,
          duration: 3,
          ease: "easeInOut"
        }
      }
    }
  };

  const floatingVariantsDelayed: Variants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse" as const,
          duration: 3,
          ease: "easeInOut",
          delay: 1
        }
      }
    }
  };

  const floatingVariantsDelayed2: Variants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse" as const,
          duration: 3,
          ease: "easeInOut",
          delay: 2
        }
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4 relative overflow-hidden"
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-10 left-10 w-20 h-20 bg-green-600 rounded-full opacity-20"
        variants={floatingVariants}
        initial="animate"
        animate="animate"
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-16 h-16 bg-green-500 rounded-full opacity-30"
        variants={floatingVariantsDelayed}
        initial="animate"
        animate="animate"
      />
      <motion.div 
        className="absolute top-1/2 left-1/4 w-12 h-12 bg-green-400 rounded-full opacity-25"
        variants={floatingVariantsDelayed2}
        initial="animate"
        animate="animate"
      />

      <motion.div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ 
          y: -5,
          transition: { type: "spring", stiffness: 300, damping: 15 }
        }}
      >
        
        {/* Header Section */}
        <motion.div 
          className="bg-green-800 px-8 py-10 text-center relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Animated background pattern */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse" as const
            }}
            style={{
              backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="flex flex-col items-center relative z-10">
            {/* Logo and Title Container */}
            <motion.div 
              className="flex items-center justify-center mb-4"
              variants={itemVariants}
            >
              {/* Logo */}
              <motion.div 
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 mr-3"
                variants={logoVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
              >
                <motion.img 
                  src="/assets/logo.png"
                  alt="Logo" 
                  className="w-full h-full object-contain rounded-full"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              
              {/* Title */}
              <motion.h1 
                className="text-white text-2xl font-bold"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                MedQuick
              </motion.h1>
            </motion.div>
            
            {/* Welcome text */}
            <motion.h2 
              className="text-white text-xl font-semibold mb-2"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome Back
            </motion.h2>
            
            <motion.p 
              className="text-green-100 text-sm"
              variants={itemVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Please sign in to your account
            </motion.p>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div 
          className="px-8 py-8"
          variants={containerVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="userName" className="block text-sm font-semibold text-green-800 mb-2">
                Username
              </label>
              <motion.div
                variants={inputFocusVariants}
                initial="initial"
                whileFocus="focused"
              >
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none transition duration-200 text-gray-700 placeholder-gray-400"
                  placeholder="Enter your username"
                />
              </motion.div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-semibold text-green-800 mb-2">
                Password
              </label>
              <motion.div
                variants={inputFocusVariants}
                initial="initial"
                whileFocus="focused"
                className="relative"
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-green-200 rounded-lg focus:outline-none transition duration-200 text-gray-700 placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 transition duration-200"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
              {successMessage && (
                <motion.div 
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-green-800 hover:bg-green-900 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition duration-200 relative overflow-hidden"
                variants={buttonVariants}
                initial="initial"
                whileHover={!loading ? "hover" : "loading"}
                whileTap={!loading ? "tap" : "loading"}
              >
                {/* Animated button background */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800"
                  initial={{ x: "-100%" }}
                  animate={{ x: loading ? "100%" : "0%" }}
                  transition={{ 
                    duration: loading ? 1 : 0,
                    repeat: loading ? Infinity : 0,
                    ease: "linear"
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center">
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
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </span>
              </motion.button>
            </motion.div>

            {/* Additional Options */}
            <motion.div 
  className="text-center"
  variants={itemVariants}
>
  <Link href="/forgot-password" passHref>
    <motion.a 
      className="text-sm text-green-600 hover:text-green-800 transition duration-200 inline-block"
      whileHover={{ 
        scale: 1.05,
        x: 5,
        transition: { type: "spring", stiffness: 400 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      Forgot your password?
    </motion.a>
  </Link>
</motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="bg-gray-50 px-8 py-4 text-center"
          variants={itemVariants}
        >
          <motion.p 
            className="text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Secure login powered by advanced encryption
          </motion.p>
          <motion.p 
            className="text-xs text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Don't have an account?{' '}
            <motion.a 
              href="#" 
              className="text-green-600 hover:text-green-800 transition duration-200 font-semibold inline-block"
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.a>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;