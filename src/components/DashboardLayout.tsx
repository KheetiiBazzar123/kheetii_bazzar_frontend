'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sidebar - Always visible on large screens */}
      <div className="hidden lg:block">
        <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
        {/* Desktop header */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                {subtitle && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-4">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
