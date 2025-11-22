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
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

function ProductPerformancePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchProductData();
  }, []);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getFarmerProducts(1, 100);
      if (response.success && response.data) {
        setProductData(response.data);
      }
    } catch (error) {
      console.error('Error fetching product performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Product Performance"
        subtitle="Loading product performance data..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Product Performance"
      subtitle="Track individual product metrics and performance"
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back to Analytics
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Product Performance Metrics</CardTitle>
            <CardDescription>
              Detailed analysis of each product's sales and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Product performance charts</p>
                <p className="text-xs text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withFarmerProtection(ProductPerformancePage);
