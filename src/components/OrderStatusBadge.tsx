'use client';

import React from 'react';
import { CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon, CubeIcon, PackageIcon } from '@heroicons/react/24/outline';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}> = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Pending'
  },
  confirmed: {
    icon: CheckCircleIcon,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Confirmed'
  },
  preparing: {
    icon: CubeIcon,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    label: 'Preparing'
  },
  shipped: {
    icon: TruckIcon,
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    label: 'Shipped'
  },
  delivered: {
    icon: PackageIcon,
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Delivered'
  },
  cancelled: {
    icon: XCircleIcon,
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Cancelled'
  }
};

export default function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color} ${className}`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

// Export status config for use in other components
export { statusConfig };
export type { OrderStatus };
