'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import showToast from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface InventoryItem {
  _id: string;
  farmer: string;
  product: {
    _id: string;
    name: string;
    unit: string;
    images: string[];
  };
  currentStock: number;
  reorderLevel: number;
  lastRestocked?: Date;
  harvestDate?: Date;
  expiryDate?: Date;
  alerts: Array<{
    type: 'LOW_STOCK' | 'EXPIRING_SOON' | 'EXPIRED';
    message: string;
    createdAt: Date;
    acknowledged: boolean;
  }>;
  stockHistory?: Array<{
    quantity: number;
    type: 'ADD' | 'REMOVE' | 'ADJUST';
    reason: string;
    timestamp: Date;
  }>;
  wasteQuantity?: number;
}

function InventoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expiringSoon: 0,
    wasted: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getFarmerInventory();
      if (response.success && response.data) {
        setInventory(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showToast.error('Error fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (items: InventoryItem[]) => {
    const stats = {
      total: items.length,
      lowStock: items.filter(item =>
        item.alerts.some(a => a.type === 'LOW_STOCK' && !a.acknowledged)
      ).length,
      expiringSoon: items.filter(item =>
        item.alerts.some(a => a.type === 'EXPIRING_SOON' && !a.acknowledged)
      ).length,
      wasted: items.reduce((sum, item) => sum + (item.wasteQuantity || 0), 0),
    };
    setStats(stats);
  };

  const getStatusBadge = (item: InventoryItem) => {
    const activeAlerts = item.alerts.filter(a => !a.acknowledged);

    if (activeAlerts.some(a => a.type === 'EXPIRED')) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Expired</span>;
    }
    if (activeAlerts.some(a => a.type === 'LOW_STOCK')) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Low Stock</span>;
    }
    if (activeAlerts.some(a => a.type === 'EXPIRING_SOON')) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Expiring Soon</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Good</span>;
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowUpdateModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout title={t('farmer.inventory.title')} subtitle={t('common.loading')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('farmer.inventory.title')}
      subtitle={t('farmer.inventory.subtitle')}
      actions={
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('farmer.inventory.addInventory')}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.inventory.totalItems')}</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ArchiveBoxIcon className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.inventory.lowStock')}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                </div>
                <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.inventory.expiringSoon')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
                </div>
                <ClockIcon className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('farmer.inventory.wasted')}</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.wasted}</p>
                </div>
                <XCircleIcon className="h-10 w-10 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {(stats.lowStock > 0 || stats.expiringSoon > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                {t('farmer.inventory.alerts')} ({stats.lowStock + stats.expiringSoon})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventory
                  .filter(item => item.alerts.some(a => !a.acknowledged))
                  .slice(0, 3)
                  .map(item => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {item.alerts[0]?.type === 'LOW_STOCK' ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                        )}
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          - {item.alerts[0]?.message}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStock(item)}>
                        {t('farmer.inventory.updateStock')}
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('farmer.inventory.inventoryList')}</CardTitle>
            <CardDescription>{t('farmer.inventory.manageStock')}</CardDescription>
          </CardHeader>
          <CardContent>
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">{t('farmer.inventory.noInventory')}</p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                  {t('farmer.inventory.addFirstItem')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">{t('farmer.inventory.product')}</th>
                      <th className="text-left p-3">{t('farmer.inventory.currentStock')}</th>
                      <th className="text-left p-3">{t('farmer.inventory.reorderLevel')}</th>
                      <th className="text-left p-3">{t('farmer.inventory.status')}</th>
                      <th className="text-left p-3">{t('farmer.inventory.expiry')}</th>
                      <th className="text-right p-3">{t('farmer.inventory.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            {item.product.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-10 h-10 rounded object-cover mr-3"
                              />
                            )}
                            <span className="font-medium">{item.product.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`font-semibold ${item.currentStock < item.reorderLevel ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {item.currentStock} {item.product.unit}
                          </span>
                        </td>
                        <td className="p-3">{item.reorderLevel} {item.product.unit}</td>
                        <td className="p-3">{getStatusBadge(item)}</td>
                        <td className="p-3">
                          {item.expiryDate ? (
                            <span className="text-sm text-gray-600">
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStock(item)}
                          >
                            {t('farmer.inventory.updateStock')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('farmer.inventory.addInventoryItem')}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await apiClient.createInventoryItem({
                  product: formData.get('product') as string,
                  currentStock: Number(formData.get('currentStock')),
                  reorderLevel: Number(formData.get('reorderLevel')),
                  expiryDate: formData.get('expiryDate') as string,
                  harvestDate: formData.get('harvestDate') as string,
                });
                setShowAddModal(false);
                fetchInventory();
                showToast.success('Inventory item added successfully!');
              } catch (error: any) {
                showToast.error(error.response?.data?.message || 'Error creating inventory item');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.product')}</label>
                  <p className="text-xs text-gray-500 mb-2">{t('farmer.inventory.note')}</p>
                  <input
                    type="text"
                    name="product"
                    required
                    placeholder={t('farmer.inventory.productId')}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.currentStock')}</label>
                  <input
                    type="number"
                    name="currentStock"
                    required
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.reorderLevel')}</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    defaultValue="10"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.harvestDate')}</label>
                  <input
                    type="date"
                    name="harvestDate"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.expiryDate')}</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  {t('farmer.inventory.cancel')}
                </Button>
                <Button type="submit">{t('farmer.inventory.addInventory')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showUpdateModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Stock: {selectedItem.product.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Current Stock: <span className="font-semibold">{selectedItem.currentStock} {selectedItem.product.unit}</span>
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const action = formData.get('action') as string;
              const quantity = Number(formData.get('quantity'));
              const reason = formData.get('reason') as string;

              const finalQuantity = action === 'add' ? quantity : -quantity;

              try {
                await apiClient.updateInventoryStock(selectedItem._id, finalQuantity, reason);
                setShowUpdateModal(false);
                setSelectedItem(null);
                fetchInventory();
              } catch (error: any) {
                alert(error.response?.data?.message || 'Error updating stock');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.action')}</label>
                  <select
                    name="action"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="add">{t('farmer.inventory.addStock')}</option>
                    <option value="remove">{t('farmer.inventory.removeStock')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.quantity')}</label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('farmer.inventory.reason')}</label>
                  <select
                    name="reason"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="restock">{t('farmer.inventory.restock')}</option>
                    <option value="sale">{t('farmer.inventory.sale')}</option>
                    <option value="waste">{t('farmer.inventory.waste')}</option>
                    <option value="adjustment">{t('farmer.inventory.adjustment')}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedItem(null);
                  }}
                >
                  {t('farmer.inventory.cancel')}
                </Button>
                <Button type="submit">{t('farmer.inventory.updateStock')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withFarmerProtection(InventoryPage);
