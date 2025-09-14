'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

interface RouteProtectionProps {
  children: React.ReactNode;
  allowedRoles?: ('farmer' | 'buyer')[];
  redirectTo?: string;
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  allowedRoles,
  redirectTo = '/auth/login'
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        if (user.role === 'farmer') {
          router.push('/farmer/dashboard');
        } else if (user.role === 'buyer') {
          router.push('/buyer/marketplace');
        } else {
          router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center">
          <div className="spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// HOC for protecting farmer routes
export const withFarmerProtection = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <RouteProtection allowedRoles={['farmer']}>
      <Component {...props} />
    </RouteProtection>
  );
};

// HOC for protecting buyer routes
export const withBuyerProtection = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <RouteProtection allowedRoles={['buyer']}>
      <Component {...props} />
    </RouteProtection>
  );
};

// HOC for protecting both farmer and buyer routes
export const withAuthProtection = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <RouteProtection allowedRoles={['farmer', 'buyer']}>
      <Component {...props} />
    </RouteProtection>
  );
};
