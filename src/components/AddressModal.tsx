'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DeliveryAddress, DeliveryAddressInput } from '@/types';
import Button from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryAddressInput) => Promise<void>;
  address?: DeliveryAddress | null;
  isLoading?: boolean;
}

export default function AddressModal({
  isOpen,
  onClose,
  onSubmit,
  address,
  isLoading = false
}: AddressModalProps) {
  const { t } = useTranslation();

  // Validation schema
  const addressSchema = z.object({
    label: z.string().min(1, t('addresses.requiredField')).max(50),
    fullName: z.string().min(1, t('addresses.requiredField')),
    phone: z.string().regex(/^[0-9]{10}$/, t('addresses.phoneValidation')),
    addressLine1: z.string().min(1, t('addresses.requiredField')),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(1, t('addresses.requiredField')),
    state: z.string().min(1, t('addresses.requiredField')),
    pincode: z.string().regex(/^[0-9]{6}$/, t('addresses.pincodeValidation')),
    country: z.string().default('India'),
    addressType: z.enum(['home', 'work', 'other']).default('home'),
    isDefault: z.boolean().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<DeliveryAddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'India',
      addressType: 'home',
      isDefault: false,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (address) {
      reset({
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        landmark: address.landmark || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
        addressType: address.addressType,
        isDefault: address.isDefault,
      });
    } else {
      reset({
        country: 'India',
        addressType: 'home',
        isDefault: false,
        label: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
      });
    }
  }, [address, reset]);

  const handleFormSubmit = async (data: DeliveryAddressInput) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Error handled by parent component
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {address ? t('addresses.editAddress') : t('addresses.addNew')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting || isLoading}
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.label')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('label')}
                type="text"
                placeholder="Home, Office, etc."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.label && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.label.message}</p>
              )}
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.addressType')} <span className="text-red-500">*</span>
              </label>
              <select
                {...register('addressType')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="home">{t('addresses.home')}</option>
                <option value="work">{t('addresses.work')}</option>
                <option value="other">{t('addresses.other')}</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('fullName')}
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addresses.addressLine1')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('addressLine1')}
              type="text"
              placeholder="123, MG Road"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {errors.addressLine1 && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.addressLine1.message}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addresses.addressLine2Optional')}
            </label>
            <input
              {...register('addressLine2')}
              type="text"
              placeholder="Apartment, suite, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addresses.landmarkOptional')}
            </label>
            <input
              {...register('landmark')}
              type="text"
              placeholder="Near Coffee Day Square"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.city')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('city')}
                type="text"
                placeholder="Bangalore"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.state')} <span className="text-red-500">*</span>
              </label>
              <select
                {...register('state')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state.message}</p>
              )}
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.pincode')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('pincode')}
                type="text"
                placeholder="560001"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.pincode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pincode.message}</p>
              )}
            </div>
          </div>

          {/* Country (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addresses.country')}
            </label>
            <input
              {...register('country')}
              type="text"
              value="India"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
            />
          </div>

          {/* Set as Default */}
          <div className="flex items-center">
            <input
              {...register('isDefault')}
              type="checkbox"
              id="isDefault"
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('addresses.setDefault')}
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting || isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? t('common.loading') : t('addresses.saveAddress')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
