'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { calculatePasswordStrength, type PasswordStrength as PasswordStrengthType } from '@/lib/validation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

export interface PasswordStrengthProps {
  password: string;
  showCriteria?: boolean;
  className?: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showCriteria = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  const barWidth = `${(strength.score / 5) * 100}%`;

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('validation.passwordStrength')}
          </span>
          <span 
            className="text-sm font-semibold"
            style={{ color: strength.color }}
          >
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: barWidth }}
            transition={{ duration: 0.3 }}
            className="h-full rounded-full"
            style={{ backgroundColor: strength.color }}
          />
        </div>
      </div>

      {/* Criteria Checklist */}
      {showCriteria && (
        <div className="space-y-1">
          <CriteriaItem 
            met={strength.criteria.minLength}
            text={t('validation.minLength8')}
          />
          <CriteriaItem 
            met={strength.criteria.hasUppercase}
            text={t('validation.hasUppercase')}
          />
          <CriteriaItem 
            met={strength.criteria.hasLowercase}
            text={t('validation.hasLowercase')}
          />
          <CriteriaItem 
            met={strength.criteria.hasNumber}
            text={t('validation.hasNumber')}
          />
          <CriteriaItem 
            met={strength.criteria.hasSpecial}
            text={t('validation.hasSpecial')}
          />
        </div>
      )}
    </div>
  );
};

const CriteriaItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
    )}
    <span className={met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
      {text}
    </span>
  </div>
);

export default PasswordStrength;
