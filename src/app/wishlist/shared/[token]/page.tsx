'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '@/services/api';
import { WishlistItem } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { 
  HeartIcon,
  StarIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function SharedWishlistPage() {
  const params = useParams();
  const shareToken = params.token as string;
  
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ownerName, setOwnerName] = useState('A KheetiiBazaar User'); // Default fallback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareToken) {
      fetchSharedWishlist();
    }
  }, [shareToken]);

  const fetchSharedWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getSharedWishlist(shareToken);
      if (response.success && response.data) {
        // Backend now returns {items, user} structure
        if (Array.isArray(response.data)) {
          // Fallback for old API response
          setItems(response.data);
          setOwnerName('A KheetiiBazaar User');
        } else {
          // New API response with user info
          setItems(response.data.items || []);
          if (response.data.user) {
            setOwnerName(`${response.data.user.firstName} ${response.data.user.lastName}`);
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load shared wishlist');
      toast.error(error.message || 'Invalid or expired share link');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shared wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <HeartIcon className="mx-auto h-16 w-16 text-red-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Unable to Load Wishlist
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="mt-6 btn-primary"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <HeartIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Shared Wishlist
                </h1>
                <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                  <UserIcon className="h-4 w-4" />
                  <p className="text-sm">by {ownerName}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/buyer/marketplace'}
              className="btn-primary"
            >
              Browse Marketplace
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <HeartIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                This wishlist is empty
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No products have been added to this wishlist yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {items.length} {items.length === 1 ? 'item' : 'items'} in this wishlist
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {items.map((item, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={item.product.images[0] || '/images/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-full h-48 sm:h-56 object-cover rounded-t-lg"
                    />
                    {!item.product.isAvailable && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                    <div className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full">
                      <HeartIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        by {item.product.farmer.firstName} {item.product.farmer.lastName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(item.product.rating)}
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">
                        ({item.product.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{item.product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {item.product.category}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.location.href = `/products/${item.product._id}`}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Product
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
