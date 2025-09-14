'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  StarIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Review {
  _id: string;
  product: {
    name: string;
    images: string[];
  };
  buyer: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  isVerified: boolean;
}

function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch reviews
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReviews: Review[] = [
        {
          _id: '1',
          product: {
            name: 'Fresh Organic Tomatoes',
            images: ['/images/tomatoes.jpg']
          },
          buyer: {
            firstName: 'John',
            lastName: 'Doe',
            avatar: '/avatars/john.jpg'
          },
          rating: 5,
          comment: 'Excellent quality! The tomatoes were fresh and delicious. Will definitely order again.',
          createdAt: '2024-01-15T10:30:00Z',
          helpful: 3,
          isVerified: true
        },
        {
          _id: '2',
          product: {
            name: 'Organic Carrots',
            images: ['/images/carrots.jpg']
          },
          buyer: {
            firstName: 'Jane',
            lastName: 'Smith',
            avatar: '/avatars/jane.jpg'
          },
          rating: 4,
          comment: 'Good quality carrots, very fresh. Delivery was fast.',
          createdAt: '2024-01-14T14:20:00Z',
          helpful: 1,
          isVerified: true
        },
        {
          _id: '3',
          product: {
            name: 'Fresh Lettuce',
            images: ['/images/lettuce.jpg']
          },
          buyer: {
            firstName: 'Mike',
            lastName: 'Johnson',
            avatar: '/avatars/mike.jpg'
          },
          rating: 3,
          comment: 'Lettuce was okay, but some leaves were wilted.',
          createdAt: '2024-01-13T09:15:00Z',
          helpful: 0,
          isVerified: false
        }
      ];
      
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
        title="Reviews"
        subtitle="Loading reviews..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Product Reviews"
      subtitle="View and manage customer reviews for your products"
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back to Dashboard
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
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
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

        {/* Rating Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of reviews by rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium text-gray-900">{rating}</span>
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              Feedback from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' ? 'You have no reviews yet.' : `No ${filter}-star reviews.`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.buyer.firstName} {review.buyer.lastName}
                            {review.isVerified && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        {review.product.name}
                      </h5>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Helpful: {review.helpful}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm">
                          Report
                        </Button>
                      </div>
                    </div>
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

export default withFarmerProtection(ReviewsPage);
