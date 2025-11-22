'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  harvestDate: z.string().min(1, 'Harvest date is required'),
  organic: z.boolean(),
  location: z.string().min(1, 'Location is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  editingProduct?: any;
  onSubmit: (data: ProductFormData & { images: File[] }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const categories = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Spices',
  'Herbs',
  'Dairy',
  'Poultry',
  'Other'
];

const units = [
  'kg',
  'g',
  'lb',
  'pieces',
  'dozen',
  'bunch',
  'bag',
  'box'
];

export default function ProductForm({ product, editingProduct, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      category: product.category || '',
      quantity: product.quantity || 1,
      unit: product.unit || 'kg',
      harvestDate: product.harvestDate || '',
      organic: product.organic || false,
      location: product.location || '',
    } : {
      name: '',
      description: '',
      price: 0,
      category: '',
      quantity: 1,
      unit: 'kg',
      harvestDate: '',
      organic: false,
      location: user?.address?.city || '',
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5); // Max 5 images
    setImages(newImages);

    // Create previews
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onFormSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      // Create FormData for file upload
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('category', data.category);
      formData.append('quantity', data.quantity.toString());
      formData.append('unit', data.unit);
      formData.append('harvestDate', data.harvestDate);
      formData.append('organic', data.organic.toString());
      formData.append('location', data.location);
      
      // Add images
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      if (editingProduct) {
        // Update existing product
        const response = await apiClient.updateProduct(editingProduct._id, formData);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Product updated successfully',
            variant: 'default',
          });
          onSubmit({ ...data, images });
        } else {
          throw new Error(response.message || 'Failed to update product');
        }
      } else {
        // Create new product
        const response = await apiClient.createProduct(formData);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Product created successfully',
            variant: 'default',
          });
          onSubmit({ ...data, images });
        } else {
          throw new Error(response.message || 'Failed to create product');
        }
      }
    } catch (error: unknown) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-6"
    >
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text">
            {product ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Product Images */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Product Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Add Image</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Upload up to 5 images (JPG, PNG, WebP)
              </p>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter product name"
                  className={errors.name ? 'input-error' : 'input'}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value: string) => setValue('category', value)} className="input">
                  <SelectValue placeholder="Select category" />
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
                {errors.category && (
                  <p className="form-error">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your product in detail..."
                rows={4}
                className={errors.description ? 'input-error' : 'input'}
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.price ? 'input-error' : 'input'}
                />
                {errors.price && (
                  <p className="form-error">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="1"
                  className={errors.quantity ? 'input-error' : 'input'}
                />
                {errors.quantity && (
                  <p className="form-error">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select onValueChange={(value: string) => setValue('unit', value)} className="input">
                  <SelectValue placeholder="Select unit" />
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </Select>
                {errors.unit && (
                  <p className="form-error">{errors.unit.message}</p>
                )}
              </div>
            </div>

            {/* Harvest Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date *</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  {...register('harvestDate')}
                  className={errors.harvestDate ? 'input-error' : 'input'}
                />
                {errors.harvestDate && (
                  <p className="form-error">{errors.harvestDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="City, State"
                  className={errors.location ? 'input-error' : 'input'}
                />
                {errors.location && (
                  <p className="form-error">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Organic Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="organic"
                {...register('organic')}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <Label htmlFor="organic" className="text-sm font-medium text-gray-700">
                This product is organic
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary px-8"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner h-4 w-4"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  product ? 'Update Product' : 'Add Product'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
