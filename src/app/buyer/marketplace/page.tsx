'use client';
import Swal from "sweetalert2";
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

  // const handlePlaceOrder = async (product: Product) => {
  //   try {

  //     const orderData = {
  //       products: [
  //         {
  //           product: product._id,
  //           quantity: cart[product._id] || 1,
  //         },
  //       ],
  //       shippingAddress: {
  //         street: '123 Main Street',
  //         city: 'Mumbai',
  //         state: 'Maharashtra',
  //         zipCode: '400001',
  //         country: 'India',
  //       },
  //       paymentMethod: 'cod' as 'cod' | 'card' | 'upi' | 'wallet',
  //       notes: `Order for product: ${product.name}`,
  //     };

  //     // API call
  //     const response = await apiService.createOrder(orderData);

  //     if (response.success) {
  //       showToast.success('Order placed successfully!');
  //       window.location.href = "/buyer/orders";

  //       console.log('Order Response:', response.data ?? response);

  //     } else {
  //       showToast.error(response.message || 'Failed to place order!');
  //     }
  //   } catch (error) {
  //     console.error(' Error placing order:', error);
  //     showToast.error('Something went wrong while placing your order.');
  //   }
  // };


  const handlePlaceOrder = async (product: Product) => {
    const { value: formData } = await Swal.fire({
      title: "Place Your Order",
      width: "min(600px, 95vw)",
      padding: "30px",
      showCancelButton: true,
      confirmButtonText: "✓ Confirm & Place Order",
      cancelButtonText: "← Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      buttonsStyling: true,
      customClass: {
        popup: "order-modal-popup",
        title: "order-modal-title",
        htmlContainer: "order-modal-content",
        confirmButton: "order-modal-confirm",
        cancelButton: "order-modal-cancel"
      },

      html: `
        <style>
          @media (max-width: 640px) {
            .swal2-popup.order-modal-popup { padding: 20px !important; }
            .order-modal-title { font-size: 18px !important; }
          }
          
          .order-modal-title { padding: 0 !important; margin: 0 !important; }
          .order-modal-content { padding: 0 !important; margin: 0 !important; }
          
          .order-modal-confirm {
            padding: 12px 28px !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            border-radius: 10px !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
          }
          .order-modal-confirm:hover {
            background: #059669 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
          }
          
          .order-modal-cancel {
            padding: 12px 28px !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            border-radius: 10px !important;
            transition: all 0.2s ease !important;
          }
          .order-modal-cancel:hover {
            background: #4b5563 !important;
          }
          
          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            margin-top: 16px;
          }
          
          .form-input, .form-select {
            width: 100%;
            padding: 12px 14px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 14px;
            color: #1f2937;
            background: white;
            transition: all 0.2s ease;
            outline: none;
          }
          
          .form-input:hover, .form-select:hover {
            border-color: #9ca3af;
          }
          
          .form-input:focus, .form-select:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
          
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          
          @media (max-width: 640px) {
            .form-row { grid-template-columns: 1fr; gap: 0; }
          }
        </style>
        
        <div style="text-align: left;">
          <!-- Product Summary Card -->
          <div style="
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #0ea5e9;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
          ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">

              <div style="flex: 1;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0c4a6e;">${product.name}</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Fresh from the farm</p>
              </div>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: white;
              padding: 10px 14px;
              border-radius: 8px;
            ">
              <span style="font-size: 14px; color: #64748b;">Unit Price</span>
              <span style="font-size: 18px; font-weight: 700; color: #0c4a6e;">₹${product.price}/<small>${product.unit}</small></span>
            </div>
          </div>

          <!-- Quantity -->
          <label class="form-label" style="margin-top: 0;">
            <span style="color: #dc2626;">*</span> Quantity
          </label>
          <input id="qty" type="number" min="1" max="1000" value="1" class="form-input" />

          <!-- Address Section Header -->
          <div style="
            margin-top: 24px;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          ">
            <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #1f2937;"> Delivery Address</h4>
          </div>

          <!-- Street Address -->
          <label class="form-label" style="margin-top: 0;">
            <span style="color: #dc2626;">*</span> Street Address
          </label>
          <input id="street" class="form-input" placeholder="Street / House No / Apartment" />

          <!-- City & State Row -->
          <div class="form-row">
            <div>
              <label class="form-label">
                <span style="color: #dc2626;">*</span> City
              </label>
              <input id="city" class="form-input" placeholder="Enter City" />
            </div>
            <div>
              <label class="form-label">
                <span style="color: #dc2626;">*</span> State
              </label>
              <input id="state" class="form-input" placeholder="Enter State" />
            </div>
          </div>

          <!-- Zip & Country Row -->
          <div class="form-row">
            <div>
              <label class="form-label">
                <span style="color: #dc2626;">*</span> PIN Code
              </label>
              <input id="zip" type="text" maxlength="6" class="form-input" placeholder="6-digit PIN" />
            </div>
            <div>
              <label class="form-label">
                <span style="color: #dc2626;">*</span> Country
              </label>
              <input id="country" class="form-input" value="India" readonly style="background: #f9fafb;" />
            </div>
          </div>

          <!-- Payment Section Header -->
          <div style="
            margin-top: 24px;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          ">
            <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #1f2937;"> Payment Method</h4>
          </div>

          <label class="form-label" style="margin-top: 0;">
            <span style="color: #dc2626;">*</span> Select Payment
          </label>
          <select id="payment" class="form-select">
            <option value="cod"> Cash on Delivery (COD)</option>
          </select>

          <!-- Total Price Card -->
          <div id="totalBox" style="
            margin-top: 24px;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 2px solid #10b981;
            padding: 18px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 600; color: #065f46;">Order Total</span>
              <span style="
                font-size: 24px;
                font-weight: 700;
                color: #047857;
                letter-spacing: -0.5px;
              ">₹${product.price}</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #059669;">
              ✓ Includes all taxes • Fast delivery
            </p>
          </div>
        </div>
      `,

      didOpen: () => {
        const qtyInput = document.getElementById("qty") as HTMLInputElement;
        const totalBox = document.getElementById("totalBox");

        qtyInput.addEventListener("input", () => {
          const qty = Number(qtyInput.value) || 1;
          const total = qty * product.price;
          totalBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 600; color: #065f46;">Order Total</span>
              <span style="
                font-size: 24px;
                font-weight: 700;
                color: #047857;
                letter-spacing: -0.5px;
              ">₹${total}</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #059669;">
              ✓ Includes all taxes • Fast delivery
            </p>
          `;
        });
      },

      preConfirm: () => {
        const qty = Number((document.getElementById("qty") as HTMLInputElement).value);
        const street = (document.getElementById("street") as HTMLInputElement).value.trim();
        const city = (document.getElementById("city") as HTMLInputElement).value.trim();
        const state = (document.getElementById("state") as HTMLInputElement).value.trim();
        const zip = (document.getElementById("zip") as HTMLInputElement).value.trim();
        const country = (document.getElementById("country") as HTMLInputElement).value.trim();
        const payment = (document.getElementById("payment") as HTMLSelectElement).value;

        // VALIDATIONS
        if (!qty || qty < 1) {
          Swal.showValidationMessage(" Please enter a valid quantity (minimum 1)");
          return false;
        }

        if (!street) {
          Swal.showValidationMessage(" Street address is required");
          return false;
        }

        if (!city) {
          Swal.showValidationMessage(" City is required");
          return false;
        }

        if (!state) {
          Swal.showValidationMessage(" State is required");
          return false;
        }

        if (!zip) {
          Swal.showValidationMessage(" PIN code is required");
          return false;
        }

        if (zip.length !== 6 || !/^\d{6}$/.test(zip)) {
          Swal.showValidationMessage(" PIN code must be exactly 6 digits");
          return false;
        }

        return { qty, street, city, state, zip, country, payment };
      },
    });

    if (!formData) return;

    // API PAYLOAD
    const payload = {
      products: [{ product: product._id, quantity: formData.qty }],
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip,
        country: formData.country
      },
      paymentMethod: formData.payment,
      notes: `Order for ${product.name}`,
    };

    try {
      const response = await apiService.createOrder(payload);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: " Order Placed Successfully!",
          html: `
            <div style="text-align: center; padding: 10px;">
              <p style="font-size: 15px; color: #374151; margin: 10px 0;">
                Your order has been confirmed!
              </p>
              <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
                The farmer will prepare your order soon.
              </p>
            </div>
          `,
          confirmButtonText: "View My Orders",
          confirmButtonColor: "#10b981",
          timer: 3000,
          timerProgressBar: true,
        });

        window.location.href = "/buyer/orders";
      } else {
        Swal.fire({
          icon: "error",
          title: " Order Failed",
          text: response.message || "Failed to place order",
          confirmButtonColor: "#dc2626"
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: " Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#dc2626"
      });
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
