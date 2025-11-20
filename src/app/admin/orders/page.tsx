'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface Order {
  _id: string;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  products: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'wallet' | 'cod';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    setFilter(statusParam || 'all');
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getFarmerOrders(
        1,
        50,
        filter === 'all' ? undefined : filter
      );

      if (response && response.data) {
        setOrders(response.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiService.updateOrderStatus(orderId, newStatus);

      if (response.success) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

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
      case 'preparing': return <ClockIcon className="h-4 w-4" />;
      case 'shipped': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'shipped';
      case 'shipped': return 'delivered';
      default: return null;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Admin Orders"
      subtitle="Manage and monitor all orders placed across the platform"
    >
      <div className="max-w-7xl mx-auto">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {(orders ?? []).map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Order #{order._id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{order.totalAmount}</p>
                      <p className="text-sm text-gray-600 capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Buyer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {order.buyer.firstName} {order.buyer.lastName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {order.buyer.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {order.buyer.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Products</h4>
                    <div className="space-y-3">
                      {order.products.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{item.totalPrice}</p>
                            <p className="text-sm text-gray-600">₹{item.product.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Delivery Address
                    </h4>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    {order.deliveryDate && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Expected Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    )}
                    {order.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Notes:</strong> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {getNextStatus(order.status) && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order._id, getNextStatus(order.status)!)}
                          className="btn-primary"
                        >
                          Mark as {getNextStatus(order.status)!.charAt(0).toUpperCase() + getNextStatus(order.status)!.slice(1)}
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(order.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {orders && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? "There are no orders yet."
                : `No orders with status "${filter}".`}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminOrders);
