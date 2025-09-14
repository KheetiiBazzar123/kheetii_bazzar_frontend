'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import OrderCard from '@/components/OrderCard';
import {
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/use-toast';

interface Order {
  id: string;
  orderNumber: string;
  farmer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  rating?: number;
  review?: string;
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'KB-2024-001',
        farmer: {
          id: 'farmer1',
          name: 'Ramesh Singh',
          email: 'ramesh@example.com',
          phone: '+91 98765 43210',
          address: {
            street: 'Farm House, Village Road',
            city: 'Pune',
            state: 'Maharashtra',
            zip: '411001',
          },
        },
        products: [
          {
            id: 'prod1',
            name: 'Fresh Organic Tomatoes',
            price: 120,
            quantity: 2,
            unit: 'kg',
            image: '/api/placeholder/100/100',
          },
          {
            id: 'prod2',
            name: 'Premium Basmati Rice',
            price: 180,
            quantity: 1,
            unit: 'kg',
            image: '/api/placeholder/100/100',
          },
        ],
        totalAmount: 420,
        status: 'pending',
        paymentStatus: 'paid',
        shippingAddress: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400001',
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        estimatedDelivery: '2024-01-18T18:00:00Z',
      },
      {
        id: '2',
        orderNumber: 'KB-2024-002',
        farmer: {
          id: 'farmer2',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 98765 43211',
          address: {
            street: 'Green Farm, Garden Road',
            city: 'Delhi',
            state: 'Delhi',
            zip: '110001',
          },
        },
        products: [
          {
            id: 'prod1',
            name: 'Fresh Organic Tomatoes',
            price: 120,
            quantity: 5,
            unit: 'kg',
            image: '/api/placeholder/100/100',
          },
        ],
        totalAmount: 600,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingAddress: {
          street: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zip: '110001',
        },
        createdAt: '2024-01-14T14:30:00Z',
        updatedAt: '2024-01-16T09:15:00Z',
        estimatedDelivery: '2024-01-17T12:00:00Z',
        trackingNumber: 'TRK123456789',
      },
      {
        id: '3',
        orderNumber: 'KB-2024-003',
        farmer: {
          id: 'farmer3',
          name: 'Amit Patel',
          email: 'amit@example.com',
          phone: '+91 98765 43212',
          address: {
            street: 'Organic Farm, Village Road',
            city: 'Bangalore',
            state: 'Karnataka',
            zip: '560001',
          },
        },
        products: [
          {
            id: 'prod2',
            name: 'Premium Basmati Rice',
            price: 180,
            quantity: 3,
            unit: 'kg',
            image: '/api/placeholder/100/100',
          },
        ],
        totalAmount: 540,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          street: '789 Garden Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zip: '560001',
        },
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-12T16:30:00Z',
        rating: 5,
        review: 'Excellent quality rice, very fresh and aromatic!',
      },
    ];
    setOrders(mockOrders);
    setLoading(false);
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus as any,
              updatedAt: new Date().toISOString(),
            }
          : order
      ));
      
      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleViewDetails = (orderId: string) => {
    // TODO: Implement order details modal/page
    console.log('View details for order:', orderId);
  };

  const handleRateOrder = (orderId: string) => {
    // TODO: Implement rating modal
    console.log('Rate order:', orderId);
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const getStatusStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track your orders and manage purchases</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter} className="w-48">
              <SelectValue placeholder="Filter by status" />
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card className="stat-card">
            <CardContent className="p-4 text-center">
              <ShoppingCartIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4 text-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4 text-center">
              <CheckCircleIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4 text-center">
              <TruckIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
              <p className="text-sm text-gray-600">Shipped</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4 text-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4 text-center">
              <XCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'all' 
                  ? 'Start shopping to see your orders here'
                  : `No orders with ${statusFilter} status found`
                }
              </p>
              <Button className="btn-primary">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OrderCard
                  order={{...order, _id: (order as any).id || (order as any)._id}}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={handleViewDetails}
                  userRole="buyer"
                />
                
                {/* Rating Section for Delivered Orders */}
                {order.status === 'delivered' && !order.rating && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Rate Your Order</h4>
                          <p className="text-sm text-gray-600">How was your experience?</p>
                        </div>
                        <Button
                          onClick={() => handleRateOrder(order.id)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <StarIcon className="h-4 w-4" />
                          <span>Rate</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Show Rating if Already Rated */}
                {order.rating && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-5 w-5 ${
                                i < order.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({order.rating}/5)</span>
                      </div>
                      {order.review && (
                        <p className="text-sm text-gray-700 italic">"{order.review}"</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
