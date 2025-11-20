'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import DarkModeTest from '@/components/DarkModeTest';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  PlusIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TruckIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ✅ same structure as farmer dashboard
interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalEarnings: number;
}

interface RecentOrder {
  _id: string;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  products: Array<{
    product: {
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface TopProduct {
  _id: string;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  images: string[];
}

function AdminDashboard() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  // Temporary: use hard-coded mock data only (no API calls)
  const t = setTimeout(() => {
    setStats({
      totalProducts: 128,
      activeProducts: 102,
      totalOrders: 542,
      pendingOrders: 12,
      totalEarnings: 254320
    });

    setRecentOrders([
      {
        _id: 'ord_1',
        buyer: { firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@example.com' },
        products: [{ product: { name: 'Fresh Mangoes', price: 200, images: [] }, quantity: 5, totalPrice: 1000 }],
        totalAmount: 1000,
        status: 'delivered',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'ord_2',
        buyer: { firstName: 'Anita', lastName: 'Sharma', email: 'anita@example.com' },
        products: [{ product: { name: 'Organic Wheat', price: 150, images: [] }, quantity: 3, totalPrice: 450 }],
        totalAmount: 450,
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ]);

    setTopProducts([
      { _id: 'p1', name: 'Fresh Mangoes', rating: 4.8, reviewCount: 128, price: 200, images: [] },
      { _id: 'p2', name: 'Organic Wheat', rating: 4.6, reviewCount: 89, price: 150, images: [] },
      { _id: 'p3', name: 'Honey (500g)', rating: 4.5, reviewCount: 74, price: 300, images: [] }
    ]);

    setLoading(false);
  }, 500);

  return () => clearTimeout(t);
}, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'preparing': return <PencilIcon className="h-4 w-4" />;
      case 'shipped': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle={`Welcome back, Admin ${user?.firstName || ''}!`}
      actions={
        <div className="flex items-center space-x-4">
          <Button onClick={toggleTheme} variant="outline">
            Toggle Theme: {theme}
          </Button>
          <Link href="/admin/products/new">
            <Button className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* <div className="mb-8">
          <DarkModeTest />
        </div> */}

        {/* ✅ Admin Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ChartBarIcon className="h-6 w-6 text-blue-600" />}
            bg="bg-blue-100"
            title="Total Products"
            value={stats.totalProducts}
          />
          <StatCard
            icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
            bg="bg-green-100"
            title="Active Products"
            value={stats.activeProducts}
          />
          <StatCard
            icon={<ShoppingCartIcon className="h-6 w-6 text-purple-600" />}
            bg="bg-purple-100"
            title="Total Orders"
            value={stats.totalOrders}
          />
          <StatCard
            icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
            bg="bg-yellow-100"
            title="Pending Orders"
            value={stats.pendingOrders}
          />
        </div>

        {/* ✅ Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
              <Link href="/admin/earnings">
                <Button variant="outline">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ Orders & Products sections remain same */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                          {order.buyer.firstName} {order.buyer.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.products[0]?.product.name} ×{order.products[0]?.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-100">₹{order.totalAmount}</p>
                        <Link href={`/admin/orders/${order._id}`}>
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/admin/orders">
                    <Button variant="outline" className="w-full">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{product.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">({product.reviewCount})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-100">₹{product.price}</p>
                        <div className="flex space-x-1 mt-1">
                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/admin/products">
                    <Button variant="outline" className="w-full">
                      Manage Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const StatCard = ({ icon, bg, title, value }: { icon: React.ReactNode; bg: string; title: string; value: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
    <Card>
      <CardContent className="p-6 flex items-center">
        <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default withAdminProtection(AdminDashboard);
