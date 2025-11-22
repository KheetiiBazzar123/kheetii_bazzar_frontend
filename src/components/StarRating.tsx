'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showCount = false,
  count,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.floor(rating);
        const isHalf = starValue === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
              isFilled || isHalf ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            aria-label={`Rate ${starValue} stars`}
          >
            {isFilled ? (
              <StarIcon className={sizeClasses[size]} />
            ) : isHalf ? (
              <div className="relative">
                <StarOutlineIcon className={sizeClasses[size]} />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: '50%' }}
                >
                  <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
                </div>
              </div>
            ) : (
              <StarOutlineIcon className={sizeClasses[size]} />
            )}
          </button>
        );
      })}
      {showCount && count !== undefined && (
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          ({count})
        </span>
      )}
    </div>
  );
}
