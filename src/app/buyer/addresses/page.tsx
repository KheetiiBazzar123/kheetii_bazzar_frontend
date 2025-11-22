'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api';
import { DeliveryAddress, DeliveryAddressInput } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import AddressModal from '@/components/AddressModal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  HomeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

export default function AddressesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAddresses();
      if (response.success && response.data) {
        setAddresses(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      toast.error(error.message || t('addresses.failedToLoad'));
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: DeliveryAddressInput) => {
    setFormLoading(true);
    try {
      if (editingAddress) {
        // Update existing address
        const response = await apiService.updateAddress(editingAddress._id, data);
        if (response.success && response.data) {
          setAddresses(prev =>
            prev.map(addr => (addr._id === editingAddress._id ? response.data! : addr))
          );
          toast.success(t('addresses.updateSuccess'));
        }
      } else {
        // Create new address
        const response = await apiService.createAddress(data);
        if (response.success && response.data) {
          setAddresses(prev => [...prev, response.data!]);
          toast.success(t('addresses.createSuccess'));
        }
      }
      setShowModal(false);
      setEditingAddress(null);
    } catch (error: any) {
      toast.error(error.message || (editingAddress ? t('addresses.failedToUpdate') : t('addresses.failedToCreate')));
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('addresses.confirmDelete'))) {
      return;
    }

    const previousAddresses = [...addresses];
    // Optimistic UI update
    setAddresses(prev => prev.filter(addr => addr._id !== id));

    try {
      await apiService.deleteAddress(id);
      toast.success(t('addresses.deleteSuccess'));
    } catch (error: any) {
      setAddresses(previousAddresses); // Rollback
      toast.error(error.message || t('addresses.failedToDelete'));
    }
  };

  const handleSetDefault = async (id: string) => {
    const previousAddresses = [...addresses];
    // Optimistic UI update
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr._id === id
    })));

    try {
      await apiService.setDefaultAddress(id);
      toast.success(t('addresses.setDefaultSuccess'));
      // Re-sort to show default first
      setAddresses(prev => [...prev].sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;
        return a.isDefault ? -1 : 1;
      }));
    } catch (error: any) {
      setAddresses(previousAddresses); // Rollback
      toast.error(error.message || t('addresses.failedToUpdate'));
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <HomeIcon className="h-5 w-5" />;
      case 'work':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      default:
        return <MapPinIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title={t('addresses.title')}
        subtitle={t('common.loading')}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('addresses.title')}
      subtitle={t('addresses.addressCount', { count: addresses.length })}
      actions={
        <Button
          onClick={() => {
            setEditingAddress(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {t('addresses.addNew')}
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto">
        {addresses.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <MapPinIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {t('addresses.noAddresses')}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('addresses.noAddressesDescription')}
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      setEditingAddress(null);
                      setShowModal(true);
                    }}
                    className="btn-primary"
                  >
                    <PlusIcon className="h-5 w-5 mr-2 inline" />
                    {t('addresses.addNew')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Address Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {addresses.map((address) => (
                <motion.div
                  key={address._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            {getAddressTypeIcon(address.addressType)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {address.label}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {t(`addresses.${address.addressType}`)}
                            </span>
                          </div>
                        </div>
                        {address.isDefault && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
                            <StarSolidIcon className="h-3 w-3" />
                            {t('addresses.defaultAddress')}
                          </div>
                        )}
                      </div>

                      {/* Address Details */}
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {address.fullName}
                        </p>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          <span>+91 {address.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            {address.landmark && <p className="text-gray-500 dark:text-gray-400">Near: {address.landmark}</p>}
                            <p>
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">{address.country}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingAddress(address);
                            setShowModal(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          {t('common.edit')}
                        </Button>
                        <Button
                          onClick={() => handleDelete(address._id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        {!address.isDefault && (
                          <Button
                            onClick={() => handleSetDefault(address._id)}
                            variant="outline"
                            size="sm"
                            title={t('addresses.setAsDefault')}
                          >
                            <StarIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <AddressModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAddress(null);
        }}
        onSubmit={handleSubmit}
        address={editingAddress}
        isLoading={formLoading}
      />
    </DashboardLayout>
  );
}
