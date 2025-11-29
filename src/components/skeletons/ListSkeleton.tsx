'use client';

import React from 'react';
import Skeleton from './Skeleton';

export interface ListSkeletonProps {
  count?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 5,
  showAvatar = true,
  showActions = true,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4"
        >
          {/* Avatar */}
          {showAvatar && (
            <Skeleton variant="circular" width={48} height={48} />
          )}

          {/* Content */}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="80%" />
          </div>

          {/* Actions */}
          {showActions && (
            <Skeleton variant="rectangular" width={80} height={36} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
