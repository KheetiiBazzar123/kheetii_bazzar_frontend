'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';

// Outline icons
import {
  ShoppingCartIcon,
  TruckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon,
  StarIcon,
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/24/outline';

// Solid icons (import only ones we actually use as solid)
import { TruckIcon as TruckSolidIcon, ShieldCheckIcon as ShieldSolidIcon } from '@heroicons/react/24/solid';

/**
 * Cleaned HomePage
 * - Standardized imports (outline / solid)
 * - Fixed API handling (safe checks) and provided a local static fallback dataset
 * - Header/button overflow fixes (tailwind utilities)
 * - Improved accessibility and motion usage
 * - Fully responsive
 */
export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const isDark = theme === 'dark';

  // Static sample data (hard images, no backend fetch) — good for hero and category images
  // Replace or extend these with your production data when ready
  const staticProducts: Product[] = [
    {
      _id: 'p1',
      name: 'Organic Mangoes (Aam) - Alphonso',
      description: 'Sweet, juicy Alphonso mangoes from Ratnagiri.',
      price: 249,
      images: ['https://images.unsplash.com/photo-1574226516831-e292f6a12f7b?auto=format&fit=crop&w=800&q=80'],
      category: 'Fruits',
      unit: 'kg',
      isAvailable: true,
      rating: 4.9,
      address: { city: 'Ratnagiri', state: 'Maharashtra' },
    },
    {
      _id: 'p2',
      name: 'Fresh Spinach (Palak)',
      description: 'Local organic spinach, hand-picked daily.',
      price: 32,
      images: ['https://images.unsplash.com/photo-1547516508-4acb1b6a43c6?auto=format&fit=crop&w=800&q=80'],
      category: 'Vegetables',
      unit: 'bunch',
      isAvailable: true,
      rating: 4.7,
      address: { city: 'Kolkata', state: 'West Bengal' },
    },
    {
      _id: 'p3',
      name: 'Organic Tomatoes',
      description: 'Vine-ripened tomatoes with full flavor.',
      price: 48,
      images: ['https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80'],
      category: 'Vegetables',
      unit: 'kg',
      isAvailable: true,
      rating: 4.6,
      address: { city: 'Bengaluru', state: 'Karnataka' },
    },
    {
      _id: 'p4',
      name: 'Indian Red Onion',
      description: 'Harvest-fresh red onions with long shelf life.',
      price: 28,
      images: ['https://images.unsplash.com/photo-1580910051075-6c9b9b2b4f3f?auto=format&fit=crop&w=800&q=80'],
      category: 'Vegetables',
      unit: 'kg',
      isAvailable: true,
      rating: 4.5,
      address: { city: 'Pune', state: 'Maharashtra' },
    },
  ];

  const indianFarmerImages = [
    'https://images.unsplash.com/photo-1590608897129-79c6f1b9b0e7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1484980851622-3e4e71712b38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  ];

  // Effects
  useEffect(() => {
    // Redirect logged-in users to their dashboards
    if (!loading && user) {
      if (user.role === 'farmer') router.push('/farmer/dashboard');
      else if (user.role === 'buyer') router.push('/buyer/marketplace');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Populate products from static fallback. If you want to fetch from API, uncomment and handle properly.
    setProductsLoading(true);
    (async () => {
      try {
        // --- STATIC FALLBACK (preferred for landing page hero & demo) ---
        setProducts(staticProducts);

        // --- OPTIONAL: fetch from backend as fallback (uncomment if needed) ---
        // const response = await apiClient.getProducts({ limit: 12 });
        // if (response?.data && Array.isArray(response.data)) setProducts(response.data);
      } catch (err: any) {
        setProductsError(err?.message || 'Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Categories: attempt backend, fallback to static
    setCategoriesLoading(true);
    (async () => {
      try {
        // Optional: fetch from backend
        // const res = await apiClient.getCategories();
        // if (res?.data?.categoryCounts) {
        //   setCategories(res.data.categoryCounts.map((c) => ({ name: c.category, count: c.count })));
        //   return;
        // }

        // Static fallback categories with representative counts
        setCategories([
          { name: 'Vegetables', count: 120 },
          { name: 'Fruits', count: 88 },
          { name: 'Herbs', count: 24 },
          { name: 'Grains', count: 36 },
          { name: 'Dairy', count: 12 },
          { name: 'Organic', count: 42 },
        ]);
      } catch {
        // fail silently
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16" aria-hidden />
      </div>
    );
  }

  // Derived data
  const featuredProducts = products.slice(0, 4);
  const heroGridImages = staticProducts.map((p) => p.images[0]).slice(0, 4);
  const categoryVisuals = [
    { name: 'Vegetables', count: 120, image: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=800&q=80' },
    { name: 'Fruits', count: 88, image: 'https://images.unsplash.com/photo-1574226516831-e292f6a12f7b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Herbs', count: 42, image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80' },
    { name: 'Grains', count: 36, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Dairy', count: 22, image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80' },
    { name: 'Organic', count: 64, image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80' },
  ];
  const formatPrice = (price?: number) =>
    typeof price === 'number'
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)
      : '—';

  const getProductImage = (p?: Product, idx = 0) => p?.images?.[0] || staticProducts[idx % staticProducts.length].images[0];

  // Button styles adjusted to prevent overflow and wrap
  const primaryCta = 'inline-flex items-center justify-center rounded-2xl px-6 py-2 text-sm font-semibold transition-all duration-200 shadow-md whitespace-nowrap';
  const secondaryCta = 'inline-flex items-center justify-center rounded-2xl px-6 py-2 text-sm font-semibold transition-all duration-200 border whitespace-nowrap';

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 20% 20%, rgba(30,41,59,0.7), transparent 35%), radial-gradient(circle at 90% 10%, rgba(16,185,129,0.28), transparent 45%), #071024'
          : 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.85), transparent 35%), radial-gradient(circle at 85% 15%, rgba(27,184,93,0.18), transparent 45%), #f8fafc',
      }}
    >
      {/* Navigation */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="sticky top-4 z-50"
        aria-label="Primary Navigation"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center w-full gap-3 sm:gap-5 rounded-[28px] px-3 sm:px-5 py-2 shadow-xl border backdrop-blur-md leading-tight ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white/95 border-white/70 text-[#0f172a]'
            }`}
          >
            <Link href="/" className="flex items-center gap-3 shrink-0 whitespace-nowrap">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" aria-hidden />
              </div>
              <h1 className="text-lg sm:text-xl font-bold truncate">KheetiiBazaar</h1>
            </Link>

            <nav className="hidden lg:flex flex-1 flex-nowrap items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base font-semibold mx-auto whitespace-nowrap" aria-label="Main links">
              <a href="#how-it-works" className="nav-link whitespace-nowrap inline-flex items-center">{t('landing.navHowItWorks', 'How it works')}</a>
              <a href="#products" className="nav-link whitespace-nowrap inline-flex items-center">{t('landing.navProducts', 'Products')}</a>
              <a href="#categories" className="nav-link whitespace-nowrap inline-flex items-center">{t('landing.navCategories', 'Categories')}</a>
              <a href="#farmers" className="nav-link whitespace-nowrap inline-flex items-center">{t('landing.navFarmers', 'Farmers')}</a>
              <a href="#testimonials" className="nav-link whitespace-nowrap inline-flex items-center">{t('landing.navStories', 'Stories')}</a>
            </nav>

            <div className="hidden md:flex items-center gap-2 sm:gap-3 ml-auto whitespace-nowrap">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-full"
                aria-label="Toggle theme"
              >
                {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>

              {user && <NotificationCenter />}

              {user ? (
                <Link href={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace'} className="shrink-0">
                  <Button className="btn-primary text-sm lg:text-base whitespace-nowrap">
                    {user.role === 'farmer' ? 'Dashboard' : 'Marketplace'}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="shrink-0">
                    <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('landing.login', 'Login')}</Button>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="shrink-0 inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition whitespace-nowrap"
                  >
                    {t('landing.startYourJourney', 'Start Your Journey')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2 rounded-full" aria-label="Toggle theme">
                {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>

              {user && <NotificationCenter />}

              <button
                onClick={() => setMobileMenuOpen((s) => !s)}
                className={`p-2 rounded-full border ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2"
            >
              <div className={`${isDark ? 'bg-slate-900/90 border border-slate-800 text-white' : 'bg-white/95 border border-white/70 text-slate-800'} rounded-xl p-4 shadow-lg backdrop-blur`}>
                <div className="grid grid-cols-2 gap-2">
                  <a href="#how-it-works" className="nav-link text-sm" onClick={() => setMobileMenuOpen(false)}>{t('landing.navHowItWorks', 'How it works')}</a>
                  <a href="#products" className="nav-link text-sm" onClick={() => setMobileMenuOpen(false)}>{t('landing.navProducts', 'Products')}</a>
                  <a href="#categories" className="nav-link text-sm" onClick={() => setMobileMenuOpen(false)}>{t('landing.navCategories', 'Categories')}</a>
                  <a href="#farmers" className="nav-link text-sm" onClick={() => setMobileMenuOpen(false)}>{t('landing.navFarmers', 'Farmers')}</a>
                  <a href="#testimonials" className="nav-link text-sm" onClick={() => setMobileMenuOpen(false)}>{t('landing.navStories', 'Stories')}</a>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <LanguageSwitcher />

                  {user ? (
                    <Link href={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace'}>
                      <Button className="w-full">{user.role === 'farmer' ? 'Farmer Dashboard' : 'Marketplace'}</Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login"><Button className="w-full">{t('landing.login', 'Login')}</Button></Link>
                      <Link href="/auth/register"><Button className="w-full">{t('landing.startYourJourney', 'Get Started')}</Button></Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero */}
        <section className="pt-16 lg:pt-20" id="hero">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <motion.div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-sm border ${
                  isDark ? 'bg-slate-800/60 border-slate-700 text-emerald-200' : 'bg-white border-white/70 text-[#1bb85d]'
                }`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                ● {t('landing.heroBadge', 'Farm Fresh Produce')}
              </motion.div>

              <motion.h1
                className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t('landing.heroTitle', 'Fresh from the')}{' '}
                <span className="text-[#1bb85d]">{t('landing.heroAccent1', 'Farm')}</span>{' '}
                {t('landing.heroTitleTail', 'to Your')}{' '}
                <span className="text-[#1bb85d]">{t('landing.heroAccent2', 'Table')}</span>
              </motion.h1>

              <p className={`text-base sm:text-lg max-w-xl ${isDark ? 'text-slate-300' : 'text-[#374151]'}`}>
                {t(
                  'landing.heroSubtitle',
                  'Connect directly with local farmers and get the freshest organic produce delivered to your doorstep. No middlemen, just pure farm goodness.'
                )}
              </p>

              {!user && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/buyer/marketplace"
                    className={`${primaryCta} bg-[#1bb85d] text-white rounded-full inline-flex items-center`}
                  >
                    {t('landing.heroStartShopping', 'Start Shopping')}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Link>

                  <Link
                    href="/auth/register?role=farmer"
                    className={`${secondaryCta} ${isDark ? 'border-[#9ef18b] text-[#9ef18b] bg-slate-800' : 'border-[#1bb85d] text-[#1bb85d] bg-white'}`}
                  >
                    {t('landing.heroBecomeFarmer', 'Become a Farmer')}
                  </Link>
                </div>
              )}

              <div className={`flex flex-wrap gap-6 pt-2 text-sm ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-[#1bb85d]" />
                  <span>{t('landing.heroOrganic', '100% Organic')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TruckIcon className="h-5 w-5 text-[#1bb85d]" />
                  <span>{t('landing.heroFastDelivery', 'Fast Delivery')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldSolidIcon className="h-5 w-5 text-[#1bb85d]" />
                  <span>{t('landing.heroQualityAssured', 'Quality Assured')}</span>
                </div>
              </div>
            </div>

            {/* Hero image grid */}
            <div className="grid grid-cols-2 gap-4">
              {heroGridImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  className={`aspect-square rounded-xl overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-white/90 border border-white/60'}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.015 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                >
                  <img src={img} alt={`hero-grid-${idx}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mt-16">
          <div className="text-center space-y-2 mb-10">
            <p className="text-sm font-semibold text-[#1bb85d]">{t('landing.howItWorks', 'How it works')}</p>
            <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{t('landing.howTitle', 'Farm to table in four steps')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-[#6b7280]'}`}>{t('landing.howSubtitle', 'No middlemen — just fresh produce and clear steps.')}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: 1,
                title: t('landing.howStep1Title', 'Farmers Grow'),
                desc: t('landing.howStep1Desc', 'Local farmers grow fresh, organic produce.'),
                icon: ShieldSolidIcon,
              },
              {
                step: 2,
                title: t('landing.howStep2Title', 'List on Marketplace'),
                desc: t('landing.howStep2Desc', 'Farmers list products with real-time inventory.'),
                icon: HomeIcon,
              },
              {
                step: 3,
                title: t('landing.howStep3Title', 'You Order'),
                desc: t('landing.howStep3Desc', 'Browse, favorite, and place orders in seconds.'),
                icon: ShoppingBagIcon,
              },
              {
                step: 4,
                title: t('landing.howStep4Title', 'We Deliver'),
                desc: t('landing.howStep4Desc', 'Fresh produce delivered to your doorstep.'),
                icon: TruckSolidIcon,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={title} className={`rounded-xl border p-4 relative ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/90 border-white/60'}`}>
                <div className="absolute -top-3 left-4 w-8 h-8 rounded-full bg-[#1bb85d] text-white text-sm font-semibold flex items-center justify-center shadow-sm">{step}</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0ffe0] flex items-center justify-center"><Icon className="h-5 w-5 text-[#1bb85d]" /></div>
                  <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
                </div>
                <p className="text-xs text-[#475569] mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Products */}
        <section className="mt-20" id="products">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{t('landing.popularProducts', 'Popular Products')}</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-[#556d4a]'}`}>{t('landing.popularProductsDesc', 'Discover our most loved fresh produce, handpicked by our community.')}</p>
            </div>
            <Link href="/buyer/marketplace" className="text-sm font-semibold text-[#1bb85d] flex items-center">{t('landing.viewAllProducts', 'View all products')} <ArrowRightIcon className="h-4 w-4 ml-1" /></Link>
          </div>

          {productsError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{productsError}</div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {productsLoading && Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-64 bg-white/70 rounded-xl border shadow animate-pulse" />
            ))}

            {!productsLoading && featuredProducts.map((product, idx) => (
              <motion.article
                key={product._id}
                className={`rounded-xl border overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/90 border-white/60'}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={getProductImage(product, idx)} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur">{formatPrice(product.price)}</div>
                  {product.category && <div className="absolute top-2 right-2 bg-white/80 text-xs px-2 py-1 rounded-full">{product.category}</div>}
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{product.name}</p>
                      <p className="text-xs text-[#6b7280]">{(product.unit || 'kg') + (product.category ? ` • ${product.category}` : '')}</p>
                    </div>

                    <Link href="/buyer/marketplace" className="flex-shrink-0">
                      <button className="w-9 h-9 rounded-full bg-[#e8ffd4] border border-[#c9f4a0] flex items-center justify-center hover:scale-105 transition" aria-label={`Add ${product.name} to cart`}>
                        <ShoppingCartIcon className="h-4 w-4 text-[#1bb85d]" />
                      </button>
                    </Link>
                  </div>

                  <p className="text-base font-bold">{formatPrice(product.price)}</p>
                  <p className="text-xs text-[#6b7280] line-clamp-2">{product.description}</p>

                  {product.address?.city && (
                    <p className="text-xs text-[#6b7280]">{product.address.city}{product.address.state ? `, ${product.address.state}` : ''}</p>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className={`px-2 py-1 rounded-full ${product.isAvailable === false ? 'bg-red-100 text-red-700' : 'bg-[#e8ffd4] text-[#0f172a]'}`}>
                      {product.isAvailable === false ? t('landing.unavailable', 'Unavailable') : t('landing.available', 'Available')}
                    </span>
                    {product.rating && (
                      <span className="flex items-center gap-1 text-[#6b7280]"><StarIcon className="h-4 w-4 text-[#f59e0b]" /> <span>{product.rating.toFixed(1)}</span></span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-20" id="categories">
          <div className="text-center space-y-2 mb-8">
            <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{t('landing.browseByCategory', 'Browse by Category')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-[#6b7280]'}`}>{t('landing.browseByCategorySubtitle', "Find exactly what you're looking for with our organized categories.")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesLoading && Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-32 bg-white/80 rounded-2xl border animate-pulse shadow-md" />
            ))}

            {!categoriesLoading && (categories.length ? categories : categoryVisuals).slice(0, 6).map((cat, idx) => {
              const image = (cat as any).image || categoryVisuals[idx % categoryVisuals.length].image;
              const count = cat.count || categoryVisuals[idx % categoryVisuals.length].count || t('landing.newItems', 'New items');
              return (
                <div
                  key={cat.name}
                  className={`relative overflow-hidden rounded-2xl border shadow-lg group transition-all duration-200 ${
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/95 border-white/70'
                  }`}
                >
                  <div className="h-24">
                    <img src={image} alt={cat.name} className="w-full h-full object-cover transition duration-200 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
                  </div>
                  <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-emerald-400/60 transition" />
                  <div className="relative p-3 text-left">
                    <p className="text-sm font-semibold text-white drop-shadow">{cat.name}</p>
                    <p className="text-xs text-white/80">{typeof count === 'number' ? `${count} items` : count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Farmers */}
        <section id="farmers" className="mt-14 bg-white/90 border border-white/60 rounded-xl p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a]">{t('landing.meetFarmers', 'Meet our farmers')}</h3>
              <p className="text-sm text-[#556d4a]">{t('landing.meetFarmersSubtitle', 'Know the people who grow your food.')}</p>
            </div>
            <Link href="/buyer/marketplace" className="text-sm font-semibold text-[#1bb85d] flex items-center">
              {t('landing.viewMarketplace', 'View marketplace')} <ArrowLongRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <article key={i} className="rounded-xl border p-4 bg-white/95">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f0ffe0] flex items-center justify-center">
                      <img src={indianFarmerImages[i % indianFarmerImages.length]} alt={`Farmer ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0f172a]">{['Ramesh Verma','Sunita Desai','Anil Yadav'][i]}</p>
                      <p className="text-xs text-[#556d4a]">{['Punjab','Maharashtra','Uttar Pradesh'][i]}</p>
                    </div>
                  </div>
                  <ShieldSolidIcon className="h-5 w-5 text-[#1bb85d]" />
                </div>

                <div className="flex items-center justify-between text-xs text-[#556d4a]">
                  <span className="flex items-center gap-1"><StarIcon className="h-4 w-4 text-[#f59e0b]" /> <span>{['4.9','4.8','4.7'][i]}</span></span>
                  <span>{t('landing.productsCount', { count: [8, 15, 12][i] })}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="mt-14">
          <div className="text-center space-y-2 mb-8">
            <p className="text-sm font-semibold text-[#1bb85d]">{t('landing.customerLove', 'Customer love')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">{t('landing.customerSayTitle', 'What our customers say')}</h2>
            <p className="text-sm text-[#556d4a]">{t('landing.customerSaySubtitle', 'Join thousands of happy customers who switched to fresh, locally sourced produce.')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                quote: t('landing.testimonial1Quote', 'The freshness and taste are outstanding. Everything arrives home with trust!'),
                name: t('landing.testimonial1Name', 'Neha Sharma'),
                title: t('landing.testimonial1Title', 'Home Chef, Delhi'),
                rating: 5,
                image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
              },
              {
                quote: t('landing.testimonial2Quote', 'I can buy directly from farmers for my restaurant. Quality and delivery are both excellent.'),
                name: t('landing.testimonial2Name', 'Rahul Mehta'),
                title: t('landing.testimonial2Title', 'Restaurant Owner, Mumbai'),
                rating: 5,
                image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
              },
              {
                quote: t('landing.testimonial3Quote', 'The easiest way to eat healthy. On-time delivery and super fresh products.'),
                name: t('landing.testimonial3Name', 'Pooja Nair'),
                title: t('landing.testimonial3Title', 'Health Enthusiast, Bengaluru'),
                rating: 5,
                image: 'https://images.unsplash.com/photo-1502764613149-7f1d229e2305?auto=format&fit=crop&w=600&q=80',
              },
            ].map((item) => (
              <article key={item.name} className="bg-white/95 border rounded-xl p-5 flex flex-col h-full">
                <div className="flex items-start gap-3">
                  <img src={item.image} alt={`${item.name} avatar`} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-[#556d4a]">{item.title}</p>
                  </div>
                </div>

                <p className="text-sm text-[#0f172a] leading-relaxed mt-4 flex-1">“{item.quote}”</p>

                <div className="mt-4 flex items-center gap-2">
                  {Array.from({ length: item.rating }).map((_, idx) => <StarIcon key={idx} className="h-4 w-4 text-[#f59e0b]" />)}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14">
          <div className={`rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'bg-emerald-800 text-white' : 'bg-[#1bb85d] text-white'}`}>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">{t('landing.ctaTitle', 'Ready to taste the difference?')}</h3>
              <p className="text-sm text-white/90 mt-2">{t('landing.ctaSubtitle', 'Start shopping fresh, locally sourced produce today.')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/buyer/marketplace"><Button className="bg-white text-[#0f172a] hover:bg-white/90 rounded-2xl px-6 py-2">{t('landing.ctaShop', 'Shop now')}</Button></Link>
              <Link href="/auth/register?role=farmer"><Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-2xl px-6 py-2">{t('landing.ctaFarmer', 'Become a farmer')}</Button></Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 border-t border-white/60 backdrop-blur-md mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a]">KheetiiBazaar</h3>
              </div>
              <p className="text-sm text-[#556d4a]">{t('landing.smartMarketplace')} • {t('landing.blockchainSecurity')} • {t('landing.multiLanguage')}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#0f172a] mb-3">{t('landing.forFarmers')}</h4>
              <ul className="space-y-2 text-sm text-[#556d4a]">
                <li>{t('landing.sellProduce')}</li>
                <li>{t('landing.trackOrders')}</li>
                <li>{t('landing.manageInventory')}</li>
                <li>{t('landing.viewAnalytics')}</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#0f172a] mb-3">{t('landing.forBuyers')}</h4>
              <ul className="space-y-2 text-sm text-[#556d4a]">
                <li>{t('landing.browseProducts')}</li>
                <li>{t('landing.placeOrders')}</li>
                <li>{t('landing.trackDeliveries')}</li>
                <li>{t('landing.rateProducts')}</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#0f172a] mb-3">{t('landing.support')}</h4>
              <ul className="space-y-2 text-sm text-[#556d4a]">
                <li>{t('landing.helpCenter')}</li>
                <li>{t('landing.contactUs')}</li>
                <li>{t('landing.privacyPolicy')}</li>
                <li>{t('landing.termsOfService')}</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 text-sm text-[#556d4a]">{t('landing.copyright')}</div>
        </div>
      </footer>
    </div>
  );
}
