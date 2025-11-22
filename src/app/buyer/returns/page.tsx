'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function ReturnsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await apiService.getMyReturns();
      if (response.success && response.data) {
        setReturns(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      console.error('Error fetching returns:', error);
      toast.error(t('common.error'));
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockIcon className="h-5 w-5" />,
      approved: <CheckCircleIcon className="h-5 w-5" />,
      rejected: <XCircleIcon className="h-5 w-5" />,
    };
    return icons[status as keyof typeof icons] || <ClockIcon className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <DashboardLayout title={t('returns.title')} subtitle={t('common.loading')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('returns.title')}
      subtitle={`${returns.length} ${t('common.itemsFound', { count: returns.length })}`}
    >
      <div className="max-w-5xl mx-auto">
        {returns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ArrowPathIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('returns.noReturns')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('returns.noReturnsDescription')}
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push('/buyer/orders')}
                  className="btn-primary"
                >
                  {t('orders.myOrders')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {returns.map((returnItem) => (
              <Card key={returnItem._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('returns.orderNumber')}: {returnItem.orderNumber || returnItem.order}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('returns.reason')}: {returnItem.reason}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnItem.status)}`}>
                      {getStatusIcon(returnItem.status)}
                      {t(`returns.status${returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}`)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{returnItem.description}</p>
                    <p className="mt-2">{t('common.date')}: {new Date(returnItem.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
