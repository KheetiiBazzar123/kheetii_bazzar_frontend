'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  buyer?: {
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

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, status: string) => void;
  onViewDetails?: (orderId: string) => void;
  userRole: 'farmer' | 'buyer';
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function OrderCard({ order, onStatusUpdate, onViewDetails, userRole }: OrderCardProps) {
  const getStatusActions = () => {
    if (userRole === 'farmer') {
      switch (order.status) {
        case 'pending':
          return [
            { label: 'Confirm', status: 'confirmed', variant: 'primary' as const },
            { label: 'Cancel', status: 'cancelled', variant: 'destructive' as const },
          ];
        case 'confirmed':
          return [
            { label: 'Ship Order', status: 'shipped', variant: 'primary' as const },
          ];
        case 'shipped':
          return [
            { label: 'Mark Delivered', status: 'delivered', variant: 'primary' as const },
          ];
        default:
          return [];
      }
    } else {
      switch (order.status) {
        case 'pending':
          return [
            { label: 'Cancel Order', status: 'cancelled', variant: 'destructive' as const },
          ];
        case 'shipped':
          return [
            { label: 'Mark Received', status: 'delivered', variant: 'primary' as const },
          ];
        default:
          return [];
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'confirmed':
        return <CalendarIcon className="h-4 w-4" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />;
      case 'delivered':
        return <TruckIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="product-card"
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={`${statusColors[order.status]} text-xs`}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
            </Badge>
            <Badge className={`${paymentStatusColors[order.paymentStatus]} text-xs`}>
              Payment {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-emerald-100 rounded-full">
            <UserIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{order.buyer?.name || 'Unknown Buyer'}</p>
            <p className="text-sm text-gray-600">{order.buyer?.email || 'No email'}</p>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Products</h4>
          {(order.products ?? []).map((product) => (
            <div key={product.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">
                  {product.quantity} {product.unit} × ₹{product.price}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                ₹{(product.price * product.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-full">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Shipping Address</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
          </div>
        </div>

        {/* Order Total */}
        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-lg font-semibold text-gray-900">Total Amount</span>
          <span className="text-xl font-bold text-emerald-600">
            ₹{order.totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Tracking Number</p>
            <p className="text-lg font-mono text-blue-700">{order.trackingNumber}</p>
          </div>
        )}

        {/* Estimated Delivery */}
        {order.estimatedDelivery && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>Estimated Delivery: {formatDate(order.estimatedDelivery)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          {onViewDetails && (
            <Button
              variant="ghost"
              onClick={() => onViewDetails(order._id)}
              className="flex-1"
            >
              View Details
            </Button>
          )}
          {getStatusActions()?.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              size="sm"
              onClick={() => onStatusUpdate?.(order._id, action.status)}
              className="flex-1"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </motion.div>
  );
}
