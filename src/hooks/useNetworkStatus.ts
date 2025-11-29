'use client';

import { useState, useEffect } from 'react';

export interface NetworkStatus {
  online: boolean;
  downlink?: number; // Mbps
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'; 
  saveData?: boolean;
}

export const useOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export const useNetworkStatus = (): NetworkStatus => {
  const isOnline = useOnline();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: isOnline,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    const updateNetworkStatus = () => {
      setNetworkStatus({
        online: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData,
      });
    };

    // Initial update
    updateNetworkStatus();

    // Listen for connection changes
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [isOnline]);

  return networkStatus;
};
