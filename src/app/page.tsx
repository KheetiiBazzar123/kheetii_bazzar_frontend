'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationCenter from '@/components/NotificationCenter';
import LanguageSwitcher from '@/components/LanguageSwitcher';

import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Redirect logged-in users to their appropriate dashboard
    if (user && !loading) {
      if (user.role === 'farmer') {
        window.location.href = '/farmer/dashboard';
      } else if (user.role === 'buyer') {
        window.location.href = '/buyer/marketplace';
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  const features = [
    {
      icon: ShoppingCartIcon,
      title: t('landing.smartMarketplace'),
      description: t('landing.smartMarketplaceDesc'),
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: TruckIcon,
      title: t('landing.lightningDelivery'),
      description: t('landing.lightningDeliveryDesc'),
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: ShieldCheckIcon,
      title: t('landing.blockchainSecurity'),
      description: t('landing.blockchainSecurityDesc'),
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: ChartBarIcon,
      title: t('landing.analyticsDashboard'),
      description: t('landing.analyticsDashboardDesc'),
      color: "from-orange-500 to-red-600"
    },
    {
      icon: GlobeAltIcon,
      title: t('landing.multiLanguage'),
      description: t('landing.multiLanguageDesc'),
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: UserGroupIcon,
      title: t('landing.communityDriven'),
      description: t('landing.communityDrivenDesc'),
      color: "from-green-500 to-emerald-600"
    }
  ];

  const stats = [
    { label: t('landing.activeFarmers'), value: "2,500+", icon: UserGroupIcon },
    { label: t('landing.productsListed'), value: "15,000+", icon: ShoppingCartIcon },
    { label: t('landing.ordersDelivered'), value: "50,000+", icon: TruckIcon },
    { label: t('landing.customerRating'), value: "4.9/5", icon: StarIcon }
  ];

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="glass sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                KheetiiBazaar
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              {user && <NotificationCenter />}

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Welcome back, <span className="font-semibold text-emerald-600">{user.firstName}!</span>
                  </div>
                  <Link href={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace'}>
                    <Button className="btn-primary">
                      {user.role === 'farmer' ? 'Farmer Dashboard' : 'Marketplace'}
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="btn-primary">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">{t('landing.title')}</span>
              <br />
              <span className="text-gray-900">{t('landing.titleSecond')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Connect directly with local farmers, enjoy blockchain-verified transactions,
              and experience the future of sustainable agriculture marketplace.
            </p>

            {!user && (
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link href="/auth/register?role=farmer">
                  <Button size="lg" className="btn-primary text-lg px-8 py-4">
                    {t('landing.imFarmer')}
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/register?role=buyer">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    {t('landing.imBuyer')}
                    <ShoppingCartIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>

                {/* admin  */}
                <Link href="/auth/register?role=admin">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    I'm a Admin
                    <Cog6ToothIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="stat-card text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('landing.whyChoose')} <span className="gradient-text">{t('landing.kheetiiBazaar')}</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of agricultural marketplace with cutting-edge technology
              and farmer-first approach.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass text-center p-12 rounded-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('landing.readyToTransform')}
              <span className="gradient-text"> {t('landing.agriculturalJourney')}</span>?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers and buyers who are already experiencing
              the future of sustainable agriculture.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="btn-primary text-lg px-8 py-4">
                    {t('landing.startYourJourney')}
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    {t('landing.exploreProducts')}
                    <ShoppingCartIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">KheetiiBazaar</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting farmers and buyers with blockchain verification for a transparent,
                sustainable agricultural marketplace.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">{t('landing.forFarmers')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.sellProduce')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.trackOrders')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.manageInventory')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.viewAnalytics')}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">{t('landing.forBuyers')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.browseProducts')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.placeOrders')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.trackDeliveries')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  <span>{t('landing.rateProducts')}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">{t('landing.support')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li>{t('landing.helpCenter')}</li>
                <li>{t('landing.contactUs')}</li>
                <li>{t('landing.privacyPolicy')}</li>
                <li>{t('landing.termsOfService')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>{t('landing.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}