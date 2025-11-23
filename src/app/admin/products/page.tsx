'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import showToast from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';


interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  images: string[];
  category: string;
  freshness: 'fresh' | 'good' | 'average';
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  harvestDate: string;
  expiryDate: string;
  createdAt: string;
}

function AdminProducts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'meat', 'other'
  ];

  // ✅ Fetch all products using same API as farmer
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Admin should get all products, not just farmer's products
      const response = await apiClient.getProducts({
        page: currentPage,
        limit: itemsPerPage,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined
      });
      
      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      showToast.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    try {
      const formData = new FormData();
      formData.append('name', selectedProduct.name);
      formData.append('price', selectedProduct.price.toString());
      formData.append('category', selectedProduct.category);
      formData.append('description', selectedProduct.description);

      const response = await apiClient.updateProduct(selectedProduct._id, formData);
      if (response?.success) {
        alert('✅ Product updated successfully!');
        setShowEditModal(false);
        await fetchProducts();
      } else {
        alert(response?.message || 'Failed to update product.');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.message || 'Something went wrong.');
    }
  };

  const toggleAvailability = async (productId: string) => {
    try {
      await apiClient.toggleProductAvailability(productId);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, isAvailable: !p.isAvailable } : p
        )
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Something went wrong while changing status.');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await apiClient.deleteProduct(productId);
        if (response?.success) {
          setProducts((prev) => prev.filter((p) => p._id !== productId));
          alert('✅ Product deleted successfully!');
        } else {
          alert(response?.message || 'Failed to delete product.');
        }
      } catch (error: any) {
        console.error('Error deleting product:', error);
        alert(error.message || 'Something went wrong.');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={t('products.adminTitle')}
      subtitle={t('products.adminSubtitle')}
      actions={
        <Link href="/admin/products/new">
          <Button onClick={() => router.push('/admin/products/new')} className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('products.addProduct')}
          </Button>
        </Link>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Search & Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
                  placeholder={t('products.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="md:w-60 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t('products.allCategories')}</option>
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 rounded-xl">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gray-100 rounded-t-xl flex items-center justify-center">
                    {product.images?.length ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                    <div
                      className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{product.price}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.quantity} {product.unit} in stock
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(product)}
                        className="flex-1 text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAvailability(product._id)}
                        className={
                          product.isAvailable
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-green-600 hover:text-green-700'
                        }
                      >
                        {product.isAvailable ? (
                          <XCircleIcon className="h-4 w-4" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory
                ? 'Try adjusting your search or filters.'
                : 'You haven’t added any products yet.'}
            </p>
            <Link href="/admin/products/new">
              <Button className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Product</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={selectedProduct.price}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={selectedProduct.description}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateProduct} className="btn-primary">
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminProducts);
