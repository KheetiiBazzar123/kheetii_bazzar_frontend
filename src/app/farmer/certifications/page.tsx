'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
// import { apiClient } from '@/services/api';
import apiClient from '@/lib/api';

// import { apiService } from '@/services/api';
import showToast from '@/lib/toast';
import {
  PlusIcon,
  DocumentCheckIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface Certification {
  _id: string;
  farmer: string;
  type: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: any;
  verificationDate?: Date;
  rejectionReason?: string;
  products?: string[];
  createdAt: Date;
}

const certificationTypes = [
  { value: 'organic', label: 'Organic Certification' },
  { value: 'fair_trade', label: 'Fair Trade' },
  { value: 'rainforest', label: 'Rainforest Alliance' },
  { value: 'global_gap', label: 'GlobalGAP' },
  { value: 'iso', label: 'ISO Certification' },
  { value: 'halal', label: 'Halal Certification' },
  { value: 'kosher', label: 'Kosher Certification' },
  { value: 'other', label: 'Other' },
];

function CertificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getMyCertifications();
      if (response.success && response.data) {
        setCertifications(response.data);
        calculateStats(response.data);
      } else {
        setCertifications([]);
        calculateStats([]);
      }
    } catch (error: any) {
      console.error('Error fetching certifications:', error);
      setCertifications([]);
      calculateStats([]);

      // Show user-friendly error message
      const errorMessage = error.response?.data?.message ||
        error.response?.status === 500
        ? 'Server error. The certifications feature may not be available yet.'
        : 'Unable to load certifications. Please try again later.';
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (certs: Certification[]) => {
    setStats({
      total: certs.length,
      verified: certs.filter(c => c.status === 'verified').length,
      pending: certs.filter(c => c.status === 'pending').length,
      rejected: certs.filter(c => c.status === 'rejected').length,
    });
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await apiClient.uploadCertification(formData);
      setShowUploadModal(false);
      fetchCertifications();
      showToast.success('Certification uploaded successfully! It will be reviewed by our team.');
    } catch (error: any) {
      console.error('Error uploading certification:', error);
      showToast.error(error.response?.data?.message || 'Error uploading certification');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getCertTypeName = (type: string) => {
    const cert = certificationTypes.find(c => c.value === type);
    return cert ? cert.label : type;
  };

  const isExpiringSoon = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    const daysToExpiry = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysToExpiry > 0 && daysToExpiry <= 30;
  };

  const isExpired = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <DashboardLayout title={t('farmer.certifications.title')} subtitle={t('common.loading')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('farmer.certifications.title')}
      subtitle={t('farmer.certifications.subtitle')}
      actions={
        <Button onClick={() => setShowUploadModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('farmer.certifications.uploadCertification')}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.certifications.totalCertifications')}</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <DocumentCheckIcon className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.certifications.verified')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                </div>
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.certifications.pendingReview')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <ClockIcon className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.certifications.rejected')}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircleIcon className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('farmer.certifications.myCertifications')}</CardTitle>
            <CardDescription>{t('farmer.certifications.viewManageCertifications')}</CardDescription>
          </CardHeader>
          <CardContent>
            {certifications.length === 0 ? (
              <div className="text-center py-12">
                <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">{t('farmer.certifications.noCertifications')}</p>
                <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
                  {t('farmer.certifications.uploadFirst')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">{t('farmer.certifications.type')}</th>
                      <th className="text-left p-3">{t('farmer.certifications.certificateNumber')}</th>
                      <th className="text-left p-3">{t('farmer.certifications.authority')}</th>
                      <th className="text-left p-3">{t('farmer.certifications.issueDate')}</th>
                      <th className="text-left p-3">{t('farmer.certifications.expiryDate')}</th>
                      <th className="text-left p-3">{t('farmer.certifications.status')}</th>
                      <th className="text-right p-3">{t('farmer.certifications.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certifications.map(cert => (
                      <tr key={cert._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-medium">{getCertTypeName(cert.type)}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-600">{cert.certificateNumber}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-600">{cert.issuingAuthority}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">
                            {new Date(cert.issueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          {cert.expiryDate ? (
                            <div className="flex items-center">
                              <span className={`text-sm ${isExpired(cert.expiryDate) ? 'text-red-600' :
                                isExpiringSoon(cert.expiryDate) ? 'text-yellow-600' :
                                  'text-gray-600'
                                }`}>
                                {new Date(cert.expiryDate).toLocaleDateString()}
                              </span>
                              {isExpiringSoon(cert.expiryDate) && !isExpired(cert.expiryDate) && (
                                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                                  {t('farmer.certifications.expiringSoon')}
                                </span>
                              )}
                              {isExpired(cert.expiryDate) && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                                  {t('farmer.certifications.expired')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">{t('farmer.certifications.noExpiry')}</span>
                          )}
                        </td>
                        <td className="p-3">{getStatusBadge(cert.status)}</td>
                        <td className="p-3 text-right">
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Button variant="outline" size="sm">
                              {t('farmer.certifications.viewDocument')}
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('farmer.certifications.whyGetCertified')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t('farmer.certifications.buildTrust')}</p>
                  <p className="text-sm text-gray-600">{t('farmer.certifications.buildTrustDesc')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t('farmer.certifications.premiumPricing')}</p>
                  <p className="text-sm text-gray-600">{t('farmer.certifications.premiumPricingDesc')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t('farmer.certifications.marketAccess')}</p>
                  <p className="text-sm text-gray-600">{t('farmer.certifications.marketAccessDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Upload Certification</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Certification Type *</label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select type...</option>
                  {certificationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Certificate Number *</label>
                <input
                  type="text"
                  name="certificateNumber"
                  required
                  placeholder="e.g., USDA-ORG-123456"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Issuing Authority *</label>
                <input
                  type="text"
                  name="issuingAuthority"
                  required
                  placeholder="e.g., USDA, Fair Trade International"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Issue Date *</label>
                <input
                  type="date"
                  name="issueDate"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="expiryDate"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Upload Document * (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  name="document"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Certification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withFarmerProtection(CertificationsPage);
