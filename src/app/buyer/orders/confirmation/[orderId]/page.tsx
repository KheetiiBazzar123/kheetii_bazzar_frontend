'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import api from '@/services/api';
import { Order } from '@/types';
import OrderTimeline from '@/components/OrderTimeline';
import { CheckCircleIcon, TruckIcon, ShoppingBagIcon, HomeIcon } from '@heroicons/react/24/solid';

export default function OrderConfirmationPage() {
  const { t } = useTranslation();
  const router = useRouter();
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
      const response = await api.getOrder(orderId);
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

  const estimatedDelivery = new Date(order.deliveryDate || Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {t('orders.confirmation.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('orders.confirmation.thankYou')}
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {t('orders.confirmation.orderNumber')}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
              #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {t('orders.confirmation.estimatedDelivery')}
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {estimatedDelivery.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {t('orders.orderDetails')}
            </h3>
            <div className="space-y-3">
              {order.products.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <img
                    src={item.product.images?.[0] || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>{t('orders.total')}</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {t('orders.deliveryAddress')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {order.shippingAddress.street}, {order.shippingAddress.city}
              <br />
              {order.shippingAddress.state} - {order.shippingAddress.zipCode}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {t('orders.paymentMethod')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t(`orders.paymentMethods.${order.paymentMethod}`)}
            </p>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          {t('orders.tracking.timeline')}
        </h3>
        <OrderTimeline status={order.status} createdAt={order.createdAt} />
      </div>

      {/* Email Confirmation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          📧 {t('orders.confirmation.confirmationEmail', { email: order.buyer.email })}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/buyer/orders/track/${order._id}`}
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <TruckIcon className="h-5 w-5" />
          {t('orders.confirmation.trackYourOrder')}
        </Link>
        <Link
          href="/buyer/marketplace"
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-medium transition"
        >
          <ShoppingBagIcon className="h-5 w-5" />
          {t('orders.confirmation.continueShopping')}
        </Link>
        <Link
          href="/buyer/orders"
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-medium transition"
        >
          <HomeIcon className="h-5 w-5" />
          {t('orders.confirmation.viewOrderDetails')}
        </Link>
      </div>

      {/* Support Info */}
      <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>Need help? Contact our support team at support@kheetiibazaar.com</p>
      </div>
    </div>
  );
}
