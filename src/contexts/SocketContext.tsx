'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'order' | 'message' | 'system' | 'blockchain';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      // Connect to Socket.io server
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://kheetiibazaar-backend-production.up.railway.app';
      const newSocket = io(socketUrl, {
        transports: ['polling', 'websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Authenticate after connection
        const token = localStorage.getItem('token');
        if (token && user?._id) {
          newSocket.emit('authenticate', {
            token,
            userId: user._id,
          });
        }
      });

      newSocket.on('authenticated', (data) => {
        console.log('Socket authenticated successfully:', data);
      });

      newSocket.on('authentication_error', (error) => {
        console.error('Socket authentication failed:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Listen for new order notifications
      newSocket.on('newOrder', (data) => {
        addNotification({
          id: `order-${Date.now()}`,
          type: 'order',
          title: 'New Order Received',
          message: `You have received a new order for ₹${data.totalAmount}`,
          timestamp: new Date(),
          read: false,
          data,
        });
      });

      // Listen for order status updates
      newSocket.on('orderStatusUpdate', (data) => {
        addNotification({
          id: `status-${Date.now()}`,
          type: 'order',
          title: 'Order Status Updated',
          message: `Order #${data.orderNumber} is now ${data.status}`,
          timestamp: new Date(),
          read: false,
          data,
        });
      });

      // Listen for blockchain transaction confirmations
      newSocket.on('blockchainTransaction', (data) => {
        addNotification({
          id: `blockchain-${Date.now()}`,
          type: 'blockchain',
          title: 'Blockchain Transaction Confirmed',
          message: `Transaction ${data.txId} has been confirmed on Algorand`,
          timestamp: new Date(),
          read: false,
          data,
        });
      });

      // Listen for messages
      newSocket.on('message', (data) => {
        addNotification({
          id: `message-${Date.now()}`,
          type: 'message',
          title: 'New Message',
          message: data.message,
          timestamp: new Date(),
          read: false,
          data,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    socket,
    isConnected,
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
