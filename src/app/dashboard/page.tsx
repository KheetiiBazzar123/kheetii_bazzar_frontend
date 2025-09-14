'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TruckIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  UserGroupIcon,
  PhotoIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageRating: 0
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    setProducts([
      {
        id: 1,
        name: 'Organic Tomatoes',
        price: 120,
        quantity: 50,
        category: 'Vegetables',
        image: '/api/placeholder/300/200',
        rating: 4.8,
        orders: 25
      },
      {
        id: 2,
        name: 'Fresh Carrots',
        price: 80,
        quantity: 30,
        category: 'Vegetables',
        image: '/api/placeholder/300/200',
        rating: 4.6,
        orders: 18
      }
    ]);

    setOrders([
      {
        id: 1,
        customer: 'John Doe',
        product: 'Organic Tomatoes',
        quantity: 5,
        total: 600,
        status: 'pending',
        date: '2024-01-15'
      },
      {
        id: 2,
        customer: 'Jane Smith',
        product: 'Fresh Carrots',
        quantity: 3,
        total: 240,
        status: 'delivered',
        date: '2024-01-14'
      }
    ]);

    setStats({
      totalRevenue: 15420,
      totalOrders: 45,
      totalProducts: 12,
      averageRating: 4.7
    });
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'products', label: 'Products', icon: ShoppingCartIcon },
    { id: 'orders', label: 'Orders', icon: TruckIcon },
    { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-error';
      primary: return 'badge-info';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600">+12.5% from last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600">+8.2% from last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600">+3 new this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600">+0.2 from last month</span>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            <TruckIcon className="h-5 w-5 mr-2 text-emerald-600" />
            Recent Orders
          </CardTitle>
          <CardDescription>Latest orders from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.product} × {order.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{order.total}</p>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </motion.div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
          <CardDescription>Manage your marketplace activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/products">
              <Button variant="ghost" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                <PhotoIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Manage Products</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/orders">
              <Button variant="ghost" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                <ShoppingCartIcon className="h-8 w-8" />
                <span className="text-sm font-medium">View Orders</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/my-orders">
              <Button variant="ghost" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                <TruckIcon className="h-8 w-8" />
                <span className="text-sm font-medium">My Orders</span>
              </Button>
            </Link>
            
            <Link href="/products">
              <Button variant="ghost" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                <EyeIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Browse Marketplace</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/blockchain">
              <Button variant="ghost" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                <ShieldCheckIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Blockchain</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <Link href="/dashboard/products">
          <Button className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(products??[]).map((product) => (
          <motion.div
            key={product.id}
            className="product-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="product-card-image"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                  <EyeIcon className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                  <PencilIcon className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-amber-400 mr-1" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-emerald-600">₹{product.price}/kg</span>
                <span className="text-sm text-gray-500">{product.quantity} in stock</span>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {product.orders} orders this month
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
      
      <div className="card">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Manage and track your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">#{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.customer}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.product}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.quantity}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="p-1 text-emerald-600 hover:text-emerald-700">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-blue-600 hover:text-blue-700">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <p className="text-gray-500">Chart will be implemented here</p>
            </div>
          </CardContent>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Your best performing products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 3).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">₹{product.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </motion.div>
      </div>
    </div>
  );

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
              <h1 className="text-2xl font-bold gradient-text">KheetiiBazaar</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold text-emerald-600">{user?.firstName}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  logout();
                  window.location.href = '/auth/login';
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'analytics' && renderAnalytics()}
        </motion.div>
      </div>
    </div>
  );
}