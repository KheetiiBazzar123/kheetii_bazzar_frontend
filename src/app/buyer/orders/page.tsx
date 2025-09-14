'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Order {
  _id: string;
  farmer: {
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
  blockchainTxId?: string;
  blockchainStatus: 'pending' | 'verified' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function BuyerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      // In a real app, you would fetch from your API
      // For now, we'll use mock data
      const mockOrders: Order[] = [
        {
          _id: '1',
          farmer: {
            firstName: 'Raj',
            lastName: 'Kumar',
            email: 'raj@example.com',
            phone: '+91 98765 43210'
          },
          products: [
            {
              product: {
                _id: '1',
                name: 'Fresh Organic Tomatoes',
                price: 50,
                images: []
              },
              quantity: 5,
              totalPrice: 250
            }
          ],
          totalAmount: 250,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'upi',
          shippingAddress: {
            street: '123 Main Street',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          deliveryDate: '2024-01-20',
          blockchainTxId: '0x1234567890abcdef',
          blockchainStatus: 'verified',
          notes: 'Please deliver in the morning',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          farmer: {
            firstName: 'Priya',
            lastName: 'Sharma',
            email: 'priya@example.com',
            phone: '+91 98765 43211'
          },
          products: [
            {
              product: {
                _id: '2',
                name: 'Sweet Mangoes',
                price: 80,
                images: []
              },
              quantity: 3,
              totalPrice: 240
            }
          ],
          totalAmount: 240,
          status: 'shipped',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          shippingAddress: {
            street: '123 Main Street',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          deliveryDate: '2024-01-18',
          blockchainTxId: '0xabcdef1234567890',
          blockchainStatus: 'verified',
          createdAt: '2024-01-14T14:20:00Z',
          updatedAt: '2024-01-16T09:15:00Z'
        },
        {
          _id: '3',
          farmer: {
            firstName: 'Amit',
            lastName: 'Singh',
            email: 'amit@example.com',
            phone: '+91 98765 43212'
          },
          products: [
            {
              product: {
                _id: '3',
                name: 'Basmati Rice',
                price: 120,
                images: []
              },
              quantity: 2,
              totalPrice: 240
            }
          ],
          totalAmount: 240,
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: 'cod',
          shippingAddress: {
            street: '123 Main Street',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          deliveryDate: '2024-01-12',
          blockchainTxId: '0x9876543210fedcba',
          blockchainStatus: 'verified',
          createdAt: '2024-01-10T16:45:00Z',
          updatedAt: '2024-01-12T11:30:00Z'
        }
      ];

      let filteredOrders = mockOrders;
      if (filter !== 'all') {
        filteredOrders = mockOrders.filter(order => order.status === filter);
      }

      setOrders(filteredOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
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
      primary: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'preparing': return <ClockIcon className="h-4 w-4" />;
      case 'shipped': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <XMarkIcon className="h-4 w-4" />;
      primary: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-blue-600 bg-blue-100';
      primary: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBlockchainStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      primary: return 'text-gray-600 bg-gray-100';
    }
  };

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      // In a real app, you would call the API to cancel the order
      console.log('Cancelling order:', orderId);
      // Update the order status in the local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: 'cancelled' as const }
          : order
      ));
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
      title="My Orders"
      subtitle="Track your orders and deliveries"
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back to Marketplace
        </Button>
      }
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
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.toUpperCase()}
                      </div>
                      {order.blockchainTxId && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getBlockchainStatusColor(order.blockchainStatus)}`}>
                          {order.blockchainStatus.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Order #{order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Farmer Info */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Farmer Details</h4>
                    <p className="text-sm text-gray-700">
                      {order.farmer.firstName} {order.farmer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{order.farmer.email}</p>
                    <p className="text-sm text-gray-600">{order.farmer.phone}</p>
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
                              <span className="text-2xl">🌱</span>
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

                  {/* Order Summary */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-emerald-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Total Amount</h4>
                      <p className="text-sm text-gray-600">
                        Payment Method: {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">₹{order.totalAmount}</p>
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
                  </div>

                  {/* Blockchain Info */}
                  {order.blockchainTxId && (
                    <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Blockchain Verification</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Transaction ID: {order.blockchainTxId}
                      </p>
                      <a
                        href={`https://testnet.algoexplorer.io/tx/${order.blockchainTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-700 underline"
                      >
                        View on AlgoExplorer
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {canCancelOrder(order) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Cancel Order
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
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't placed any orders yet"
                : `No orders with status "${filter}"`
              }
            </p>
            {filter === 'all' && (
              <Button
                onClick={() => window.location.href = '/buyer/marketplace'}
                className="btn-primary"
              >
                Start Shopping
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withBuyerProtection(BuyerOrders);
