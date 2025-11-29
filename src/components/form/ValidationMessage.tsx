'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

export interface ValidationMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
  show?: boolean;
  className?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  show = true,
  className = ''
}) => {
  const icons = {
    error: <ExclamationCircleIcon className="h-4 w-4" />,
    success: <CheckCircleIcon className="h-4 w-4" />,
    info: <InformationCircleIcon className="h-4 w-4" />
  };

  const colors = {
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-1 mt-1 text-sm ${colors[type]} ${className}`}
        >
          {icons[type]}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ValidationMessage;
