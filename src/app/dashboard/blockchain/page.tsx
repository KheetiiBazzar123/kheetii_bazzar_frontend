'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { BlockchainTransaction } from '@/types';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import BlockchainTransactionComponent from '@/components/BlockchainTransaction';
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/use-toast';


export default function BlockchainPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifyingTx, setVerifyingTx] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await apiService.getBlockchainTransactions({
        page: 1,
        limit: 50,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const handleVerify = async (txId: string) => {
    setVerifyingTx(txId);
    try {
      const response = await apiService.verifyTransaction(txId);
      
      if (response.success) {
        // Refresh transactions to get updated data
        await fetchTransactions();
        
        toast({
          title: 'Verification Complete',
          description: 'Transaction has been verified on the blockchain',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      toast({
        title: 'Verification Failed',
        description: 'Unable to verify transaction',
        variant: 'destructive',
      });
    } finally {
      setVerifyingTx(null);
    }
  };

  const handleViewDetails = (txId: string) => {
    // TODO: Implement transaction details modal/page
    console.log('View details for transaction:', txId);
  };

  const filteredTransactions = transactions.filter(tx => 
    statusFilter === 'all' || tx.status === statusFilter
  );

  const getStatusStats = () => {
    const stats = {
      total: transactions.length,
      confirmed: transactions.filter(tx => tx.status === 'confirmed').length,
      pending: transactions.filter(tx => tx.status === 'pending').length,
      failed: transactions.filter(tx => tx.status === 'failed').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const totalValue = transactions
    .filter(tx => tx.status === 'confirmed')
    .reduce((sum, tx) => sum + tx.order.totalAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blockchain Transactions</h1>
            <p className="text-gray-600 mt-2">View and verify blockchain transactions for your orders</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter} className="w-48">
              <SelectValue placeholder="Filter by status" />
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(totalValue / 1000000).toFixed(2)} ALGO
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              <span>Blockchain Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                  <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Algorand Network</h3>
                <p className="text-sm text-gray-600">
                  All transactions are secured on the Algorand blockchain for maximum security and transparency.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Finality</h3>
                <p className="text-sm text-gray-600">
                  Transactions are finalized in seconds with no risk of forks or double-spending.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                  <LinkIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparent</h3>
                <p className="text-sm text-gray-600">
                  All transactions are publicly verifiable on the Algorand explorer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No transactions yet' : `No ${statusFilter} transactions`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'Blockchain transactions will appear here when orders are placed'
                  : `No transactions with ${statusFilter} status found`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTransactions.map((transaction, index) => (
              <BlockchainTransactionComponent
                key={transaction._id}
                transaction={transaction}
                onVerify={handleVerify}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
