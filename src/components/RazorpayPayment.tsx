'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import showToast from '@/lib/toast';
import Button from '@/components/ui/Button';
import { CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string, razorpayOrderId: string, signature: string) => void;
  onFailure: (error: any) => void;
  disabled?: boolean;
}

export default function RazorpayPayment({
  orderId,
  amount,
  currency = 'INR',
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  disabled = false,
}: RazorpayPaymentProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast.error(t('payment.scriptLoadFailed') || 'Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        name: 'KheetiiBazaar',
        description: `Order #${orderId}`,
        order_id: orderId,
        handler: function (response) {
          // Payment successful
          onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
          showToast.success(t('payment.success') || 'Payment successful!');
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#10b981', // Emerald color
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on('payment.failed', function (response: any) {
        onFailure(response.error);
        showToast.error(
          response.error.description || t('payment.failed') || 'Payment failed'
        );
      });

      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      showToast.error(error.message || t('payment.error') || 'Payment error occurred');
      onFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="btn-primary w-full flex items-center justify-center gap-2"
    >
      <CreditCardIcon className="h-5 w-5" />
      {loading
        ? t('payment.processing') || 'Processing...'
        : t('payment.payNow') || `Pay ₹${amount.toLocaleString('en-IN')}`}
    </Button>
  );
}

// COD Payment Option Component
interface CODPaymentProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function CODPayment({ onConfirm, disabled = false }: CODPaymentProps) {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onConfirm}
      disabled={disabled}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      <BanknotesIcon className="h-5 w-5" />
      {t('payment.cashOnDelivery') || 'Cash on Delivery'}
    </Button>
  );
}
