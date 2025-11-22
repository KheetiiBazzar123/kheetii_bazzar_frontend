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
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer', // default
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email: formData.email, password: formData.password, role: formData.role });
      // Redirect will be handled by the AuthContext after login
    } catch (err: any) {
      setError(err.message || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen hero-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center mb-8 text-gray-600 transition-colors dark:text-white hover:text-emerald-600">
          <ArrowLeftIcon className="mr-2 w-5 h-5" />
          {t('login.backToHome')}
        </Link>

        {/* Login Card */}
        <div className="p-8 rounded-3xl shadow-2xl glass">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{t('login.welcomeBack')}</h1>
            <p className="text-gray-600 dark:text-white">{t('login.signInSubtitle')}</p>
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

            <div className="form-group">
              <label htmlFor="email" className="label dark:text-white">
                {t('login.emailAddress')}
              </label>
              <input
              
                type="email"
                id="email"
                name="email"

                value={formData.email}
                onChange={handleChange}
                className="input dark:text-black"
                placeholder={t('login.enterEmail')}
                required
              />
            </div>

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
                  placeholder={t('login.enterPassword')}
                  required
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
              <label htmlFor="role" className="label dark:text-white">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input dark:text-black"
                required
              >
                <option value="buyer">Buyer</option>
                <option value="farmer">Farmer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input type="checkbox" className="text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                <span className="ml-2 text-sm text-gray-600 dark:text-white">{t('login.rememberMe')}</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                {t('login.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="mr-2 w-5 h-5 spinner"></div>
                  {t('login.signingIn')}
                </div>
              ) : (
                t('login.signIn')
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="flex absolute inset-0 items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="flex relative justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">{t('login.orContinueWith')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-white">
              {t('login.noAccount')}{' '}
              <Link href="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                {t('login.signUpHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-3"
        >
          <div className="p-4 text-center rounded-xl glass">
            <CheckCircleIcon className="mx-auto mb-2 w-8 h-8 text-emerald-500" />
            <p className="text-sm text-gray-600 dark:text-white">{t('login.secureEncrypted')}</p>
          </div>
          <div className="p-4 text-center rounded-xl glass">
            <CheckCircleIcon className="mx-auto mb-2 w-8 h-8 text-emerald-500" />
            <p className="text-sm text-gray-600 dark:text-white">{t('login.blockchainVerified')}</p>
          </div>
          <div className="p-4 text-center rounded-xl glass">
            <CheckCircleIcon className="mx-auto mb-2 w-8 h-8 text-emerald-500" />
            <p className="text-sm text-gray-600 dark:text-white">{t('login.support247')}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}