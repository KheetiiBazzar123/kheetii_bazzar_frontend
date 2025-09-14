'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  UserGroupIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

function CustomerInsightsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch customer insights data
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Customer Insights"
        subtitle="Loading customer insights data..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Customer Insights"
      subtitle="Understand your customer base and behavior"
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
            <CardTitle>Customer Analytics</CardTitle>
            <CardDescription>
              Insights into your customer demographics and purchasing behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Customer insights charts</p>
                <p className="text-xs text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withFarmerProtection(CustomerInsightsPage);
