'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withAdminProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleAddCategory = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowAddForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description
    });
    setEditingCategory(category);
    setShowAddForm(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      // Update existing category
      setCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, name: formData.name, description: formData.description }
            : cat
        )
      );
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        productCount: 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCategories(prev => [...prev, newCategory]);
    }

    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, isActive: !cat.isActive }
          : cat
      )
    );
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        const apiCategories: Category[] = response.data.categories.map((catName, index) => {
          const countObj = response.data?.categoryCounts.find(c => c.category === catName);
          return {
            id: index.toString(),
            name: catName,
            description: '',
            productCount: countObj ? countObj.count : 0,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0]
          };
        });
        setCategories(apiCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const activeCategories = categories.filter(cat => cat.isActive).length;

  if (loading) {
    return (
      <DashboardLayout title="Admin Categories" subtitle="Loading categories...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner h-16 w-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Product Categories"
      subtitle="Manage all categories across the platform"
      actions={
        <div className="flex space-x-3">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back
          </Button>
          <Button
            onClick={handleAddCategory}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Category
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCategories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Category Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
              <CardDescription>
                {editingCategory
                  ? 'Update category information'
                  : 'Create a new product category for the platform'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Organic Vegetables"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describe this category..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveCategory}
                    className="btn-primary"
                    disabled={!formData.name.trim()}
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>Manage and organize all product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{category.productCount} products</span>
                      <span>Created: {category.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleCategoryStatus(category.id)}>
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withAdminProtection(AdminCategoriesPage);
