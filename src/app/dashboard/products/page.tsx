'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProductForm from '@/components/ProductForm';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  organic: boolean;
  location: string;
  images: string[];
  status: 'active' | 'inactive' | 'sold_out';
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getFarmerProducts(1, 50);
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          console.error('Failed to load products:', response.message);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(productId);
    try {
      const response = await apiClient.deleteProduct(productId);
      if (response.success) {
        setProducts(products.filter(p => p._id !== productId));
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
          variant: 'default',
        });
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        // Product will be updated by the ProductForm component
        setProducts((products??[]).map(p => 
          (p as any)._id === (editingProduct as any)._id 
            ? { ...p, ...data, updatedAt: new Date().toISOString() }
            : p
        ));
      } else {
        // Product will be created by the ProductForm component
        // Reload products to get the latest data
        const response = await apiClient.getFarmerProducts(1, 50);
        if (response.success && response.data) {
          setProducts(response.data);
        }
      }
      
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error in form submit handler:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-warning';
      case 'sold_out':
        return 'badge-error';
      primary:
        return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={false}
      />
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">Manage your product listings</p>
          </div>
          <Button
            onClick={handleAddProduct}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <PhotoIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CurrencyRupeeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => 
                      new Date(p.createdAt).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPinIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Locations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set((products??[]).map(p => p.location)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first product to the marketplace</p>
              <Button onClick={handleAddProduct} className="btn-primary">
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(products??[]).map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="product-card"
              >
                <div className="relative">
                  <img
                    src={product.images[0] || '/api/placeholder/300/200'}
                    alt={product.name}
                    className="product-card-image"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${getStatusColor(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    {product.organic && (
                      <span className="badge badge-success text-xs">Organic</span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-semibold text-gray-900">
                        ₹{product.price}/{product.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-semibold text-gray-900">
                        {product.quantity} {product.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-semibold text-gray-900">{product.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-semibold text-gray-900">{product.location}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={deletingId === product._id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === product._id ? (
                        <div className="spinner h-4 w-4"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
