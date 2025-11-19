/**
 * Product Form Component
 * Created: November 14, 2025
 * Updated to properly handle edit mode with all fields
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData } from '@/lib/validations/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Product } from '@prisma/client';

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      sku: initialData.sku,
      name: initialData.name,
      description: initialData.description || '',
      category: initialData.category || '',
      barcode: initialData.barcode || '',
      temperatureZone: initialData.temperatureZone,
      shelfLifeDays: initialData.shelfLifeDays,
      minStockLevel: initialData.minStockLevel || 0,
      maxStockLevel: initialData.maxStockLevel || undefined,
      unit: initialData.unit,
    } : {
      sku: '',
      name: '',
      description: '',
      category: '',
      barcode: '',
      temperatureZone: 'CHILLED',
      shelfLifeDays: 7,
      minStockLevel: 0,
      maxStockLevel: undefined,
      unit: 'pcs',
    },
  });

  const temperatureZone = watch('temperatureZone');

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : '/api/products';

      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/products');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save product');
      }
    } catch (error) {
      alert('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the basic product details (Item Code, Description, Category)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SKU / Item Code */}
          <div className="grid gap-2">
            <Label htmlFor="sku">
              Item Code (SKU) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sku"
              {...register('sku')}
              placeholder="e.g., P001"
              className={errors.sku ? 'border-red-500' : ''}
            />
            {errors.sku && (
              <p className="text-sm text-red-500">{errors.sku.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Example: P001, FRZ-001, etc. (uppercase letters and numbers only)
            </p>
          </div>

          {/* Name / Item Description */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Item Description (Product Name) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Belly BISO, Frozen Chicken Breast"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description (Additional details) */}
          <div className="grid gap-2">
            <Label htmlFor="description">Additional Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional product details, specifications, etc..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="e.g., Pork, Beef, Poultry, Seafood"
              className={errors.category ? 'border-red-500' : ''}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Examples: Pork, Beef, Chicken, Seafood, Vegetables, Dairy
            </p>
          </div>

          {/* Barcode */}
          <div className="grid gap-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input
              id="barcode"
              {...register('barcode')}
              placeholder="e.g., 1234567890001"
            />
            {errors.barcode && (
              <p className="text-sm text-red-500">{errors.barcode.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage & Temperature</CardTitle>
          <CardDescription>
            Configure temperature requirements and shelf life
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Temperature Zone */}
          <div className="grid gap-2">
            <Label htmlFor="temperatureZone">
              Temperature Zone <span className="text-red-500">*</span>
            </Label>
            <Select
              value={temperatureZone}
              onValueChange={(value) =>
                setValue('temperatureZone', value as any)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select temperature zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FROZEN">
                  ❄️ Frozen (-18°C or below)
                </SelectItem>
                <SelectItem value="CHILLED">
                  🧊 Chilled (0°C to 5°C)
                </SelectItem>
                <SelectItem value="AMBIENT">
                  🌡️ Ambient (Room temperature)
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.temperatureZone && (
              <p className="text-sm text-red-500">
                {errors.temperatureZone.message}
              </p>
            )}
          </div>

          {/* Shelf Life */}
          <div className="grid gap-2">
            <Label htmlFor="shelfLifeDays">
              Shelf Life (days) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shelfLifeDays"
              type="number"
              {...register('shelfLifeDays', { valueAsNumber: true })}
              placeholder="e.g., 365"
              className={errors.shelfLifeDays ? 'border-red-500' : ''}
            />
            {errors.shelfLifeDays && (
              <p className="text-sm text-red-500">
                {errors.shelfLifeDays.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Number of days the product remains fresh from receipt date
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Management</CardTitle>
          <CardDescription>
            Set stock levels and units of measure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Min Stock */}
            <div className="grid gap-2">
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                {...register('minStockLevel', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.minStockLevel && (
                <p className="text-sm text-red-500">
                  {errors.minStockLevel.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Alert when stock goes below this level
              </p>
            </div>

            {/* Max Stock */}
            <div className="grid gap-2">
              <Label htmlFor="maxStockLevel">Max Stock Level</Label>
              <Input
                id="maxStockLevel"
                type="number"
                {...register('maxStockLevel', { valueAsNumber: true })}
                placeholder="Optional"
              />
              {errors.maxStockLevel && (
                <p className="text-sm text-red-500">
                  {errors.maxStockLevel.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Maximum storage capacity
              </p>
            </div>

            {/* Unit */}
            <div className="grid gap-2">
              <Label htmlFor="unit">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit"
                {...register('unit')}
                placeholder="e.g., kg, pcs"
                className={errors.unit ? 'border-red-500' : ''}
              />
              {errors.unit && (
                <p className="text-sm text-red-500">{errors.unit.message}</p>
              )}
              <p className="text-xs text-gray-500">
                kg, pcs, box, case, etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/products')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? initialData
              ? 'Updating...'
              : 'Creating...'
            : initialData
            ? 'Update Product'
            : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
