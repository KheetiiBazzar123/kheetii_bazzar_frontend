'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
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
} from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/use-toast';

interface Order {
  id: string;
  orderNumber: string;
  buyer: {
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
}

import { apiService } from '@/services/api';

// ... (imports remain same)

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Assuming this is the farmer dashboard based on userRole="farmer" prop later
      const response = await apiService.getFarmerOrders({
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      if (response.success) {
        // Map API response to Order interface
        const mappedOrders: Order[] = (response.data?.orders || []).map((order: any) => ({
          id: order._id,
          orderNumber: order.orderNumber,
          buyer: {
            id: order.buyer._id,
            name: `${order.buyer.firstName} ${order.buyer.lastName}`,
            email: order.buyer.email,
            phone: order.buyer.phone,
            address: order.shippingAddress // Assuming structure matches or we map it
          },
          products: order.products.map((p: any) => ({
            id: p.product._id,
            name: p.product.name,
            price: p.priceAtPurchase,
            quantity: p.quantity,
            unit: p.product.unit,
            image: p.product.images[0]
          })),
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          estimatedDelivery: order.deliveryDate,
          trackingNumber: order.trackingNumber,
          notes: order.notes
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus as any,
                updatedAt: new Date().toISOString(),
                // If backend returns updated order, we could use that instead
              }
            : order
        ));
        
        toast({
          title: 'Success',
          description: `Order status updated to ${newStatus}`,
          variant: 'default',
        });
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage incoming orders from buyers</p>
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
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'Orders from buyers will appear here'
                  : `No orders with ${statusFilter} status found`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={{...order, _id: (order as any).id || (order as any)._id}}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={handleViewDetails}
                userRole="farmer"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
