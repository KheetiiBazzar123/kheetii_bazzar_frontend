'use client';

import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  loading = false,
  disabled = false,
  className = '',
  children,
}) => {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const isLoading = loading || isRetrying;

  return (
    <button
      onClick={handleRetry}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-blue-600 text-white rounded-lg
        hover:bg-blue-700 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      <ArrowPathIcon 
        className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} 
      />
      {children || t('errors.retry', 'Retry')}
    </button>
  );
};

export default RetryButton;
