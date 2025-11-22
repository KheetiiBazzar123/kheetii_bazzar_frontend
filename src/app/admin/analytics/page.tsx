'use client';

import React, { useState, useEffect } from 'react';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [revenue, users, products] = await Promise.allSettled([
        apiService.getRevenueAnalytics({ period }),
        apiService.getUserGrowthAnalytics({ period }),
        apiService.getProductAnalytics()
      ]);

      if (revenue.status === 'fulfilled' && revenue.value.success) {
        setRevenueData(revenue.value.data);
      } else {
        // Mock Revenue Data
        setRevenueData([
          { name: 'Jan', revenue: 4000, orders: 240 },
          { name: 'Feb', revenue: 3000, orders: 139 },
          { name: 'Mar', revenue: 2000, orders: 980 },
          { name: 'Apr', revenue: 2780, orders: 390 },
          { name: 'May', revenue: 1890, orders: 480 },
          { name: 'Jun', revenue: 2390, orders: 380 },
          { name: 'Jul', revenue: 3490, orders: 430 },
        ]);
      }

      if (users.status === 'fulfilled' && users.value.success) {
        setUserGrowthData(users.value.data);
      } else {
        // Mock User Growth Data
        setUserGrowthData([
          { name: 'Jan', farmers: 40, buyers: 240 },
          { name: 'Feb', farmers: 30, buyers: 139 },
          { name: 'Mar', farmers: 20, buyers: 980 },
          { name: 'Apr', farmers: 27, buyers: 390 },
          { name: 'May', farmers: 18, buyers: 480 },
          { name: 'Jun', farmers: 23, buyers: 380 },
          { name: 'Jul', farmers: 34, buyers: 430 },
        ]);
      }

      if (products.status === 'fulfilled' && products.value.success) {
        setProductData(products.value.data);
      } else {
        // Mock Product Data
        setProductData([
          { name: 'Wheat', sales: 4000 },
          { name: 'Rice', sales: 3000 },
          { name: 'Corn', sales: 2000 },
          { name: 'Potatoes', sales: 2780 },
          { name: 'Tomatoes', sales: 1890 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Platform Analytics"
      subtitle="Detailed insights and performance metrics"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Controls */}
        <div className="flex justify-end">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-40"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="farmers" stroke="#F59E0B" />
                  <Line type="monotone" dataKey="buyers" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminAnalyticsPage);
