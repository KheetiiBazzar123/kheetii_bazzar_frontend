'use client';

import React from 'react';
import Skeleton from './Skeleton';

export interface ProductCardSkeletonProps {
  count?: number;
  className?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  count = 1,
  className = '',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}
        >
          {/* Image */}
          <Skeleton variant="rectangular" height={192} />
          
          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <Skeleton variant="text" width="80%" height={24} />
            
            {/* Description */}
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="60%" />
            
            {/* Price */}
            <div className="flex justify-between items-center mt-4">
              <Skeleton variant="text" width={80} height={28} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductCardSkeleton;
