'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import showToast from '@/lib/toast';
import { apiService } from '@/services/api';
import { WishlistItem } from '@/types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

function FavoritesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [shareUrl, setShareUrl] = useState<string |null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await apiService.getWishlist();
      if (response.success && response.data) {
        // Backend returns array directly
        setWishlistItems(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      toast.error(error.message || t('wishlist.failedToLoad'));
      setWishlistItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    // Optimistic UI update
    const previousItems = [...wishlistItems];
    setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
    
    try {
      await apiService.removeFromWishlist(productId);
      toast.success(t('wishlist.removedFromWishlist'));
    } catch (error: any) {
      // Rollback on error
      setWishlistItems(previousItems);
      toast.error(error.message || t('wishlist.failedToRemove'));
    }
  };

  const handleShareWishlist = async () => {
    setIsSharing(true);
    try {
      const response = await apiService.shareWishlist();
      if (response.success && response.data) {
        const fullUrl = `${window.location.origin}/wishlist/shared/${response.data.shareToken}`;
        setShareUrl(fullUrl);
        
        // Clipboard with fallback for older browsers
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(fullUrl);
            toast.success(t('wishlist.shareLinkCopied'));
          } catch (clipError) {
            // Clipboard permission denied or not available
            toast.success(t('wishlist.shareLinkGenerated'));
          }
        } else {
          // Old browser fallback - show URL for manual copy
          toast.success(t('wishlist.shareLinkGenerated'));
        }
      }
    } catch (error: any) {
      toast.error(error.message || t('wishlist.failedToShare'));
    } finally {
      setIsSharing(false);
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm(t('wishlist.clearConfirm'))) {
      return;
    }

    const previousItems = [...wishlistItems];
    setWishlistItems([]); // Optimistic update

    try {
      await apiService.clearWishlist();
      toast.success(t('wishlist.wishlistCleared'));
    } catch (error: any) {
      setWishlistItems(previousItems); // Rollback
      toast.error(error.message || t('wishlist.failedToClear'));
    }
  };

  const addToCart = (productId: string) => {
    // Add to cart functionality
    toast.success('Add to cart functionality coming soon!');
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

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(wishlistItems.map(item => item.product.category)))];

  if (loading) {
    return (
      <DashboardLayout
        title={t('wishlist.title')}
        subtitle={t('common.loading')}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('wishlist.title')}
      subtitle={t('wishlist.itemsSaved', { count: wishlistItems.length })}
      actions={
        <div className="flex flex-wrap gap-2">
          {wishlistItems.length > 0 && (
            <>
              <Button
                onClick={handleShareWishlist}
                variant="outline"
                disabled={isSharing}
                className="flex items-center gap-2"
              >
                <ShareIcon className="h-4 w-4" />
                {t('wishlist.shareWishlist')}
              </Button>
              <Button
                onClick={handleClearWishlist}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                {t('wishlist.clearAll')}
              </Button>
            </>
          )}
          <Button
            onClick={() => window.location.href = '/buyer/marketplace'}
            className="btn-primary"
          >
            {t('wishlist.browseMarketplace')}
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search and Filters */}
        {wishlistItems.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('wishlist.searchWishlist')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? t('wishlist.allCategories') : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share URL Display */}
        <AnimatePresence>
          {shareUrl && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                        {t('wishlist.shareLinkCopied')}
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 truncate">
                        {shareUrl}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShareUrl(null)}
                    >
                      {t('common.close')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {wishlistItems.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.itemsFound', { count: filteredItems.length })}
            </p>
          </div>
        )}

        {/* Empty State or Wishlist Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <HeartIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {searchTerm || categoryFilter !== 'all' ? t('wishlist.noItemsFound') : t('wishlist.empty')}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || categoryFilter !== 'all' 
                    ? t('wishlist.adjustFilters')
                    : t('wishlist.emptyDescription')
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <Button
                    onClick={() => window.location.href = '/buyer/marketplace'}
                    className="mt-6 btn-primary"
                  >
                    {t('wishlist.browseMarketplace')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.product.images[0] || '/images/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-48 sm:h-56 object-cover"
                      />
                      <button
                        onClick={() => removeFromWishlist(item.product._id)}
                        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <HeartIcon className="h-5 w-5 fill-current" />
                      </button>
                      {!item.product.isAvailable && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {t('wishlist.outOfStock')}
                        </div>
                      )}
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

                      {item.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          Note: {item.notes}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.location.href = `/products/${item.product._id}`}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {t('wishlist.view')}
                        </Button>
                        <Button
                          className="btn-primary flex-1"
                          size="sm"
                          disabled={!item.product.isAvailable}
                          onClick={() => addToCart(item.product._id)}
                        >
                          <ShoppingCartIcon className="h-4 w-4 mr-1" />
                          {t('wishlist.cart')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withBuyerProtection(FavoritesPage);
