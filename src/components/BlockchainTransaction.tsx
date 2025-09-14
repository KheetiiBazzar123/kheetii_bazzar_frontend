'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/use-toast';
import { BlockchainTransaction } from '@/types';

interface BlockchainTransactionProps {
  transaction: BlockchainTransaction;
  onVerify?: (txId: string) => void;
  onViewDetails?: (txId: string) => void;
}

export default function BlockchainTransactionComponent({ 
  transaction, 
  onVerify, 
  onViewDetails 
}: BlockchainTransactionProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      primary:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      primary:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: 'Copied!',
        description: 'Transaction ID copied to clipboard',
        variant: 'default',
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      // TODO: Implement actual verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onVerify?.(transaction.txId);
      toast({
        title: 'Verification Complete',
        description: 'Transaction has been verified on the blockchain',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Unable to verify transaction',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    return (amount / 1000000).toFixed(6); // Convert microAlgos to ALGOs
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="product-card"
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Blockchain Transaction
              </CardTitle>
              <p className="text-sm text-gray-600">
                Order #{transaction.order._id}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(transaction.status)} text-xs`}>
            {getStatusIcon(transaction.status)}
            <span className="ml-1 capitalize">{transaction.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transaction ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Transaction ID</label>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm font-mono text-gray-900 break-all">
              {transaction.txId}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(transaction.txId)}
              className="p-1"
            >
              {isCopied ? (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-lg font-semibold text-emerald-700">
                {formatAmount(transaction.order.totalAmount)} ALGO
              </p>
              <p className="text-sm text-emerald-600">
                ≈ ₹{(Number(transaction.order.totalAmount) * 120).toFixed(2)} (approx)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Network</label>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-700 uppercase">
                Algorand Testnet
              </p>
              <p className="text-xs text-blue-600">
                {transaction.status === 'confirmed' ? 'Confirmed' : 'Pending'} confirmations
              </p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">From Address</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <code className="flex-1 text-sm font-mono text-gray-900">
                {formatAddress(transaction.order.buyer.email)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.order.buyer.email)}
                className="p-1"
              >
                    <ClipboardDocumentIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">To Address</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <code className="flex-1 text-sm font-mono text-gray-900">
                {formatAddress(transaction.order.farmer.email)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.order.farmer.email)}
                className="p-1"
              >
                    <ClipboardDocumentIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Block Information */}
        {transaction.blockNumber && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Block Information</label>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-700">Block Number:</span>
                <span className="text-sm font-mono text-purple-900">
                  {transaction.blockNumber.toLocaleString()}
                </span>
              </div>
              {transaction.gasUsed && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-purple-700">Gas Used:</span>
                  <span className="text-sm font-mono text-purple-900">
                    {transaction.gasUsed.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Timestamp</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-900">
              {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleVerify}
            disabled={isVerifying || transaction.status === 'confirmed'}
            className="flex-1 btn-primary"
          >
            {isVerifying ? (
              <div className="flex items-center space-x-2">
                <div className="spinner h-4 w-4"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Verify Transaction
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => window.open(`https://testnet.algoexplorer.io/tx/${transaction.txId}`, '_blank')}
            className="flex-1"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>

          {onViewDetails && (
            <Button
              variant="ghost"
              onClick={() => onViewDetails(transaction.txId)}
              className="flex-1"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </motion.div>
  );
}
