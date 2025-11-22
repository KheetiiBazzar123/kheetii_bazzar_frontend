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
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  TableCellsIcon,
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
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  buyer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function BillingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalRevenue: 0,
    totalDue: 0,
  });
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getFarmerBills();
      if (response.success && response.data) {
        setBills(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
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
      totalRevenue: billsData.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0),
      totalDue: billsData.filter(b => ['issued', 'overdue', 'partially_paid'].includes(b.status)).reduce((sum, b) => sum + b.dueAmount, 0),
    };
    setStats(stats);
  };

  const handleDownloadPDF = async (billId: string) => {
    setDownloading(billId);
    try {
      await apiClient.downloadFarmerBillPDF(billId);
      // The download will be handled by the browser
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error downloading invoice');
    } finally {
      setDownloading(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await apiClient.exportFarmerBillsCSV();
      // The download will be handled by the browser
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error exporting bills');
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
      <DashboardLayout title="Billing & Invoices" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Billing & Invoices"
      subtitle="View your billing history and download invoices"
      actions={
        <Button onClick={handleExportCSV} disabled={exporting} variant="outline">
          <TableCellsIcon className="h-5 w-5 mr-2" />
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bills</p>
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
                  <p className="text-sm text-gray-600">Paid</p>
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <CurrencyRupeeIcon className="h-10 w-10 text-green-500" />
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
                <CurrencyRupeeIcon className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No billing history yet</p>
                <p className="text-sm text-gray-500">Your bills will appear here after orders are completed</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Invoice #</th>
                      <th className="text-left p-3">Billing Cycle</th>
                      <th className="text-left p-3">Period</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-right p-3">Paid</th>
                      <th className="text-right p-3">Due</th>
                      <th className="text-left p-3">Due Date</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map(bill => (
                      <tr key={bill._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-mono text-sm font-medium">{bill.billNumber}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{formatCycle(bill.billingCycle, bill.cycleNumber)}</span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-gray-600">
                            <div>{new Date(bill.cycleStartDate).toLocaleDateString()}</div>
                            <div className="text-xs">to {new Date(bill.cycleEndDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-semibold">₹{bill.totalAmount.toLocaleString()}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-green-600">₹{bill.paidAmount.toLocaleString()}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-orange-600">₹{bill.dueAmount.toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(bill.dueDate).toLocaleDateString()}
                          </div>
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
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">About Billing</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Bills are automatically generated based on your selected billing cycle</li>
                  <li>• Download PDF invoices for your records or accounting</li>
                  <li>• Export all billing data to CSV for analysis</li>
                  <li>• Payment is processed automatically for completed orders</li>
                  <li>• Contact support if you have questions about any bill</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withFarmerProtection(BillingPage);
