'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';

const DarkModeTest: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Dark Mode Test
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Current theme: <span className="font-bold">{theme}</span>
      </p>
      <div className="space-y-2">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-gray-900 dark:text-gray-100">This should change color</p>
        </div>
        <Button onClick={toggleTheme} variant="outline">
          Toggle Theme
        </Button>
      </div>
    </div>
  );
};

export default DarkModeTest;
