'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiIcon, 
  SignalIcon,
  SignalSlashIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';

const NetworkIndicator: React.FC = () => {
  const { t } = useTranslation();
  const networkStatus = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Track when going offline
    if (!networkStatus.online) {
      setWasOffline(true);
    }

    // Show reconnection message when coming back online
    if (networkStatus.online && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [networkStatus.online, wasOffline]);

  const getConnectionQuality = () => {
    if (!networkStatus.online) return 'offline';
    if (!networkStatus.effectiveType) return 'good';
    
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'poor';
      case '3g':
        return 'fair';
      case '4g':
        return 'good';
      default:
        return 'good';
    }
  };

  const quality = getConnectionQuality();

  const qualityConfig = {
    offline: {
      icon: SignalSlashIcon,
      color: 'bg-red-500',
      text: t('network.offline', 'Offline'),
      textColor: 'text-red-700',
    },
    poor: {
      icon: SignalIcon,
      color: 'bg-red-500',
      text: t('network.poorConnection', 'Poor Connection'),
      textColor: 'text-red-700',
    },
    fair: {
      icon: SignalIcon,
      color: 'bg-yellow-500',
      text: t('network.slowConnection', 'Slow Connection'),
      textColor: 'text-yellow-700',
    },
    good: {
      icon: WifiIcon,
      color: 'bg-green-500',
      text: t('network.online', 'Online'),
      textColor: 'text-green-700',
    },
  };

  const config = qualityConfig[quality];
  const Icon = config.icon;

  // Show reconnected message
  if (showReconnected) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-medium">{t('network.backOnline', 'Back Online')}</span>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Only show indicator when offline or poor connection
  if (quality === 'good') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
      >
        <div className={`${config.color} p-1 rounded-full`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className={`text-sm font-medium ${config.textColor} dark:text-gray-200`}>
          {config.text}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default NetworkIndicator;
