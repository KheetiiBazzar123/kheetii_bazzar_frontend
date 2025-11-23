'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  MapPinIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const categories = [
    { id: 'all', name: t('productsPage.categories.all'), count: 156 },
    { id: 'vegetables', name: t('productsPage.categories.vegetables'), count: 45 },
    { id: 'fruits', name: t('productsPage.categories.fruits'), count: 32 },
    { id: 'grains', name: t('productsPage.categories.grains'), count: 28 },
    { id: 'spices', name: t('productsPage.categories.spices'), count: 23 },
    { id: 'dairy', name: t('productsPage.categories.dairy'), count: 18 },
    { id: 'organic', name: t('productsPage.categories.organic'), count: 10 }
  ];

  const sortOptions = [
    { value: 'newest', label: t('productsPage.sort.newest') },
    { value: 'price-low', label: t('productsPage.sort.priceLowHigh') },
    { value: 'price-high', label: t('productsPage.sort.priceHighLow') },
    { value: 'rating', label: t('productsPage.sort.rating') },
    { value: 'popular', label: t('productsPage.sort.popular') }
  ];

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts({
          page: 1,
          limit: 50,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          organic: organicOnly,
        });
        
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          console.error('Failed to load products:', response.message);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, searchQuery, priceRange, organicOnly]);

  // Mock products data for fallback
  useEffect(() => {
    if (products.length === 0) {
      setProducts([
      {
        id: 1,
        name: 'Fresh Organic Tomatoes',
        farmer: 'Rajesh Kumar',
        price: 120,
        originalPrice: 150,
        rating: 4.8,
        reviews: 124,
        image: '/api/placeholder/300/200',
        category: 'vegetables',
        organic: true,
        location: 'Punjab',
        distance: '2.5 km',
        stock: 25,
        description: 'Fresh, organic tomatoes grown without pesticides. Perfect for salads and cooking.',
        features: ['Organic', 'Fresh', 'Local']
      },
      {
        id: 2,
        name: 'Sweet Mangoes',
        farmer: 'Priya Sharma',
        price: 200,
        originalPrice: 250,
        rating: 4.9,
        reviews: 89,
        image: '/api/placeholder/300/200',
        category: 'fruits',
        organic: false,
        location: 'Uttar Pradesh',
        distance: '5.2 km',
        stock: 15,
        description: 'Sweet and juicy mangoes, perfect for desserts and smoothies.',
        features: ['Sweet', 'Juicy', 'Fresh']
      },
      {
        id: 3,
        name: 'Basmati Rice',
        farmer: 'Amit Singh',
        price: 180,
        originalPrice: 200,
        rating: 4.7,
        reviews: 67,
        image: '/api/placeholder/300/200',
        category: 'grains',
        organic: true,
        location: 'Haryana',
        distance: '8.1 km',
        stock: 50,
        description: 'Premium quality basmati rice, aged for perfect texture and aroma.',
        features: ['Premium', 'Aged', 'Aromatic']
      },
      {
        id: 4,
        name: 'Fresh Carrots',
        farmer: 'Sunita Devi',
        price: 80,
        originalPrice: 100,
        rating: 4.6,
        reviews: 45,
        image: '/api/placeholder/300/200',
        category: 'vegetables',
        organic: true,
        location: 'Delhi',
        distance: '1.8 km',
        stock: 30,
        description: 'Crisp and fresh carrots, rich in vitamins and minerals.',
        features: ['Organic', 'Crisp', 'Nutritious']
      },
      {
        id: 5,
        name: 'Turmeric Powder',
        farmer: 'Vikram Patel',
        price: 150,
        originalPrice: 180,
        rating: 4.9,
        reviews: 156,
        image: '/api/placeholder/300/200',
        category: 'spices',
        organic: true,
        location: 'Gujarat',
        distance: '12.3 km',
        stock: 20,
        description: 'Pure turmeric powder with medicinal properties, ground fresh.',
        features: ['Pure', 'Medicinal', 'Fresh']
      },
      {
        id: 6,
        name: 'Fresh Milk',
        farmer: 'Dairy Farm Co.',
        price: 60,
        originalPrice: 70,
        rating: 4.5,
        reviews: 78,
        image: '/api/placeholder/300/200',
        category: 'dairy',
        organic: false,
        location: 'Punjab',
        distance: '3.7 km',
        stock: 40,
        description: 'Fresh cow milk, delivered daily from local dairy farms.',
        features: ['Fresh', 'Daily Delivery', 'Pure']
      }
    ]);
    }
  }, [products.length]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const toggleWishlist = (productId: any) => {
    // Implement wishlist functionality
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <div className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">{t('productsPage.title')}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {t('productsPage.cart')} ({cart.length})
              </Button>
              <Button variant="ghost" size="sm">
                {t('productsPage.dashboard')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('productsPage.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 input"
              />
            </div>
            
            {/* Filter Button */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="lg:hidden"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {t('productsPage.filters')}
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Sort and Results */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {t('productsPage.showing', { count: filteredProducts.length })}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('productsPage.filters')}</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{t('productsPage.priceRange')}</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{t('productsPage.features')}</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="ml-2 text-sm text-gray-600">{t('productsPage.organic')}</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="ml-2 text-sm text-gray-600">{t('productsPage.local')}</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="ml-2 text-sm text-gray-600">{t('productsPage.fresh')}</span>
                  </label>
                </div>
              </div>

              <Button className="w-full btn-primary">
                {t('productsPage.applyFilters')}
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="product-card"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-card-image"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {product.organic && (
                        <span className="badge badge-success text-xs">{t('productsPage.organic')}</span>
                      )}
                      {product.originalPrice > product.price && (
                        <span className="badge badge-error text-xs">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% {t('productsPage.off')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                      >
                        <HeartIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-amber-400 mr-1" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                        <span className="text-sm text-gray-400 ml-1">({product.reviews})</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{t('productsPage.by')} {product.farmer}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{product.location} • {product.distance}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.features.map((feature: any, idx: number) => (
                        <span key={idx} className="badge badge-info text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-emerald-600">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{product.stock} {t('productsPage.inStock')}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => addToCart(product)}
                        className="flex-1 btn-primary"
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                        {t('productsPage.addToCart')}
                      </Button>
                      <Button variant="outline" className="px-3">
                        <HeartIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('productsPage.noProductsFound')}</h3>
                <p className="text-gray-600 mb-4">{t('productsPage.tryAdjusting')}</p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange([0, 1000]);
                }}>
                  {t('productsPage.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
