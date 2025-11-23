'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import showToast from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiService } from '@/services/api';
import { 
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface PaymentMethod {
  _id: string;
  type: 'card' | 'bank' | 'wallet';
  last4: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface Transaction {
  _id: string;
  orderNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  description: string;
  transactionId: string;
}

function PaymentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'methods' | 'transactions'>('methods');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBuyerPayments();
      if (response.success) {
        // Assuming backend returns { paymentMethods: [], transactions: [] }
        // If not, we might need separate calls or adjust the backend
        // For now, let's assume the API returns what we need or we handle it gracefully
        const data = response.data as any;
        setPaymentMethods(data.paymentMethods || []);
        setTransactions(data.transactions || []);
      } else {
        setPaymentMethods([]);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setPaymentMethods([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'refunded': return <BanknotesIcon className="h-5 w-5 text-blue-600" />;
      primary: return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      primary: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCardIcon className="h-6 w-6 text-blue-600" />;
      case 'bank': return <BanknotesIcon className="h-6 w-6 text-green-600" />;
      case 'wallet': return <CreditCardIcon className="h-6 w-6 text-purple-600" />;
      primary: return <CreditCardIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <DashboardLayout
        title="Payments"
        subtitle="Loading payment information..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Payment Center"
      subtitle="Manage your payment methods and transaction history"
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back to Marketplace
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Refunded</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRefunded.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Payment Methods</p>
                  <p className="text-2xl font-bold text-gray-900">{paymentMethods.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('methods')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'methods'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transaction History
              </button>
            </nav>
          </div>
        </div>

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <Button className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Payment Method
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((method) => (
                <Card key={method._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {method.brand || method.bankName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            **** **** **** {method.last4}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    {method.expiryMonth && method.expiryYear && (
                      <p className="text-sm text-gray-600 mb-4">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>

            <Card>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your transaction history will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <div key={transaction._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(transaction.status)}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {transaction.description}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {transaction.orderNumber} • {transaction.paymentMethod}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${transaction.amount.toFixed(2)}
                            </p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withBuyerProtection(PaymentsPage);
