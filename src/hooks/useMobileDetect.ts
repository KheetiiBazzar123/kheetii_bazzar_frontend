'use client';

import { useState, useEffect } from 'react';

export interface MobileDetect {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isTouch: boolean;
}

export const useMobileDetect = (): MobileDetect => {
  const [mobileDetect, setMobileDetect] = useState<MobileDetect>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isTouch: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/i.test(userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    setMobileDetect({
      isMobile,
      isIOS,
      isAndroid,
      isTouch,
    });
  }, []);

  return mobileDetect;
};
