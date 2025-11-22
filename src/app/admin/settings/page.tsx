'use client';

import React, { useState, useEffect } from 'react';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'email'>('general');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Kheetii Bazaar',
    siteDescription: 'Agricultural Marketplace',
    contactEmail: 'support@kheetiibazaar.com',
    contactPhone: '+91 1234567890',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  const [paymentSettings, setPaymentSettings] = useState({
    razorpayEnabled: true,
    razorpayKeyId: '',
    stripeEnabled: false,
    stripePublicKey: '',
    codEnabled: true,
    minimumOrderAmount: 100,
    shippingCharge: 50
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@kheetiibazaar.com',
    fromName: 'Kheetii Bazaar'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [general, payment, email] = await Promise.allSettled([
        apiService.getPlatformSettings(),
        apiService.getPaymentSettings(),
        apiService.getEmailSettings()
      ]);

      if (general.status === 'fulfilled' && general.value.success) {
        setGeneralSettings(prev => ({ ...prev, ...general.value.data }));
      }
      if (payment.status === 'fulfilled' && payment.value.success) {
        setPaymentSettings(prev => ({ ...prev, ...payment.value.data }));
      }
      if (email.status === 'fulfilled' && email.value.success) {
        setEmailSettings(prev => ({ ...prev, ...email.value.data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await apiService.updatePlatformSettings(generalSettings);
      alert('General settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setSaving(true);
    try {
      await apiService.updatePaymentSettings(paymentSettings);
      alert('Payment settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await apiService.updateEmailSettings(emailSettings);
      alert('Email settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Platform Settings"
      subtitle="Configure your platform settings"
    >
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`${
                activeTab === 'general'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              General
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`${
                activeTab === 'payment'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`${
                activeTab === 'email'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Email
            </button>
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                    className="input"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    className="input"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Language
                  </label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                    className="input"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  rows={3}
                  className="input"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saving}>
                  {saving ? 'Saving...' : 'Save General Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment gateways and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Razorpay */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Razorpay</h3>
                    <p className="text-sm text-gray-500">Accept payments via Razorpay</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.razorpayEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                {paymentSettings.razorpayEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Razorpay Key ID</label>
                      <input
                        type="text"
                        value={paymentSettings.razorpayKeyId}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeyId: e.target.value })}
                        placeholder="rzp_test_xxxxx"
                        className="input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* COD */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-gray-500">Allow COD payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.codEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, codEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>  
                  </label>
                </div>
              </div>

              {/* Order Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      value={paymentSettings.minimumOrderAmount}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, minimumOrderAmount: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Shipping Charge (₹)</label>
                    <input
                      type="number"
                      value={paymentSettings.shippingCharge}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, shippingCharge: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePayment} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure SMTP and email preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: Number(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP User</label>
                  <input
                    type="text"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Password</label>
                  <input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">From Email</label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">From Name</label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveEmail} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Email Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminSettingsPage);
