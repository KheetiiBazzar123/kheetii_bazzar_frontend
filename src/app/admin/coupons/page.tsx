'use client';

import React, { useState, useEffect } from 'react';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TicketIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

function AdminCouponsPage() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage', // percentage or fixed
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: 100,
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCoupons();
      if (response.success) {
        setCoupons(response.data);
      } else {
        // Mock data
        setCoupons([
          {
            _id: 'c1',
            code: 'WELCOME50',
            discountType: 'percentage',
            discountValue: 50,
            minOrderAmount: 500,
            validUntil: '2024-12-31',
            usageCount: 45,
            isActive: true
          },
          {
            _id: 'c2',
            code: 'FESTIVE100',
            discountType: 'fixed',
            discountValue: 100,
            minOrderAmount: 1000,
            validUntil: '2024-11-30',
            usageCount: 12,
            isActive: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await apiService.updateCoupon(editingCoupon._id, formData);
        alert('Coupon updated successfully!');
      } else {
        await apiService.createCoupon(formData);
        alert('Coupon created successfully!');
      }
      setShowModal(false);
      fetchCoupons();
      resetForm();
    } catch (error) {
      alert('Failed to save coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await apiService.deleteCoupon(id);
      fetchCoupons();
    } catch (error) {
      alert('Failed to delete coupon');
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || 0,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || 100,
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      validFrom: '',
      validUntil: '',
      usageLimit: 100,
      isActive: true
    });
  };

  return (
    <DashboardLayout
      title="Coupons & Promotions"
      subtitle="Manage discount coupons and offers"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Coupon
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <Card key={coupon._id} className={coupon.isActive ? '' : 'opacity-75'}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <TicketIcon className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:text-blue-800">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-800">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{coupon.code}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                </p>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <span className="font-medium">₹{coupon.minOrderAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span className="font-medium">{new Date(coupon.validUntil).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="input"
                    placeholder="SUMMER50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="input"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="input"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCoupon ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminCouponsPage);
