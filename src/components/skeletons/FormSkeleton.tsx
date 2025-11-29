'use client';

import React from 'react';
import Skeleton from './Skeleton';

export interface FormSkeletonProps {
  fields?: number;
  showButton?: boolean;
  className?: string;
}

const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  showButton = true,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          {/* Label */}
          <Skeleton variant="text" width={120} height={16} />
          
          {/* Input */}
          <Skeleton variant="rectangular" height={48} />
        </div>
      ))}

      {/* Submit Button */}
      {showButton && (
        <Skeleton variant="rectangular" width={120} height={44} className="mt-6" />
      )}
    </div>
  );
};

export default FormSkeleton;
