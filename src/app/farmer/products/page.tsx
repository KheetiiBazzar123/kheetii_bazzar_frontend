'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { withFarmerProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import showToast from '@/lib/toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiService } from '@/services/api';
import apiClient from '@/lib/api';

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

function FarmerProducts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  useEffect(() => {
    fetchProducts();
  }, []);
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      const formData = new FormData();
      formData.append("name", selectedProduct.name);
      formData.append("price", selectedProduct.price.toString());
      formData.append("category", selectedProduct.category);
      formData.append("description", selectedProduct.description);



      const response = await apiClient.updateProduct(selectedProduct._id, formData);

      if (response?.success) {
        showToast.success(t('farmer.products.updateSuccess') || "Product updated successfully!");
        setShowEditModal(false);
        await fetchProducts();
      } else {
        showToast.error(response?.message || "Failed to update product");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      showToast.error(error.message || "Something went wrong");
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await apiClient.getFarmerProducts(); // GET /api/v1/farmer/products

      if (response?.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching farmer products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };


  // const fetchProducts = async () => {
  //   try {
  //     // In a real app, you would fetch from your API
  //     const mockProducts: Product[] = [
  //       {
  //         _id: '1',
  //         name: 'Fresh Organic Tomatoes',
  //         description: 'Freshly harvested organic tomatoes from our farm',
  //         price: 50,
  //         quantity: 100,
  //         unit: 'kg',
  //         images: [],
  //         category: 'vegetables',
  //         freshness: 'fresh',
  //         rating: 4.8,
  //         reviewCount: 24,
  //         isAvailable: true,
  //         harvestDate: '2024-01-10',
  //         expiryDate: '2024-01-20',
  //         createdAt: '2024-01-10T10:00:00Z'
  //       },
  //       {
  //         _id: '2',
  //         name: 'Sweet Mangoes',
  //         description: 'Sweet and juicy mangoes from our orchard',
  //         price: 80,
  //         quantity: 50,
  //         unit: 'kg',
  //         images: [],
  //         category: 'fruits',
  //         freshness: 'fresh',
  //         rating: 4.6,
  //         reviewCount: 18,
  //         isAvailable: true,
  //         harvestDate: '2024-01-12',
  //         expiryDate: '2024-01-22',
  //         createdAt: '2024-01-12T14:00:00Z'
  //       },
  //       {
  //         _id: '3',
  //         name: 'Basmati Rice',
  //         description: 'Premium quality basmati rice',
  //         price: 120,
  //         quantity: 200,
  //         unit: 'kg',
  //         images: [],
  //         category: 'grains',
  //         freshness: 'good',
  //         rating: 4.7,
  //         reviewCount: 32,
  //         isAvailable: false,
  //         harvestDate: '2024-01-05',
  //         expiryDate: '2024-02-05',
  //         createdAt: '2024-01-05T09:00:00Z'
  //       }
  //     ];

  //     setProducts(mockProducts);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching products:', error);
  //     setLoading(false);
  //   }
  // };

  // const toggleAvailability = async (productId: string) => {
  //   setProducts(prev => prev.map(product => 
  //     product._id === productId 
  //       ? { ...product, isAvailable: !product.isAvailable }
  //       : product
  //   ));
  // };
  const toggleAvailability = async (productId: string) => {
    try {
      await apiClient.toggleProductAvailability(productId);


      setProducts(prev =>
        prev.map(product =>
          product._id === productId
            ? { ...product, isAvailable: !product.isAvailable }
            : product
        )
      );
      showToast.success(t('farmer.products.availabilityUpdated') || 'Availability updated successfully');
    } catch (error) {
      console.error("Error toggling availability:", error);
      showToast.error("Something went wrong");
    }
  };

  // const deleteProduct = async (productId: string) => {
  //   if (confirm('Are you sure you want to delete this product?')) {
  //     setProducts(prev => prev.filter(product => product._id !== productId));
  //   }
  // };

  const deleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await apiClient.deleteProduct(productId);

        if (response?.success) {

          setProducts((prev) => prev.filter((product) => product._id !== productId));
          showToast.success(t('farmer.products.deleteSuccess') || "Product deleted successfully!");
        } else {
          showToast.error(response?.message || "Failed to delete product.");
        }
      } catch (error: any) {
        console.error("Error deleting product:", error);
        showToast.error(error.message || "Something went wrong while deleting.");
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'poultry', 'seafood', 'other'
  ];

  if (loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="spinner h-16 w-16"></div>
      </div>
    );
  }
  return (
    <DashboardLayout
      title={t('products.myProducts')}
      subtitle={t('products.myProductsSubtitle')}
      actions={
        <Button onClick={() => router.push('/farmer/products/new')} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('products.addNewProduct')}
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('farmer.products.searchProducts')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{t('farmer.products.allCategories')}</option>
                {categories.map(category => (
                  <option key={category} value={category} className="capitalize">
                    {t(`farmer.products.categories.${category}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="text-4xl text-gray-400">🌱</div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${product.isAvailable
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                      }`}>
                      {product.isAvailable ? t('farmer.products.available') : t('farmer.products.unavailable')}
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Product Info */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product.reviewCount})</span>
                      </div>

                      {/* Category and Freshness */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                          {product.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${product.freshness === 'fresh' ? 'bg-green-100 text-green-600' :
                          product.freshness === 'good' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                          {product.freshness}
                        </span>
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
                        <p className="text-sm text-gray-600">per {product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{product.quantity} {product.unit}</p>
                        <p className="text-xs text-gray-500">{t('farmer.products.inStock')}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {t('farmer.products.view')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditClick(product)}

                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        {t('farmer.products.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAvailability(product._id)}
                        className={product.isAvailable ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
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
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('farmer.products.noProducts')}</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory
                ? t('common.adjustFilters')
                : t('farmer.products.noProductsDescription')
              }
            </p>
            <Link href="/farmer/products/new">
              <Button className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                {t('farmer.products.addFirstProduct')}
              </Button>
            </Link>
          </div>
        )}
      </div>
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 hover:scale-[1.01]">

            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-gray-200 pb-3">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                {t('farmer.products.editProduct')}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-red-500 text-xl transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('farmer.products.productName')}</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="Enter product name"
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, name: e.target.value })
                  }
                />
              </div>





              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('farmer.products.price')} (₹)</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Enter product price"
                  value={selectedProduct.price}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })
                  }
                />
              </div>



              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('farmer.products.description')}</label>
                <textarea
                  rows={3}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                  placeholder="Enter product description"
                  value={selectedProduct.description}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 active:scale-95 transition-all"
              >
                {t('farmer.products.cancel')}
              </button>

              <button
                onClick={async () => await handleUpdateProduct()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 active:scale-95 transition-all"
              >
                {t('farmer.products.updateProduct')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>

  );
}

export default withFarmerProtection(FarmerProducts);
