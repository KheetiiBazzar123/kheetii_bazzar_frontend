'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import showToast from '@/lib/toast';
import {
  UserCircleIcon,
  PencilIcon,
  UserGroupIcon,
  StarIcon,
  MapPinIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

interface FarmerProfile {
  _id: string;
  user: any;
  bio?: string;
  farmName?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  specialties?: string[];
  certifications?: string[];
  followers?: number;
  rating?: number;
  totalReviews?: number;
}

interface Testimonial {
  _id: string;
  buyer: {
    name: string;
    profilePicture?: string;
  };
  farmer: string;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: Date;
}

function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchTestimonials();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // TEMPORARY FIX: Backend route /api/v1/farmer/profile not found
      // TODO: Backend needs to implement this route
      // Uncomment when backend is ready:
      // const response = await apiClient.getMyFarmerProfile();
      // if (response.success && response.data) {
      //   setProfile(response.data);
      // }

      // Using empty profile for now
      setProfile(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      // TEMPORARY FIX: Backend testimonials endpoint has routing issues
      // TODO: Backend needs to fix testimonials endpoint
      // Uncomment when backend is ready:
      // const response = await apiClient.getMyTestimonials();
      // if (response.success && response.data) {
      //   setTestimonials(response.data.filter(t => t.isApproved));
      // }

      // Using empty testimonials for now
      setTestimonials([]);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const data = {
      bio: formData.get('bio') as string,
      farmName: formData.get('farmName') as string,
      location: {
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        country: formData.get('country') as string || 'India',
      },
      specialties: (formData.get('specialties') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
    };

    try {
      await apiClient.updateFarmerProfile(data);
      setShowEditModal(false);
      fetchProfile();
      showToast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <DashboardLayout title="Farmer Profile" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Farmer Profile"
      subtitle="Manage your public farmer profile"
      actions={
        <Button onClick={() => setShowEditModal(true)}>
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Profile
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Profile Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-24 w-24 text-gray-400" />
              </div>
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{profile?.farmName || user?.firstName || 'Farmer'}</h2>
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {profile?.location?.city}, {profile?.location?.state}, {profile?.location?.country || 'India'}
                    </p>
                  </div>
                </div>

                {profile?.bio && (
                  <p className="mt-4 text-gray-700">{profile.bio}</p>
                )}

                {profile?.specialties && profile.specialties.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                    <p className="text-2xl font-bold">{profile?.followers || 0}</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <StarIcon className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
                    <p className="text-2xl font-bold">{profile?.rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CheckBadgeIcon className="h-6 w-6 mx-auto text-green-500 mb-1" />
                    <p className="text-2xl font-bold">{profile?.certifications?.length || 0}</p>
                    <p className="text-sm text-gray-600">Certifications</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Testimonials</CardTitle>
            <CardDescription>
              {testimonials.length} testimonials from satisfied customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? (
              <div className="text-center py-8">
                <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No testimonials yet</p>
                <p className="text-sm text-gray-500">Testimonials will appear after customers leave feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testimonials.map(testimonial => (
                  <div key={testimonial._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        <div className="ml-3">
                          <p className="font-medium">{testimonial.buyer.name}</p>
                          <div className="flex items-center mt-1">
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700">{testimonial.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Build Your Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <UserGroupIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Grow Your Following</p>
                  <p className="text-sm text-gray-600">Attract buyers who love your products</p>
                </div>
              </div>
              <div className="flex items-start">
                <StarIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Collect Reviews</p>
                  <p className="text-sm text-gray-600">Positive reviews build trust and credibility</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckBadgeIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Get Certified</p>
                  <p className="text-sm text-gray-600">Certifications increase buyer confidence</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Farm Name</label>
                <input
                  type="text"
                  name="farmName"
                  defaultValue={profile?.farmName || ''}
                  placeholder="e.g., Green Valley Organic Farm"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={profile?.bio || ''}
                  placeholder="Tell buyers about your farm, philosophy, and products..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={profile?.location?.city || ''}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={profile?.location?.state || ''}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  defaultValue={profile?.location?.country || 'India'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specialties</label>
                <input
                  type="text"
                  name="specialties"
                  defaultValue={profile?.specialties?.join(', ') || ''}
                  placeholder="e.g., Organic Vegetables, Fruits, Dairy"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withFarmerProtection(ProfilePage);
