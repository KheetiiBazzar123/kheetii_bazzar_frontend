'use client';

import React from 'react';
import { 
  ExclamationTriangleIcon, 
  WifiIcon,
  ServerIcon,
  ShieldExclamationIcon 
} from '@heroicons/react/24/outline';
import RetryButton from './RetryButton';
import { useTranslation } from 'react-i18next';

export interface ErrorStateProps {
  type?: 'network' | 'server' | 'notFound' | 'forbidden' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<void>;
  showRetry?: boolean;
  actionButton?: React.ReactNode;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  showRetry = true,
  actionButton,
  className = '',
}) => {
  const { t } = useTranslation();

  const errorConfig = {
    network: {
      icon: WifiIcon,
      defaultTitle: t('errors.networkError', 'Network Error'),
      defaultMessage: t('errors.networkMessage', 'Unable to connect. Please check your internet connection and try again.'),
      iconColor: 'text-orange-500',
    },
    server: {
      icon: ServerIcon,
      defaultTitle: t('errors.serverError', 'Server Error'),
      defaultMessage: t('errors.serverMessage', 'Something went wrong on our end. Please try again later.'),
      iconColor: 'text-red-500',
    },
    notFound: {
      icon: ExclamationTriangleIcon,
      defaultTitle: t('errors.notFound', 'Not Found'),
      defaultMessage: t('errors.notFoundMessage', 'The resource you are looking for does not exist.'),
      iconColor: 'text-yellow-500',
    },
    forbidden: {
      icon: ShieldExclamationIcon,
      defaultTitle: t('errors.forbidden', 'Access Denied'),
      defaultMessage: t('errors.forbiddenMessage', 'You do not have permission to access this resource.'),
      iconColor: 'text-red-500',
    },
    generic: {
      icon: ExclamationTriangleIcon,
      defaultTitle: t('errors.genericError', 'Error'),
      defaultMessage: t('errors.genericMessage', 'Something went wrong. Please try again.'),
      iconColor: 'text-red-500',
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className={`mb-4 ${config.iconColor}`}>
        <Icon className="h-16 w-16" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title || config.defaultTitle}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message || config.defaultMessage}
      </p>

      {showRetry && onRetry && (
        <RetryButton onRetry={onRetry} />
      )}

      {actionButton && (
        <div className="mt-4">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
