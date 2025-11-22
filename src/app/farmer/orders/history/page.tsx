'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface OrderHistory {
  _id: string;
  orderNumber: string;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  notes?: string;
}

function OrderHistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    fetchOrderHistory();
  }, [filter, dateRange]);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch order history
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders: OrderHistory[] = [
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          buyer: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890'
          },
          products: [
            {
              product: {
                name: 'Fresh Organic Tomatoes',
                price: 2.50,
                images: ['/images/tomatoes.jpg']
              },
              quantity: 5,
              totalPrice: 12.50
            }
          ],
          totalAmount: 12.50,
          status: 'delivered',
          paymentStatus: 'paid',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T14:20:00Z',
          deliveryDate: '2024-01-16T14:20:00Z',
          notes: 'Delivered successfully'
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          buyer: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1234567891'
          },
          products: [
            {
              product: {
                name: 'Organic Carrots',
                price: 1.80,
                images: ['/images/carrots.jpg']
              },
              quantity: 3,
              totalPrice: 5.40
            },
            {
              product: {
                name: 'Fresh Lettuce',
                price: 2.00,
                images: ['/images/lettuce.jpg']
              },
              quantity: 2,
              totalPrice: 4.00
            }
          ],
          totalAmount: 9.40,
          status: 'cancelled',
          paymentStatus: 'refunded',
          createdAt: '2024-01-14T09:15:00Z',
          updatedAt: '2024-01-14T16:45:00Z',
          notes: 'Customer requested cancellation'
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'dispatched': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      primary: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      primary: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      primary: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false;
    // TODO: Implement date range filtering
    return true;
  });

  const totalRevenue = orders
    .filter(order => order.status === 'delivered' && order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  if (loading) {
    return (
      <DashboardLayout
        title="Order History"
        subtitle="Loading order history..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Order History"
      subtitle="View and manage your order history"
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back to Orders
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              Complete history of all your orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' ? 'You have no orders yet.' : `No orders with status "${filter}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Customer Information
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.buyer.firstName} {order.buyer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{order.buyer.email}</p>
                        <p className="text-sm text-gray-600">{order.buyer.phone}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                        <div className="space-y-1">
                          {(order.products ?? []).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.product.name} x {item.quantity}
                              </span>
                              <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {order.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withFarmerProtection(OrderHistoryPage);
