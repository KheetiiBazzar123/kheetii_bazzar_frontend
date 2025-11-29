'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WifiIcon } from '@heroicons/react/24/outline';
import { useOnline } from '@/hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';

const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-3 shadow-lg"
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <WifiIcon className="h-5 w-5" />
        <p className="font-medium">
          {t('network.offlineMessage', 'You are currently offline. Some features may not be available.')}
        </p>
      </div>
    </motion.div>
  );
};

export default OfflineBanner;
