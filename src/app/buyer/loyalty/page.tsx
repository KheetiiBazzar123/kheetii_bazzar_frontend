'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TrophyIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function LoyaltyPage() {
  const { t } = useTranslation();
  const [account, setAccount] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const [accountRes, historyRes] = await Promise.all([
        apiService.getLoyaltyAccount(),
        apiService.getPointsHistory({ limit: 10 }),
      ]);

      if (accountRes.success && accountRes.data) {
        setAccount(accountRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      }
    } catch (error: any) {
      console.error('Error fetching loyalty data:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const points = prompt(t('loyalty.redeemPoints'));
    if (!points) return;

    try {
      const response = await apiService.redeemPoints(parseInt(points));
      if (response.success) {
        toast.success(t('loyalty.redeemSuccess'));
        fetchLoyaltyData();
      }
    } catch (error: any) {
      toast.error(error.message || t('common.error'));
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={t('loyalty.title')} subtitle={t('common.loading')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('loyalty.title')}
      subtitle={t('loyalty.currentTier') + ': ' + (account?.tier || 'Bronze')}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Points Balance Card */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('loyalty.availablePoints')}</p>
                <p className="text-5xl font-bold">{account?.availablePoints || 0}</p>
                <p className="mt-2 text-sm">{t('loyalty.tierBenefits')}</p>
              </div>
              <TrophyIcon className="h-24 w-24 opacity-50" />
            </div>
            <div className="mt-6">
              <Button
                onClick={handleRedeem}
                className="bg-white text-indigo-600 hover:bg-gray-100"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                {t('loyalty.redeemPoints')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Points History */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('loyalty.pointsHistory')}
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('loyalty.noHistoryDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-lg font-bold ${
                      transaction.type === 'earned' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
