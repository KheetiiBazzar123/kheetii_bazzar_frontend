'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import showToast from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  pendingPayouts: number;
  availableBalance: number;
  monthlyBreakdown: Array<{
    month: string;
    earnings: number;
    orders: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: 'sale' | 'payout' | 'refund';
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'processing';
  }>;
}

function EarningsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

 useEffect(() => {
  fetchEarningsData();
}, []);

  const fetchEarningsData = async () => {
  setLoading(true);
  try {
    const response = await apiService.getFarmerEarnings();

    if (response.success && response.data) {
      const apiData = response.data;

      const mappedData: EarningsData = {
        totalEarnings: apiData.orders.totalRevenue,
        thisMonth: apiData.monthlyEarnings.length
          ? apiData.monthlyEarnings[apiData.monthlyEarnings.length - 1].earnings
          : 0,
        lastMonth: apiData.monthlyEarnings.length > 1
          ? apiData.monthlyEarnings[apiData.monthlyEarnings.length - 2].earnings
          : 0,
        growth:
          apiData.monthlyEarnings.length > 1
            ? Number((
                ((apiData.monthlyEarnings[apiData.monthlyEarnings.length - 1].earnings -
                  apiData.monthlyEarnings[apiData.monthlyEarnings.length - 2].earnings) /
                  apiData.monthlyEarnings[apiData.monthlyEarnings.length - 2].earnings) *
                100
              ).toFixed(2))
            : 0,
        pendingPayouts: apiData.orders.pendingOrders,
        availableBalance: apiData.orders.totalRevenue,
        monthlyBreakdown: apiData.monthlyEarnings.map(item => ({
          month: `${item._id.month}/${item._id.year}`,
          earnings: item.earnings,
          orders: 0, // backend doesn’t send order count per month
        })),
        recentTransactions: [], // if backend adds this later
      };

      setEarnings(mappedData);
    } else {
      console.error('API Error:', response.message);
    }
  } catch (error) {
    console.error('Error fetching earnings:', error);
  } finally {
    setLoading(false);
  }
};




  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      case 'payout': return <BanknotesIcon className="h-5 w-5 text-blue-600" />;
      case 'refund': return <CurrencyDollarIcon className="h-5 w-5 text-red-600" />;
      primary: return <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600';
      case 'payout': return 'text-blue-600';
      case 'refund': return 'text-red-600';
      primary: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title={t('farmer.earnings.title')}
        subtitle={t('common.loading')}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!earnings) {
    return (
      <DashboardLayout
        title={t('farmer.earnings.title')}
        subtitle={t('farmer.earnings.noEarningsDescription')}
      >
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('farmer.earnings.noEarnings')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Earnings data will appear here once you start making sales.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('farmer.earnings.title')}
      subtitle={t('farmer.earnings.subtitle')}
      actions={
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="week">{t('common.thisWeek')}</option>
            <option value="month">{t('farmer.earnings.thisMonth')}</option>
            <option value="quarter">{t('common.thisQuarter')}</option>
            <option value="year">{t('common.thisYear')}</option>
          </select>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('farmer.earnings.totalEarnings')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${earnings.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('farmer.earnings.thisMonth')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${earnings.thisMonth.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 ml-1">
                      +{earnings.growth}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('farmer.earnings.availableBalance')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${earnings.availableBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('farmer.earnings.pendingPayouts')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${earnings.pendingPayouts.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                {t('farmer.earnings.latestEarnings')}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {t('farmer.earnings.export')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earnings.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'sale' ? '+' : ''}${transaction.amount.toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Earnings Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>{t('farmer.earnings.earningsTrend')}</CardTitle>
            <CardDescription>
              {t('farmer.earnings.monthlyBreakdown')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">{t('farmer.earnings.chartVisualization')}</p>
                <p className="text-xs text-gray-400">{t('farmer.earnings.integrationNeeded')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withFarmerProtection(EarningsPage);
