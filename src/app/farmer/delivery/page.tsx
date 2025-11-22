'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  PlusIcon,
  TruckIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface DeliverySchedule {
  _id: string;
  farmer: string;
  buyer: any;
  order?: any;
  deliveryDate: Date;
  timeSlot: string;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  specialInstructions?: string;
  cancellationReason?: string;
  createdAt: Date;
}

const timeSlots = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

function DeliveryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getMyDeliverySchedules();
      if (response.success && response.data) {
        setSchedules(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sched: DeliverySchedule[]) => {
    setStats({
      total: sched.length,
      scheduled: sched.filter(s => s.status === 'scheduled').length,
      inTransit: sched.filter(s => s.status === 'in_transit').length,
      delivered: sched.filter(s => s.status === 'delivered').length,
      cancelled: sched.filter(s => s.status === 'cancelled').length,
    });
  };

  const handleCreateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData(e.currentTarget);
    
    const data = {
      deliveryDate: formData.get('deliveryDate') as string,
      timeSlot: formData.get('timeSlot') as string,
      address: {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string,
        country: formData.get('country') as string || 'India',
      },
      specialInstructions: formData.get('specialInstructions') as string,
    };

    try {
      await apiClient.createDeliverySchedule(data);
      setShowCreateModal(false);
      fetchSchedules();
      alert('Delivery schedule created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating delivery schedule');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to cancel this delivery?')) return;

    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;

    try {
      await apiClient.cancelDeliverySchedule(scheduleId, reason);
      fetchSchedules();
      alert('Delivery schedule cancelled');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error cancelling schedule');
    }
  };

  const handleCompleteDelivery = async (scheduleId: string) => {
    if (!confirm('Mark this delivery as completed?')) return;

    try {
      await apiClient.completeDelivery(scheduleId);
      fetchSchedules();
      alert('Delivery marked as completed!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error completing delivery');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Scheduled
          </span>
        );
      case 'in_transit':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
            <TruckIcon className="h-4 w-4 mr-1" />
            In Transit
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getUpcomingDeliveries = () => {
    return schedules
      .filter(s => s.status === 'scheduled' && new Date(s.deliveryDate) >= new Date())
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <DashboardLayout title="Delivery Scheduling" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Delivery Scheduling"
      subtitle="Manage your delivery schedules and routes"
      actions={
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Schedule
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <TruckIcon className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <CalendarIcon className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inTransit}</p>
                </div>
                <TruckIcon className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircleIcon className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deliveries */}
        {getUpcomingDeliveries().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Upcoming Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingDeliveries().map(schedule => (
                  <div key={schedule._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">
                          {new Date(schedule.deliveryDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{schedule.timeSlot}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{schedule.address.city}, {schedule.address.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Delivery Schedules</CardTitle>
            <CardDescription>View and manage your delivery schedules</CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No delivery schedules yet</p>
                <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                  Create Your First Schedule
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Time Slot</th>
                      <th className="text-left p-3">Delivery Address</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(schedule => (
                      <tr key={schedule._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-medium">
                            {new Date(schedule.deliveryDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {schedule.timeSlot}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-start">
                            <MapPinIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <p>{schedule.address.street}</p>
                              <p>{schedule.address.city}, {schedule.address.state} {schedule.address.zipCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{getStatusBadge(schedule.status)}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            {schedule.status === 'scheduled' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompleteDelivery(schedule._id)}
                                >
                                  Mark Delivered
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelSchedule(schedule._id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {schedule.status === 'in_transit' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteDelivery(schedule._id)}
                              >
                                Mark Delivered
                              </Button>
                            )}
                          </div>
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

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Delivery Schedule</h3>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Date *</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time Slot *</label>
                  <select
                    name="timeSlot"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select time...</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    defaultValue="India"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Special Instructions (Optional)</label>
                <textarea
                  name="specialInstructions"
                  rows={3}
                  placeholder="Any special delivery instructions..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withFarmerProtection(DeliveryPage);
