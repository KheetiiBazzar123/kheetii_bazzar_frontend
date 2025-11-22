'use client';

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';

interface TimelineStep {
  label: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

interface OrderTimelineProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  className?: string;
}

export default function OrderTimeline({ status, createdAt, className = '' }: OrderTimelineProps) {
  const steps: TimelineStep[] = [
    {
      label: 'Order Placed',
      timestamp: createdAt,
      completed: true,
      current: status === 'pending'
    },
    {
      label: 'Confirmed',
      completed: ['confirmed', 'preparing', 'shipped', 'delivered'].includes(status),
      current: status === 'confirmed'
    },
    {
      label: 'Preparing',
      completed: ['preparing', 'shipped', 'delivered'].includes(status),
      current: status === 'preparing'
    },
    {
      label: 'Shipped',
      completed: ['shipped', 'delivered'].includes(status),
      current: status === 'shipped'
    },
    {
      label: 'Delivered',
      completed: status === 'delivered',
      current: status === 'delivered'
    }
  ];

  if (status === 'cancelled') {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/10 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.label} className="relative pb-8 last:pb-0">
            {index < steps.length - 1 && (
              <div
                className={`absolute left-4 top-8 h-full w-0.5 ${
                  step.completed
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            )}
            
            <div className="relative flex items-start gap-4">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step.completed
                    ? 'bg-green-500 dark:bg-green-600'
                    : step.current
                    ? 'bg-blue-500 dark:bg-blue-600 animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                ) : (
                  <ClockIcon className="h-4 w-4 text-white" />
                )}
              </div>
              
              <div className="flex-1 pt-0.5">
                <p
                  className={`text-sm font-medium ${
                    step.current
                      ? 'text-blue-600 dark:text-blue-400'
                      : step.completed
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
