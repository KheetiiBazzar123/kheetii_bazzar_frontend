'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withBuyerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface FavoriteProduct {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    rating: number;
    reviewCount: number;
    category: string;
    isAvailable: boolean;
  };
  farmer: {
    firstName: string;
    lastName: string;
    farmName: string;
    rating: number;
  };
  addedAt: string;
}

function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch favorites
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockFavorites: FavoriteProduct[] = [
        {
          _id: '1',
          product: {
            _id: 'prod1',
            name: 'Fresh Organic Tomatoes',
            price: 2.50,
            images: ['/images/tomatoes.jpg'],
            rating: 4.8,
            reviewCount: 24,
            category: 'Vegetables',
            isAvailable: true
          },
          farmer: {
            firstName: 'John',
            lastName: 'Smith',
            farmName: 'Green Valley Farm',
            rating: 4.9
          },
          addedAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          product: {
            _id: 'prod2',
            name: 'Organic Carrots',
            price: 1.80,
            images: ['/images/carrots.jpg'],
            rating: 4.6,
            reviewCount: 18,
            category: 'Vegetables',
            isAvailable: true
          },
          farmer: {
            firstName: 'Jane',
            lastName: 'Doe',
            farmName: 'Sunrise Organic Farm',
            rating: 4.7
          },
          addedAt: '2024-01-14T14:20:00Z'
        },
        {
          _id: '3',
          product: {
            _id: 'prod3',
            name: 'Fresh Lettuce Mix',
            price: 2.00,
            images: ['/images/lettuce.jpg'],
            rating: 4.4,
            reviewCount: 12,
            category: 'Vegetables',
            isAvailable: false
          },
          farmer: {
            firstName: 'Mike',
            lastName: 'Johnson',
            farmName: 'Mountain View Farm',
            rating: 4.5
          },
          addedAt: '2024-01-13T09:15:00Z'
        }
      ];
      
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = (favoriteId: string) => {
    setFavorites(prev => prev.filter(fav => fav._id !== favoriteId));
  };

  const addToCart = (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', productId);
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

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.farmer.farmName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || favorite.product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(favorites.map(fav => fav.product.category)))];

  if (loading) {
    return (
      <DashboardLayout
        title="Favorites"
        subtitle="Loading your favorite products..."
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Favorites"
      subtitle="Products you've saved for later"
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
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorites Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredFavorites.length} favorite{filteredFavorites.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm || categoryFilter !== 'all' ? 'No favorites found' : 'No favorites yet'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start adding products to your favorites by clicking the heart icon on any product.'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <Button
                    onClick={() => window.location.href = '/buyer/marketplace'}
                    className="mt-4 btn-primary"
                  >
                    Browse Marketplace
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <Card key={favorite._id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={favorite.product.images[0] || '/images/placeholder.jpg'}
                    alt={favorite.product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <button
                    onClick={() => removeFromFavorites(favorite._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 hover:text-red-700"
                  >
                    <HeartIcon className="h-5 w-5 fill-current" />
                  </button>
                  {!favorite.product.isAvailable && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {favorite.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      by {favorite.farmer.farmName}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(favorite.product.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      ({favorite.product.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      ${favorite.product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {favorite.product.category}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `/products/${favorite.product._id}`}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      className="btn-primary flex-1"
                      size="sm"
                      disabled={!favorite.product.isAvailable}
                      onClick={() => addToCart(favorite.product._id)}
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withBuyerProtection(FavoritesPage);
