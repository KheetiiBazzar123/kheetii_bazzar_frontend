'use client';

import React, { useState, useEffect } from 'react';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

function AdminBillingPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, payoutsRes] = await Promise.allSettled([
        apiService.getFinancialStats(),
        apiService.getPayouts({ page, limit: 10 })
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      } else {
        // Mock stats
        setStats({
          totalRevenue: 1250000,
          pendingPayouts: 45000,
          commissionEarned: 125000,
          processedPayouts: 850000
        });
      }

      if (payoutsRes.status === 'fulfilled' && payoutsRes.value.success) {
        setPayouts(payoutsRes.value.data);
        setTotalPages(payoutsRes.value.pages);
      } else {
        // Mock payouts
        setPayouts([
          {
            _id: 'p1',
            farmerName: 'Ramesh Kumar',
            amount: 15000,
            status: 'pending',
            date: new Date().toISOString(),
            bankDetails: 'HDFC **** 1234'
          },
          {
            _id: 'p2',
            farmerName: 'Suresh Patel',
            amount: 8500,
            status: 'processed',
            date: new Date(Date.now() - 86400000).toISOString(),
            bankDetails: 'SBI **** 5678'
          },
          {
            _id: 'p3',
            farmerName: 'Anita Singh',
            amount: 22000,
            status: 'rejected',
            date: new Date(Date.now() - 172800000).toISOString(),
            bankDetails: 'ICICI **** 9012'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'reject') => {
    const notes = action === 'reject' ? prompt('Enter rejection reason:') : undefined;
    if (action === 'reject' && !notes) return;

    if (!confirm(`Are you sure you want to ${action} this payout?`)) return;

    try {
      await apiService.processPayout(payoutId, action, notes || undefined);
      alert(`Payout ${action}ed successfully!`);
      fetchData();
    } catch (error) {
      alert(`Failed to ${action} payout`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout title="Billing & Finance" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Billing & Finance"
      subtitle="Manage platform revenue and payouts"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <BanknotesIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <CreditCardIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commission Earned</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.commissionEarned || 0)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                <ClockIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Payouts</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.pendingPayouts || 0)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <DocumentTextIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Processed Payouts</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.processedPayouts || 0)}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {payouts.map((payout) => (
                    <tr key={payout._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{payout.farmerName}</div>
                        <div className="text-sm text-gray-500">{payout.bankDetails}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payout.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                          {payout.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payout.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePayoutAction(payout._id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handlePayoutAction(payout._id, 'reject')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminBillingPage);
