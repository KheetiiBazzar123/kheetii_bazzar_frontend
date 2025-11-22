'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

import { apiService } from '@/services/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'payment' | 'review' | 'system'>('all');

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiService.getNotifications({ page: 1, limit: 20 });
      if (response.success && response.data) {
        // Assuming response.data.notifications exists or response.data is the array
        // Adjust based on actual API response structure. 
        // Based on api.ts, getNotifications returns ApiResponse<{ notifications: Notification[], total: number, ... }>
        const mappedNotifications = (response.data.notifications || []).map((n: any) => ({
          ...n,
          priority: n.priority || 'low'
        }));
        setNotifications(mappedNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCartIcon className="h-5 w-5 text-blue-600" />;
      case 'payment': return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      case 'review': return <BellIcon className="h-5 w-5 text-yellow-600" />;
      case 'system': return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default: return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        // Update unread count locally
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = (notificationId: string) => {
    // TODO: Implement delete API if available
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  if (loading) {
    return (
      <DashboardLayout
        title="Notifications"
        subtitle="Loading notifications..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('farmer.notifications.title')}
      subtitle={t('farmer.notifications.subtitle')}
      actions={
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {t('farmer.notifications.markAllRead')}
            </Button>
          )}
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Notification Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.length - unreadCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'order' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('order')}
              >
                Orders ({notifications.filter(n => n.type === 'order').length})
              </Button>
              <Button
                variant={filter === 'payment' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('payment')}
              >
                Payments ({notifications.filter(n => n.type === 'payment').length})
              </Button>
              <Button
                variant={filter === 'review' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('review')}
              >
                Reviews ({notifications.filter(n => n.type === 'review').length})
              </Button>
              <Button
                variant={filter === 'system' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('system')}
              >
                System ({notifications.filter(n => n.type === 'system').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Your latest notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('farmer.notifications.noNotifications')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' ? 'You have no notifications yet.' : `No ${filter} notifications.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border-l-4 rounded-lg p-4 ${
                      notification.isRead 
                        ? 'bg-white border-gray-200' 
                        : getPriorityColor(notification.priority)
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification._id)}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification._id)}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = notification.actionUrl!}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
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

export default withFarmerProtection(NotificationsPage);
