'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiService } from '@/services/api';
import showToast from '@/lib/toast';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  TableCellsIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface Bill {
  _id: string;
  billNumber: string;
  billType: string;
  billingCycle: string;
  cycleNumber: number;
  cycleStartDate: Date;
  cycleEndDate: Date;
  subtotal: number;
  discount: number;
  couponDiscount?: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  farmer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  couponApplied?: {
    code: string;
  };
}

function BuyerBillingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalSpent: 0,
    totalDue: 0,
    couponSavings: 0,
  });
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBuyerBills();
      if (response.success && response.data) {
        setBills(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      showToast.error('Error fetching bills');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (billsData: Bill[]) => {
    const stats = {
      total: billsData.length,
      paid: billsData.filter(b => b.status === 'paid').length,
      pending: billsData.filter(b => b.status === 'issued').length,
      overdue: billsData.filter(b => b.status === 'overdue').length,
      totalSpent: billsData.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0),
      totalDue: billsData.filter(b => ['issued', 'overdue', 'partially_paid'].includes(b.status)).reduce((sum, b) => sum + b.dueAmount, 0),
      couponSavings: billsData.reduce((sum, b) => sum + (b.couponDiscount || 0), 0),
    };
    setStats(stats);
  };

  const handleDownloadPDF = async (billId: string) => {
    setDownloading(billId);
    try {
      await apiService.downloadBuyerBillPDF(billId);
      // The download will be handled by the browser
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      showToast.error(error.response?.data?.message || 'Error downloading invoice');
    } finally {
      setDownloading(null);
    }
  };

  const handleExportBills = async () => {
    setExporting(true);
    try {
      // Implement export logic
      await apiService.exportBuyerBillsCSV(); // Assuming this is the correct API call
      showToast.success('Bills exported successfully');
    } catch (error: any) {
      console.error('Error exporting bills:', error);
      showToast.error(error.response?.data?.message || 'Error exporting bills');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Paid
          </span>
        );
      case 'issued':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
      case 'partially_paid':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
            <ClockIcon className="h-4 w-4 mr-1" />
            Partially Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const formatCycle = (cycle: string, cycleNum: number) => {
    const cycleLabels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      transaction: 'Per Transaction',
    };
    return `${cycleLabels[cycle] || cycle} #${cycleNum}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="My Invoices" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('billing.myInvoices')}
      subtitle={t('billing.subtitle')}
      actions={
        <Button onClick={handleExportBills} disabled={exporting} variant="outline">
          <TableCellsIcon className="h-5 w-5 mr-2" />
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <DocumentTextIcon className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats.totalSpent.toLocaleString()}</p>
                </div>
                <CurrencyRupeeIcon className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Due</p>
                  <p className="text-2xl font-bold text-orange-600">₹{stats.totalDue.toLocaleString()}</p>
                </div>
                <ExclamationCircleIcon className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Coupon Savings</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.couponSavings.toLocaleString()}</p>
                </div>
                <TagIcon className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paid Invoices</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                </div>
                <ClockIcon className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>View and download your purchase invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No invoices yet</p>
                <p className="text-sm text-gray-500">Your purchase invoices will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Invoice #</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-right p-3">Subtotal</th>
                      <th className="text-right p-3">Discount</th>
                      <th className="text-right p-3">Tax</th>
                      <th className="text-right p-3">Total</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map(bill => (
                      <tr key={bill._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <span className="font-mono text-sm font-medium block">{bill.billNumber}</span>
                            {bill.couponApplied && (
                              <span className="inline-flex items-center text-xs text-green-600 mt-1">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {bill.couponApplied.code}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{new Date(bill.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm">₹{bill.subtotal.toLocaleString()}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm text-green-600">
                            -₹{((bill.discount || 0) + (bill.couponDiscount || 0)).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm">₹{bill.tax.toLocaleString()}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-semibold">₹{bill.totalAmount.toLocaleString()}</span>
                        </td>
                        <td className="p-3">{getStatusBadge(bill.status)}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(bill._id)}
                            disabled={downloading === bill._id}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            {downloading === bill._id ? 'Downloading...' : 'PDF'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Invoice Information</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Download PDF invoices for your records</li>
                  <li>• All discounts and coupon savings are clearly shown</li>
                  <li>• Export your purchase history to CSV for accounting</li>
                  <li>• Invoices are automatically generated for all purchases</li>
                  <li>• Keep track of your spending and savings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withBuyerProtection(BuyerBillingPage);
