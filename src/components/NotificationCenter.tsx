'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'message' | 'blockchain'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />;
      case 'blockchain':
        return <ShieldCheckIcon className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
      primary:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'border-l-blue-500 bg-blue-50';
      case 'message':
        return 'border-l-green-500 bg-green-50';
      case 'blockchain':
        return 'border-l-purple-500 bg-purple-50';
      case 'system':
        return 'border-l-gray-500 bg-gray-50';
      primary:
        return 'border-l-yellow-500 bg-yellow-50';
    }
  };



// ...

  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      removeNotification(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      notifications.forEach(notification => {
        if (!notification.read) {
          removeNotification(notification.id);
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden z-50"
          >
            <Card className="shadow-xl border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="p-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex space-x-1 mt-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: 'Unread' },
                    { key: 'order', label: 'Orders' },
                    { key: 'message', label: 'Messages' },
                    { key: 'blockchain', label: 'Blockchain' },
                  ].map((tab) => (
                    <Button
                      key={tab.key}
                      variant={filter === tab.key ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(tab.key as any)}
                      className="text-xs px-2 py-1 h-7"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0 max-h-80 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                          !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                        } hover:bg-opacity-100 transition-all duration-200`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-600'
                              }`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <Badge className="text-xs">
                                {notification.type}
                              </Badge>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 p-1 h-6"
                              >
                                <CheckIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
