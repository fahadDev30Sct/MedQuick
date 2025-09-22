"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

interface ApiErrorResponse {
  message?: string;
}

const ContactSupport = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'technical'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/support/contact`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        console.log('Support request sent:', response.data);
        setSuccessMessage('Your message has been sent successfully! We\'ll get back to you within 24 hours.');
        // Clear form after success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'technical'
        });
      }
    } catch (err: unknown) {
      console.error('Contact support error:', err);

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const errorData = axiosError.response.data;

          if (status === 400) {
            setError('Please fill in all required fields correctly.');
          } else if (status >= 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(errorData?.message || 'Failed to send your message.');
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

  // Animation variants (same as forgot password page)
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

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Phone Support",
      description: "+1 (555) 123-4567",
      subtitle: "Mon-Fri, 9AM-6PM EST"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Support",
      description: "support@medquick.com",
      subtitle: "24/7 Response within 24 hours"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Live Chat",
      description: "Available on website",
      subtitle: "Real-time support"
    }
  ];

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10"
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
                MedQuick Support
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
              Contact Our Support Team
            </motion.h2>
            
            <motion.p 
              className="text-green-100 text-sm max-w-2xl"
              variants={itemVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              We're here to help you! Get in touch with our support team for any questions or issues you may have.
            </motion.p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Contact Information */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
          >
            <motion.h3 
              className="text-2xl font-bold text-green-800"
              variants={itemVariants}
            >
              Get in Touch
            </motion.h3>
            
            <motion.p 
              className="text-gray-600"
              variants={itemVariants}
            >
              Our dedicated support team is ready to assist you with any questions or concerns about MedQuick.
            </motion.p>

            {/* Contact Methods */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-100"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">{method.title}</h4>
                    <p className="text-green-700 font-medium">{method.description}</p>
                    <p className="text-sm text-green-600">{method.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div 
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              variants={itemVariants}
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Emergency Support</p>
                  <p className="text-sm text-blue-600">
                    For urgent medical issues, please contact emergency services immediately.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
          >
            <motion.h3 
              className="text-2xl font-bold text-green-800"
              variants={itemVariants}
            >
              Send us a Message
            </motion.h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-sm font-semibold text-green-800 mb-2">
                  Full Name *
                </label>
                <motion.div
                  variants={inputFocusVariants}
                  initial="initial"
                  whileFocus="focused"
                >
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none transition duration-200 text-gray-700 placeholder-gray-400"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </motion.div>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-semibold text-green-800 mb-2">
                  Email Address *
                </label>
                <motion.div
                  variants={inputFocusVariants}
                  initial="initial"
                  whileFocus="focused"
                >
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none transition duration-200 text-gray-700 placeholder-gray-400"
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </motion.div>
              </motion.div>

              {/* Category Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="category" className="block text-sm font-semibold text-green-800 mb-2">
                  Issue Category *
                </label>
                <motion.div
                  variants={inputFocusVariants}
                  initial="initial"
                  whileFocus="focused"
                >
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none transition duration-200 text-gray-700 bg-white"
                    disabled={loading}
                  >
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Issue</option>
                    <option value="account">Account Help</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>
              </motion.div>

              {/* Subject Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="subject" className="block text-sm font-semibold text-green-800 mb-2">
                  Subject *
                </label>
                <motion.div
                  variants={inputFocusVariants}
                  initial="initial"
                  whileFocus="focused"
                >
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none transition duration-200 text-gray-700 placeholder-gray-400"
                    placeholder="Brief description of your issue"
                    disabled={loading}
                  />
                </motion.div>
              </motion.div>

              {/* Message Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="message" className="block text-sm font-semibold text-green-800 mb-2">
                  Message *
                </label>
                <motion.div
                  variants={inputFocusVariants}
                  initial="initial"
                  whileFocus="focused"
                >
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none transition duration-200 text-gray-700 placeholder-gray-400 resize-none"
                    placeholder="Please describe your issue in detail..."
                    disabled={loading}
                  />
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
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <motion.p 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              © 2024 MedQuick. All rights reserved.
            </motion.p>
            
            <div className="flex space-x-4">
              <Link href="/" className="text-sm text-green-600 hover:text-green-800 transition duration-200">
                <motion.span 
                  className="inline-block"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Home
                </motion.span>
              </Link>
              
             
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ContactSupport;