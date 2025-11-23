'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withAuthProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'farmer' | 'buyer';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isEmailVerified: boolean;
  createdAt: string;
}

function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'buyer',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    isEmailVerified: false,
    createdAt: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'buyer',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        isEmailVerified: user.isEmailVerified || false,
        createdAt: user.createdAt || ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // In a real app, you would call the API to update the profile
      // await apiClient.updateProfile(profileData);
      
      // For now, we'll just update the local state
      updateUser({
        ...user!,
        ...profileData
      });
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'buyer',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        isEmailVerified: user.isEmailVerified || false,
        createdAt: user.createdAt || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'text-green-600 bg-green-100';
      case 'buyer': return 'text-blue-600 bg-blue-100';
      primary: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={t('profilePage.title')}
      subtitle={t('profilePage.subtitle')}
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          {t('profilePage.back')}
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getRoleColor(profileData.role)}`}>
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {profileData.email}
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center justify-center">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {profileData.phone}
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Member since {new Date(profileData.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('profilePage.profileInformation')}</CardTitle>
                    <CardDescription>
                      {t('profilePage.updateInfo')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? (
                            <div className="spinner h-4 w-4 mr-2"></div>
                          ) : (
                            <CheckIcon className="h-4 w-4 mr-2" />
                          )}
                          {t('profilePage.save')}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          {t('profilePage.cancel')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        {t('profilePage.edit')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profilePage.personalInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profilePage.firstName')}
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profilePage.lastName')}
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profilePage.contactInfo')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profilePage.emailAddress')}
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                          {profileData.isEmailVerified && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <CheckIcon className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                        </div>
                        {profileData.isEmailVerified ? (
                          <p className="text-sm text-green-600 mt-1">{t('profilePage.emailVerified')}</p>
                        ) : (
                          <p className="text-sm text-yellow-600 mt-1">{t('profilePage.emailNotVerified')}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profilePage.phoneNumber')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profilePage.addressInfo')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profilePage.streetAddress')}
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={profileData.address.street}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profilePage.city')}
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={profileData.address.city}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profilePage.state')}
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={profileData.address.state}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profilePage.zipCode')}
                          </label>
                          <input
                            type="text"
                            name="address.zipCode"
                            value={profileData.address.zipCode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profilePage.country')}
                          </label>
                          <input
                            type="text"
                            name="address.country"
                            value={profileData.address.country}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profilePage.accountInfo')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profilePage.accountType')}
                        </label>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileData.role)}`}>
                          <ShieldCheckIcon className="h-4 w-4 mr-1" />
                          {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {profileData.role === 'farmer' 
                            ? t('profilePage.farmerDesc')
                            : t('profilePage.buyerDesc')
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profilePage.memberSince')}
                        </label>
                        <p className="text-sm text-gray-600">
                          {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuthProtection(ProfilePage);
