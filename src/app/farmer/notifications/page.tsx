'use client';

import React, { useState, useEffect } from 'react';
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

import {apiClient} from "@/lib/api";
interface Notification {
  _id: string;
  type: 'order' | 'payment' | 'review' | 'system' | 'warning';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';

}
function NotificationsPage() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'payment' | 'review' | 'system'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);
const fetchNotifications = async () => {
  setLoading(true);
  try {
    const response = await apiClient.getNotifications({ page: 1, limit: 10 });
    console.log("API Response:", response);

    if (response.data.success && response.data?.notifications) {
      setNotifications(response.data.notifications);
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  } finally {
    setLoading(false);
  }
};


  // const fetchNotifications = async () => {
  //   setLoading(true);
  //   try {
  //     // TODO: Implement API call to fetch notifications
  //     await new Promise(resolve => setTimeout(resolve, 1000));
      
  //     const mockNotifications: Notification[] = [
  //       {
  //         _id: '1',
  //         type: 'order',
  //         title: 'New Order Received',
  //         message: 'You have received a new order for Organic Tomatoes from John Doe',
  //         isRead: false,
  //         createdAt: '2024-01-15T10:30:00Z',
  //         actionUrl: '/farmer/orders',
  //         priority: 'high'
  //       },
  //       {
  //         _id: '2',
  //         type: 'payment',
  //         title: 'Payment Received',
  //         message: 'Payment of $125.50 has been received for order #ORD-2024-001',
  //         isRead: false,
  //         createdAt: '2024-01-15T11:15:00Z',
  //         actionUrl: '/farmer/earnings',
  //         priority: 'medium'
  //       },
  //       {
  //         _id: '3',
  //         type: 'review',
  //         title: 'New Product Review',
  //         message: 'John Doe left a 5-star review for your Organic Tomatoes',
  //         isRead: true,
  //         createdAt: '2024-01-14T16:20:00Z',
  //         actionUrl: '/farmer/reviews',
  //         priority: 'medium'
  //       },
  //       {
  //         _id: '4',
  //         type: 'system',
  //         title: 'System Maintenance',
  //         message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM',
  //         isRead: true,
  //         createdAt: '2024-01-14T09:00:00Z',
  //         priority: 'low'
  //       },
  //       {
  //         _id: '5',
  //         type: 'warning',
  //         title: 'Low Stock Alert',
  //         message: 'Your Fresh Carrots inventory is running low (only 5 units left)',
  //         isRead: false,
  //         createdAt: '2024-01-13T14:30:00Z',
  //         actionUrl: '/farmer/products',
  //         priority: 'high'
  //       }
  //     ];
      
  //     setNotifications(mockNotifications);
  //   } catch (error) {
  //     console.error('Error fetching notifications:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCartIcon className="h-5 w-5 text-blue-600" />;
      case 'payment': return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      case 'review': return <BellIcon className="h-5 w-5 text-yellow-600" />;
      case 'system': return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      primary: return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      primary: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // const markAsRead = (notificationId: string) => {
  //   setNotifications(prev => 
  //     prev.map(notif => 
  //       notif._id === notificationId 
  //         ? { ...notif, isRead: true }
  //         : notif
  //     )
  //   );
  // };

  const markAsRead = async (notificationId: string) => {
  try {
    const response = await apiClient.markNotificationAsRead(notificationId);
    console.log("Calling API for notification:", notificationId);


    if (response.data.success) {
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      console.log("Notification marked as read:", response);
    } else {
      console.error(" Failed to mark as read:", response.data.message);
    }
  } catch (error) {
    console.error(" Error marking notification as read:", error);
  }
};


  // const markAllAsRead = () => {
  //   setNotifications(prev => 
  //     prev.map(notif => ({ ...notif, isRead: true }))
  //   );
  // };
  const markAllAsRead = async () => {
  try {
    const response = await apiClient.markAllNotificationsAsRead();

    if (response.data.success) {
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      console.log(" All notifications marked as read:", response.data.message);
    } else {
      console.error(" Failed to mark all as read:", response.data.message);
    }
  } catch (error) {
    console.error(" Error marking all as read:", error);
  }
};


  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'all') return true;
    return notification.type === filter;
  });

useEffect(() => {
  fetchUnreadCount();
}, []);
const fetchUnreadCount = async () => {
  try {
    const response = await apiClient.getUnreadNotificationCount();
    // Access unreadCount from response.data per ApiResponse<{ unreadCount: number; }>
    const unread = response?.data?.unreadCount ?? 0;
    setUnreadCount(unread);
  } catch (error) {
    console.error("Error fetching unread count:", error);
  }
};

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
      title="Notifications"
      subtitle="Stay updated with your farm's activity"
      actions={
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark All Read
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
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
