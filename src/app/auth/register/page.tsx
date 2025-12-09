'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  UserIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { t } = useTranslation();

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

    const phoneDigits = formData.phone.replace(/\D/g, '');
    const zipDigits = formData.address.zip.trim();

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsNoMatch'));
      setLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      setError(t('register.invalidPhone'));
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(zipDigits)) {
      setError(t('register.invalidZip'));
      setLoading(false);
      return;
    }

    const registrationPayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role as 'farmer' | 'buyer' | 'admin',
      phone: phoneDigits.length === 10 ? `${phoneDigits}` : phoneDigits,
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        zipCode: zipDigits,
        country: formData.address.country
      }
    };

    try {
      console.log('Starting registration process...');
      await register(registrationPayload);

      console.log('Registration successful, waiting for redirect...');

      // Backup redirect mechanism in case AuthContext doesn't redirect
      // Give AuthContext 1 second to handle the redirect, then do it manually
      setTimeout(() => {
        const role = formData.role;
        console.log('Executing backup redirect for role:', role);

        if (role === 'farmer') {
          router.push('/farmer/dashboard');
        } else if (role === 'buyer') {
          router.push('/buyer/marketplace');
        } else if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1000);

    } catch (err: any) {
      console.error('Registration error:', err);

      // Extract error message from various possible error structures
      const errorMessage =
        err?.response?.data?.data?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        t('register.registrationFailed');

      setError(errorMessage);
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
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Purchase fresh produce from local farmers',
      icon: Cog6ToothIcon,
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
          {t('register.backToHome')}
        </Link>

        {/* Registration Card */}
        <div className="p-8 rounded-3xl shadow-[var(--shadow)] bg-[var(--bg-card)] border border-[var(--border)]">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-[var(--text)]">{t('register.joinKheetiiBazaar')}</h1>
            <p className="text-[var(--muted)]">{t('register.createAccountSubtitle')}</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-center label">{t('register.chooseRole')}</label>
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              {roleOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: option.value })}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${formData.role === option.value
                    ? 'border-[var(--brand)] bg-[#e8ffd4]'
                    : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--brand)]/60'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center`}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-[var(--text)]">{t(`register.${option.value}`)}</h3>
                      <p className="text-sm text-[var(--muted)]">{t(`register.${option.value}Desc`)}</p>
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
                <label htmlFor="firstName" className="label">
                  {t('register.firstName')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  placeholder={t('register.enterFirstName')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="label">
                  {t('register.lastName')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder={t('register.enterLastName')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
                <label htmlFor="email" className="label">
                  {t('register.emailAddress')}
                </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                  className="input"
                placeholder={t('register.enterEmail')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="label">
                {t('register.phoneNumber')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder={t('register.enterPhone')}
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text)]">{t('register.addressInfo')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-group">
                  <label htmlFor="address.street" className="label">
                    {t('register.streetAddress')}
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input"
                    placeholder={t('register.enterStreet')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.city" className="label">
                    {t('register.city')}
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="input"
                    placeholder={t('register.enterCity')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.state" className="label">
                    {t('register.state')}
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="input"
                    placeholder={t('register.enterState')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.zip" className="label">
                    {t('register.zipCode')}
                  </label>
                  <input
                    type="text"
                    id="address.zip"
                    name="address.zip"
                    value={formData.address.zip}
                    onChange={handleChange}
                    className="input"
                    placeholder={t('register.enterZip')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* {t('register.password')} */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="form-group">
                <label htmlFor="password" className="label">
                  {t('register.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-12 input"
                    placeholder={t('register.createPassword')}
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
                <label htmlFor="confirmPassword" className="label">
                  {t('register.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pr-12 input"
                    placeholder={t('register.confirmYourPassword')}
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
                className="mt-1 text-emerald-600 rounded border-[var(--border)] focus:ring-emerald-500"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-[var(--muted)]">
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
              className="w-full bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white rounded-xl py-3 shadow-[var(--shadow)]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="mr-2 w-5 h-5 spinner"></div>
                  {t('register.creatingAccount')}
                </div>
              ) : (
                t('register.createAccount')
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-white">
              {t('register.alreadyHaveAccount')}{' '}
              <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                {t('register.signInHere')}
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
