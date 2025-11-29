'use client';

import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';

export interface ResponsiveTableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any, index: number) => ReactNode;
  renderMobileCard: (item: any, index: number) => ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  data,
  renderRow,
  renderMobileCard,
  className = ''
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile: Card Layout
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            {renderMobileCard(item, index)}
          </div>
        ))}
      </div>
    );
  }

  // Desktop/Tablet: Table Layout
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;
