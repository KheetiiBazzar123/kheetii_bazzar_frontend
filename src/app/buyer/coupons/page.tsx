'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TicketIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function CouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAvailableCoupons();
      if (response.success && response.data) {
        setCoupons(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast.error(t('common.error'));
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('coupons.codeCopied'));
  };

  if (loading) {
    return (
      <DashboardLayout title={t('coupons.title')} subtitle={t('common.loading')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('coupons.title')}
      subtitle={`${coupons.length} ${t('common.itemsFound', { count: coupons.length })}`}
    >
      <div className="max-w-5xl mx-auto">
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TicketIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('coupons.noCoupons')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('coupons.noCouponsDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map((coupon) => (
              <Card key={coupon._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm opacity-90">{t('coupons.discount')}</p>
                        <p className="text-3xl font-bold">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </p>
                      </div>
                      <TicketIcon className="h-12 w-12 opacity-50" />
                    </div>
                    <p className="mt-2 text-sm">{coupon.description}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('coupons.couponCode')}</p>
                        <code className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                          {coupon.code}
                        </code>
                      </div>
                      <Button
                        onClick={() => handleCopyCode(coupon.code)}
                        size="sm"
                        className="btn-primary"
                      >
                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                        {t('coupons.copyCoupon')}
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {coupon.minPurchaseAmount && (
                        <p>• {t('coupons.minOrder')}: ₹{coupon.minPurchaseAmount}</p>
                      )}
                      <p className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {t('coupons.validUntil')}: {new Date(coupon.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
