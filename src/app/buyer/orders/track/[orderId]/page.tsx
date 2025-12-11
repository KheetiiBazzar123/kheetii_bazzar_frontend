'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { apiClient } from '@/lib/api';
import { Order } from '@/types';
import { useTranslation } from 'react-i18next';
import OrderTimeline from '@/components/OrderTimeline';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';


function OrderTracking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await apiClient.getOrder(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/buyer/orders"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/buyer/orders"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('orders.tracking.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Order #{order._id.slice(-8).toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('orders.tracking.currentStatus')}
            </h2>
            <div className="flex items-center justify-between mb-6">
              <OrderStatusBadge status={order.status} className="text-lg px-4 py-2" />
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('orders.tracking.lastUpdate')}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.deliveryDate && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                      {t('orders.tracking.estimatedDelivery')}
                    </p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-200">
                      {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Confirmation */}
            {order.status === 'delivered' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-900 dark:text-green-200">
                      Order Delivered Successfully!
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Delivered on {new Date(order.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('orders.tracking.timeline')}
            </h2>
            <OrderTimeline status={order.status} createdAt={order.createdAt} />
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('orders.orderDetails')}
            </h2>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <img
                    src={item.product.images?.[0] || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>{t('orders.total')}</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPinIcon className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('orders.deliveryAddress')}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
              <br />
              {order.shippingAddress.zipCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          {/* Farmer/Seller Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Seller Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.farmer.firstName} {order.farmer.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="h-4 w-4" />
                <span>{order.farmer.email}</span>
              </div>
              {order.farmer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{order.farmer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('orders.paymentMethod')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {t(`orders.paymentMethods.${order.paymentMethod}`)}
            </p>
            <div className="mt-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('orders.paymentStatus')}:
              </span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                {t(`orders.paymentStatus.${order.paymentStatus}`)}
              </span>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('orders.orderNotes')}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Need Help?
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              Contact our support team if you have any questions about your order.
            </p>
            <a
              href="mailto:support@kheetiibazaar.com"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@kheetiibazaar.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withBuyerProtection(OrderTracking);
