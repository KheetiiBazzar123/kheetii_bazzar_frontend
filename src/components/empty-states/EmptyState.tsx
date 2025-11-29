'use client';

import React from 'react';
import { 
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  InboxIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export type EmptyStateType = 
  | 'no-products' 
  | 'no-orders' 
  | 'no-results' 
  | 'no-data' 
  | 'no-users'
  | 'error';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  message,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  const config = {
    'no-products': {
      icon: <ShoppingBagIcon className="h-16 w-16" />,
      defaultTitle: 'No Products Yet',
      defaultMessage: 'Get started by adding your first product',
      defaultAction: 'Add Product',
      color: 'text-blue-500',
    },
    'no-orders': {
      icon: <DocumentTextIcon className="h-16 w-16" />,
      defaultTitle: 'No Orders Found',
      defaultMessage: 'Orders will appear here once customers start purchasing',
      defaultAction: 'View Products',
      color: 'text-green-500',
    },
    'no-results': {
      icon: <MagnifyingGlassIcon className="h-16 w-16" />,
      defaultTitle: 'No Results Found',
      defaultMessage: 'Try adjusting your search or filters',
      defaultAction: 'Clear Filters',
      color: 'text-purple-500',
    },
    'no-data': {
      icon: <InboxIcon className="h-16 w-16" />,
      defaultTitle: 'No Data Available',
      defaultMessage: 'There is nothing to display at the moment',
      defaultAction: undefined,
      color: 'text-gray-500',
    },
    'no-users': {
      icon: <UserGroupIcon className="h-16 w-16" />,
      defaultTitle: 'No Users Found',
      defaultMessage: 'Users will appear here once they register',
      defaultAction: undefined,
      color: 'text-indigo-500',
    },
    'error': {
      icon: <ExclamationTriangleIcon className="h-16 w-16" />,
      defaultTitle: 'Something Went Wrong',
      defaultMessage: 'We encountered an error loading this content',
      defaultAction: 'Try Again',
      color: 'text-red-500',
    },
  };

  const currentConfig = config[type];
  const displayIcon = icon || currentConfig.icon;
  const displayTitle = title || currentConfig.defaultTitle;
  const displayMessage = message || currentConfig.defaultMessage;
  const displayAction = actionLabel || currentConfig.defaultAction;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className={`mb-6 ${currentConfig.color}`}>
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>

      {/* Message */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        {displayMessage}
      </p>

      {/* Action Button */}
      {displayAction && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 min-h-[44px]"
        >
          {displayAction}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
