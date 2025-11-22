'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

function AnalyticsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch both stats and earnings data
      const [statsResponse, earningsResponse] = await Promise.all([
        apiClient.getFarmerStats(),
        apiClient.getFarmerEarnings()
      ])  
      
      if (statsResponse.success && earningsResponse.success) {
        const stats = statsResponse.data;
        const earnings = earningsResponse.data;
        
        // Transform backend data to frontend format
        const analyticsData: AnalyticsData = {
          totalRevenue: earnings?.orders?.totalRevenue || 0,
          totalOrders: stats.totalOrders || 0,
          totalProducts: stats.totalProducts || 0,
          averageOrderValue: stats.totalOrders > 0 
            ? (earnings?.orders?.totalRevenue || 0) / stats.totalOrders 
            : 0,
          revenueGrowth: 0,  // Calculate if historical data available
          orderGrowth: 0,    // Calculate if historical data available
          topProducts: stats.topProducts || [],
          monthlyRevenue: earnings?.monthlyEarnings?.map((item: any) => ({
            month: `${item._id.month}/${item._id.year}`,
            revenue: item.earnings,
            orders: 0  // Backend doesn't provide this
          })) || []
        };
        
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data on error
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Loading analytics data..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Unable to load analytics data"
      >
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics data will appear here once you start receiving orders.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('farmer.analytics.title')}
      subtitle={t('farmer.analytics.subtitle')}
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 ml-1">
                      +{analytics.revenueGrowth}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 ml-1">
                      +{analytics.orderGrowth}%
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
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/farmer/analytics/sales">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
                    <p className="text-sm text-gray-600">Detailed sales analysis and trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/analytics/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
                    <p className="text-sm text-gray-600">Track individual product metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/analytics/customers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <EyeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
                    <p className="text-sm text-gray-600">Understand your customer base</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Top Products */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>
              Your best-selling products this {timeRange}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                    <div className="flex items-center">
                      {product.growth > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ml-1 ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.growth > 0 ? '+' : ''}{product.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue and order trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chart visualization would go here</p>
                <p className="text-xs text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withFarmerProtection(AnalyticsPage);
