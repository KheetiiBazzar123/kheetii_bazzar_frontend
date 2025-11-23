'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import showToast from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiService } from '@/services/api';
import { 
  StarIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  farmer: {
    firstName: string;
    lastName: string;
    farmName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  helpful: number;
}

function ReviewsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBuyerReviews({ rating: filter === 'all' ? undefined : Number(filter) });
      if (response.success) {
        const mappedReviews = (response.data?.reviews || []).map((r: any) => ({
          _id: r._id,
          product: {
            _id: r.product?._id || r.product,
            name: r.product?.name || 'Unknown Product',
            images: r.product?.images || []
          },
          farmer: {
            firstName: r.farmer?.firstName || 'Unknown',
            lastName: r.farmer?.lastName || 'Farmer',
            farmName: r.farmer?.farmName || 'Farm'
          },
          rating: r.rating,
          comment: r.comment || '',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt || r.createdAt,
          isVerified: r.isVerified || true,
          helpful: r.helpful || 0
        }));
        setReviews(mappedReviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to empty or handle error
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
      >
        <StarIcon className="h-5 w-5" />
      </button>
    ));
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleSaveEdit = () => {
    if (editingReview) {
      setReviews(prev => prev.map(review => 
        review._id === editingReview._id 
          ? { 
              ...review, 
              rating: editForm.rating, 
              comment: editForm.comment,
              updatedAt: new Date().toISOString()
            }
          : review
      ));
      setEditingReview(null);
      setEditForm({ rating: 5, comment: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, comment: '' });
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setReviews(prev => prev.filter(review => review._id !== reviewId));
    }
  };

  const filteredReviews = reviews.filter(review => 
    filter === 'all' || review.rating.toString() === filter
  );

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  if (loading) {
    return (
      <DashboardLayout
        title="My Reviews"
        subtitle="Loading your reviews..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('buyer.reviews.myReviews')}
      subtitle={t('buyer.reviews.subtitle')}
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back to Marketplace
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Review Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating Given</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center mt-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{ratingDistribution[5]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Reviews ({reviews.length})
              </Button>
              <Button
                variant={filter === '5' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('5')}
              >
                5 Stars ({ratingDistribution[5]})
              </Button>
              <Button
                variant={filter === '4' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('4')}
              >
                4 Stars ({ratingDistribution[4]})
              </Button>
              <Button
                variant={filter === '3' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('3')}
              >
                3 Stars ({ratingDistribution[3]})
              </Button>
              <Button
                variant={filter === '2' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('2')}
              >
                2 Stars ({ratingDistribution[2]})
              </Button>
              <Button
                variant={filter === '1' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('1')}
              >
                1 Star ({ratingDistribution[1]})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Reviews</CardTitle>
            <CardDescription>
              Reviews you've written for products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' ? 'You haven\'t written any reviews yet.' : `No ${filter}-star reviews.`}
                </p>
                <Button
                  onClick={() => window.location.href = '/buyer/orders'}
                  className="mt-4 btn-primary"
                >
                  View Orders to Review
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    {editingReview && editingReview._id === review._id ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            {review.product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            by {review.farmer.farmName}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          <div className="flex items-center space-x-1">
                            {renderStars(editForm.rating, true, (rating) => 
                              setEditForm(prev => ({ ...prev, rating }))
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment
                          </label>
                          <textarea
                            value={editForm.comment}
                            onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Write your review..."
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveEdit}
                            className="btn-primary"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={review.product.images[0] || '/images/placeholder.jpg'}
                              alt={review.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {review.product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                by {review.farmer.farmName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                                {review.updatedAt !== review.createdAt && (
                                  <span className="ml-2">(edited)</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-700">{review.comment}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Helpful: {review.helpful}</span>
                            {review.isVerified && (
                              <span className="text-green-600 font-medium">Verified Purchase</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withBuyerProtection(ReviewsPage);
