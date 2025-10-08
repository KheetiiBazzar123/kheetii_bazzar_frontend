'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  UserIcon,
  ShoppingCartIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: searchParams.get('role') || 'buyer',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'India'
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({
        ...formData,
        role: formData.role as 'farmer' | 'buyer',
        address: {
          ...formData.address,
          zipCode: formData.address.zip
        }
      });
      // Redirect will be handled by the AuthContext after registration
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const roleOptions = [
    {
      value: 'farmer',
      label: 'Farmer',
      description: 'Sell your produce directly to buyers',
      icon: UserIcon,
      color: 'from-green-500 to-emerald-600'
    },
    {
      value: 'buyer',
      label: 'Buyer',
      description: 'Purchase fresh produce from local farmers',
      icon: ShoppingCartIcon,
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  return (
    <div className="flex justify-center items-center p-4 min-h-screen hero-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center mb-8 text-gray-600 transition-colors dark:text-white hover:text-emerald-600">
          <ArrowLeftIcon className="mr-2 w-5 h-5" />
          Back to Home
        </Link>

        {/* Registration Card */}
        <div className="p-8 rounded-3xl shadow-2xl glass">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Join KheetiiBazaar</h1>
            <p className="text-gray-600 dark:text-white">Create your account and start your agricultural journey</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-center label dark:text-white">Choose your role</label>
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              {roleOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: option.value })}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    formData.role === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center`}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{option.label}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="form-group">
                <label htmlFor="firstName" className="label dark:text-white">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input dark:text-black"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="label dark:text-white">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input dark:text-black"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="label dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input dark:text-black"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="label dark:text-white">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input dark:text-black"
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-group">
                  <label htmlFor="address.street" className="label dark:text-white">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input dark:text-black"
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.city" className="label dark:text-white">
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="input dark:text-black"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.state" className="label dark:text-white">
                    State
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="input dark:text-black"
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.zip" className="label dark:text-white">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="address.zip"
                    name="address.zip"
                    value={formData.address.zip}
                    onChange={handleChange}
                    className="input dark:text-black"
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="form-group">
                <label htmlFor="password" className="label dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-12 input dark:text-black"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="label dark:text-white">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pr-12 input dark:text-black"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" 
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-white">
                I agree to the{' '}
                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="mr-2 w-5 h-5 spinner"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-white">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
