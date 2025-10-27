'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
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
            ? (
                ((apiData.monthlyEarnings[apiData.monthlyEarnings.length - 1].earnings -
                  apiData.monthlyEarnings[apiData.monthlyEarnings.length - 2].earnings) /
                  apiData.monthlyEarnings[apiData.monthlyEarnings.length - 2].earnings) *
                100
              ).toFixed(2)
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


  // const fetchEarningsData = async () => {
  //   setLoading(true);
  //   try {
  //     // TODO: Implement API call to fetch earnings data
  //     await new Promise(resolve => setTimeout(resolve, 1000));
      
  //     const mockData: EarningsData = {
  //       totalEarnings: 15420.50,
  //       thisMonth: 2850.75,
  //       lastMonth: 2420.30,
  //       growth: 17.8,
  //       pendingPayouts: 450.25,
  //       availableBalance: 2400.50,
  //       monthlyBreakdown: [
  //         { month: 'Jan', earnings: 1200, orders: 8 },
  //         { month: 'Feb', earnings: 1350, orders: 9 },
  //         { month: 'Mar', earnings: 1420, orders: 10 },
  //         { month: 'Apr', earnings: 1580, orders: 11 },
  //         { month: 'May', earnings: 1650, orders: 12 },
  //         { month: 'Jun', earnings: 1720, orders: 13 }
  //       ],
  //       recentTransactions: [
  //         {
  //           id: '1',
  //           amount: 125.50,
  //           type: 'sale',
  //           description: 'Order #ORD-2024-001 - Organic Tomatoes',
  //           date: '2024-01-15T10:30:00Z',
  //           status: 'completed'
  //         },
  //         {
  //           id: '2',
  //           amount: 89.75,
  //           type: 'sale',
  //           description: 'Order #ORD-2024-002 - Fresh Carrots',
  //           date: '2024-01-14T14:20:00Z',
  //           status: 'completed'
  //         },
  //         {
  //           id: '3',
  //           amount: 2400.50,
  //           type: 'payout',
  //           description: 'Monthly payout to bank account',
  //           date: '2024-01-01T09:00:00Z',
  //           status: 'completed'
  //         }
  //       ]
  //     };
      
  //     setEarnings(mockData);
  //   } catch (error) {
  //     console.error('Error fetching earnings data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        title="Earnings"
        subtitle="Loading earnings data..."
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
        title="Earnings"
        subtitle="Unable to load earnings data"
      >
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No earnings data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Earnings data will appear here once you start making sales.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Earnings Dashboard"
      subtitle="Track your farm's financial performance"
      actions={
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
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
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
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
                  <p className="text-sm font-medium text-gray-600">This Month</p>
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
                  <p className="text-sm font-medium text-gray-600">Available Balance</p>
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
                  <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
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
                  Your latest earnings and payouts
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
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
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>
              Monthly earnings breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Earnings chart visualization</p>
                <p className="text-xs text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withFarmerProtection(EarningsPage);
