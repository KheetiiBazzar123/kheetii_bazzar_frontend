'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import showToast from '@/lib/toast';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';


// interface Product {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   images: string[];
//   rating: number;
//   reviewCount: number;
//   freshness: 'fresh' | 'good' | 'average';
//   category: string;
//   farmer: {
//     firstName: string;
//     lastName: string;
//     location: {
//       city: string;
//       state: string;
//     };
//   };
//   isAvailable: boolean;
//   quantity: number;
//   unit: string;
//   harvestDate: string;
//   tags: string[];
// }

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  images: string[];
  freshness: 'fresh' | 'good' | 'average';
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  harvestDate: string;
  expiryDate: string;
  averageRating: number;
  tags: string[];
  reviews: any[];
  createdAt: string;
  updatedAt: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    street: string;
    zipCode: string;
  };
}


interface FilterOptions {
  category: string;
  minPrice: string;
  maxPrice: string;
  freshness: string;
  rating: string;
  search: string;
}

function BuyerMarketplace() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    minPrice: '',
    maxPrice: '',
    freshness: '',
    rating: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const categories = [
    'vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'poultry', 'seafood', 'other'
  ];

  const freshnessOptions = [
    { value: 'fresh', label: 'Fresh', color: 'text-green-600' },
    { value: 'good', label: 'Good', color: 'text-yellow-600' },
    { value: 'average', label: 'Average', color: 'text-orange-600' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);
  const fetchProducts = async () => {
    try {
      const params = {
        page: 1,
        limit: 50,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) =>
            value !== '' && value !== null && value !== undefined
          )
        ),
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        rating: filters.rating ? parseInt(filters.rating) : undefined,
      };

      const response = await apiService.getMarketplaceProducts(params);

      console.log("API Raw Response:", response);

      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.warn("No product data found in response");
        setProducts([]);
      }

      setLoading(false);
    } catch (error) {
      console.error(' Error fetching products:', error);
      setLoading(false);
    }
  };


  //   const fetchProducts = async () => {


  //     try {
  //       const params = {
  //         page: 1,
  //         limit: 50,
  //         ...Object.fromEntries(
  //           Object.entries(filters).filter(([key, value]) => 
  //             value !== '' && value !== null && value !== undefined
  //           )
  //         ),
  //         minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
  //         maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
  //         rating: filters.rating ? parseInt(filters.rating) : undefined,
  //       };

  //       const response = await apiService.getMarketplaceProducts(params);
  //         console.log("API Raw Response:", response);
  // console.log("Response Data:", response.data);

  //       if (response.success && response.data) {
  //         setProducts(response.data.products);
  //       }

  //       setLoading(false);
  //     } catch (error) {
  //       console.error('Error fetching products:', error);
  //       setLoading(false);
  //     }
  //   };

  const handlePlaceOrder = async (product: Product) => {
    try {

      const orderData = {
        products: [
          {
            product: product._id,
            quantity: cart[product._id] || 1,
          },
        ],
        shippingAddress: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
        },
        paymentMethod: 'cod' as 'cod' | 'card' | 'upi' | 'wallet',
        notes: `Order for product: ${product.name}`,
      };

      // API call
      const response = await apiService.createOrder(orderData);

      if (response.success) {
        showToast.success('Order placed successfully!');
        window.location.href = "/buyer/orders";

        console.log('Order Response:', response.data ?? response);

      } else {
        showToast.error(response.message || 'Failed to place order!');
      }
    } catch (error) {
      console.error(' Error placing order:', error);
      showToast.error('Something went wrong while placing your order.');
    }
  };



  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      freshness: '',
      rating: '',
      search: ''
    });
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'text-green-600 bg-green-100';
      case 'good': return 'text-yellow-600 bg-yellow-100';
      case 'average': return 'text-orange-600 bg-orange-100';
        primary: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDaysSinceHarvest = (harvestDate: string) => {
    const harvest = new Date(harvestDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - harvest.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={t('dashboard.buyer.title')}
      subtitle={t('dashboard.buyer.subtitle')}
      actions={
        <Link href="/buyer/orders">
          <Button variant="outline">
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            {/* My Orders */}
            {t('dashboard.buyer.myOrders')}
          </Button>
        </Link>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-6 bg-white rounded-lg shadow-sm border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="capitalize">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Freshness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Freshness</label>
                  <select
                    value={filters.freshness}
                    onChange={(e) => handleFilterChange('freshness', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">All Freshness</option>
                    {freshnessOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(products ?? []).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >




              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="text-4xl text-gray-400">🌱</div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getFreshnessColor(product.freshness)}`}>
                      {product.freshness}
                    </div>
                    <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>

                  <div className="p-4">
                    {/* Product Info */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product.reviewCount})</span>
                      </div>

                      {/* Farmer Info */}
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{product.farmer.firstName} {product.farmer.lastName}</span>
                      </div>


                      {/* Location */}
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>
                          <span>{product.location?.city}, {product.location?.state}</span>
                        </span>
                      </div>


                      {/* Harvest Info */}
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                        <ClockIcon className="h-4 w-4" />
                        <span>Harvested {getDaysSinceHarvest(product.harvestDate)} days ago</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{product.price}</p>
                        <p className="text-sm text-gray-600">per {product.unit}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {cart[product._id] ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(product._id)}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">{cart[product._id]}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToCart(product._id)}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => addToCart(product._id)}
                            className="btn-primary"
                          >
                            <ShoppingCartIcon className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* View Details */}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(product)}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>


                    {/* order place  */}
                    <div className="mt-3">
                      <Button variant="outline" className="w-full"
                        onClick={() => handlePlaceOrder(product)} // 👈 Function call here
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-1" />
                        Order Place
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!products || products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedProduct.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedProduct.category.charAt(0).toUpperCase() + selectedProduct.category.slice(1)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <span className="text-2xl text-gray-500 dark:text-gray-400">&times;</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Images */}
                <div>
                  {selectedProduct.images.length > 0 ? (
                    <div className="space-y-4">
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-full h-96 object-cover rounded-lg"
                      />
                      {selectedProduct.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedProduct.images.slice(1, 5).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${selectedProduct.name} ${index + 2}`}
                              className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-8xl">🌱</div>
                    </div>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  {/* Price and Freshness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">₹{selectedProduct.price}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">per {selectedProduct.unit}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getFreshnessColor(selectedProduct.freshness)}`}>
                        {selectedProduct.freshness.charAt(0).toUpperCase() + selectedProduct.freshness.slice(1)}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(selectedProduct.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProduct.rating.toFixed(1)} ({selectedProduct.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedProduct.description}</p>
                  </div>

                  {/* Product Info */}
                  <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 space-y-3">
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Farmer:</span>
                      <span>{selectedProduct.farmer.firstName} {selectedProduct.farmer.lastName}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <MapPinIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Location:</span>
                      <span>{selectedProduct.location?.city}, {selectedProduct.location?.state}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <ClockIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Harvested:</span>
                      <span>{getDaysSinceHarvest(selectedProduct.harvestDate)} days ago</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Quantity Available:</span>
                      <span>{selectedProduct.quantity} {selectedProduct.unit}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedProduct.isAvailable
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {selectedProduct.isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cart Actions */}
                  <div className="space-y-3 pt-4">
                    {cart[selectedProduct._id] ? (
                      <div className="flex items-center justify-center space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <Button
                          variant="outline"
                          onClick={() => removeFromCart(selectedProduct._id)}
                        >
                          <MinusIcon className="h-5 w-5" />
                        </Button>
                        <span className="text-xl font-medium">{cart[selectedProduct._id]} {selectedProduct.unit}</span>
                        <Button
                          variant="outline"
                          onClick={() => addToCart(selectedProduct._id)}
                        >
                          <PlusIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full btn-primary"
                        onClick={() => addToCart(selectedProduct._id)}
                        disabled={!selectedProduct.isAvailable}
                      >
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        Add
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handlePlaceOrder(selectedProduct);
                        setShowDetailsModal(false);
                      }}
                      disabled={!selectedProduct.isAvailable}
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      Place Order Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    {selectedProduct.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withBuyerProtection(BuyerMarketplace);
