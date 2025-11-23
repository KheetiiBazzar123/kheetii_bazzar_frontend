'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import showToast from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheckIcon, // Keep ShieldCheckIcon as it's used in JSX
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ModerationItem {
  _id: string;
  type: 'product' | 'review' | 'user';
  title: string;
  description: string;
  reportedBy?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

function AdminModerationPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'reports'>('queue');
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchModerationQueue();
    } else {
      fetchReports();
    }
  }, [activeTab, page]);

  const fetchModerationQueue = async () => {
    setLoading(true);
    try {
      const response = await apiService.getModerationQueue({ page, limit: 10 });
      if (response.success) {
        setModerationQueue(response.data || []);
        setTotalPages(response.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch moderation queue:', error);
      // Mock data
      setModerationQueue([
        {
          _id: '1',
          type: 'product',
          title: 'Organic Wheat Seeds',
          description: 'New product submission pending approval',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          type: 'review',
          title: 'Review for Fresh Mangoes',
          description: 'User review flagged for inappropriate content',
          reportedBy: 'User123',
          reason: 'Spam content',
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiService.getReportedContent({ page, limit: 10 });
      if (response.success) {
        setReports(response.data || []);
        setTotalPages(response.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      // Mock data
      setReports([
        {
          _id: 'r1',
          type: 'user',
          reportedItem: 'User: FarmerX',
          reporter: 'Buyer123',
          reason: 'Suspicious activity',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (itemId: string, itemType: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await apiService.approveModerationItem(itemId, itemType);
      } else {
        const reason = prompt('Enter rejection reason:');
        if (!reason) {
          showToast.info('Rejection cancelled.');
          return;
        }
        await apiService.rejectModerationItem(itemId, itemType, reason);
      }
      showToast.success(`Item ${action}ed successfully!`);
      fetchModerationQueue();
    } catch (error) {
      console.error(`Error ${action}ing item:`, error);
      showToast.error(`Failed to ${action} item`);
    }
  };

  const handleReportAction = async (reportId: string, action: 'dismiss' | 'warn' | 'ban') => {
    if (!confirm(`Are you sure you want to ${action} this report?`)) {
      showToast.info('Report action cancelled.');
      return;
    }

    try {
      await apiService.reviewReport(reportId, action);
      alert(`Report ${action}ed successfully!`);
      fetchReports();
    } catch (error) {
      alert(`Failed to ${action} report`);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: any = {
      product: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      user: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout
      title="Content Moderation"
      subtitle="Review and moderate platform content"
    >
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => { setActiveTab('queue'); setPage(1); }}
              className={`${
                activeTab === 'queue'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              {t('admin.moderation.moderationQueue')} ({moderationQueue.length})
            </button>
            <button
              onClick={() => { setActiveTab('reports'); setPage(1); }}
              className={`${
                activeTab === 'reports'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <ExclamationTriangleIcon className="h-5 w-5 mr2" />
              {t('admin.moderation.reports')} ({reports.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="spinner h-16 w-16"></div>
          </div>
        ) : (
          <>
            {/* Moderation Queue */}
            {activeTab === 'queue' && (
              <div className="space-y-4">
                {moderationQueue.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <ShieldCheckIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">{t('admin.moderation.noItemsInQueue')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  moderationQueue.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.type)}`}>
                                  {item.type.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(item.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {item.description}
                              </p>
                              {item.reportedBy && (
                                <p className="text-sm text-gray-500">
                                  <strong>Reported by:</strong> {item.reportedBy}
                                  {item.reason && ` - ${item.reason}`}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleModerationAction(item._id, item.type, 'approve')}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleModerationAction(item._id, item.type, 'reject')}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <EyeIcon className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Reports */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">{t('admin.moderation.noReportsToReview')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  reports.map((report) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(report.type)}`}>
                                  {report.type.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(report.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {report.reportedItem}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Reporter:</strong> {report.reporter}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Reason:</strong> {report.reason}
                              </p>
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleReportAction(report._id, 'dismiss')}
                                variant="outline"
                              >
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReportAction(report._id, 'warn')}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                Warn
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReportAction(report._id, 'ban')}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Ban
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {(moderationQueue.length > 0 || reports.length > 0) && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  {t('admin.moderation.previous')}
                </Button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  {t('admin.moderation.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminModerationPage);
