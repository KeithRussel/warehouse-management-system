/**
 * Product Validation Schemas
 * Created: November 14, 2025
 * Updated: Made category required
 */

import { z } from 'zod';

export const productSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  barcode: z
    .string()
    .max(100, 'Barcode must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  temperatureZone: z.enum(['FROZEN', 'CHILLED', 'AMBIENT'], {
    required_error: 'Temperature zone is required',
  }),
  shelfLifeDays: z
    .number()
    .int('Shelf life must be a whole number')
    .min(1, 'Shelf life must be at least 1 day')
    .max(3650, 'Shelf life cannot exceed 10 years'),
  minStockLevel: z
    .number()
    .int('Minimum stock level must be a whole number')
    .min(0, 'Minimum stock level cannot be negative')
    .optional(),
  maxStockLevel: z
    .number()
    .int('Maximum stock level must be a whole number')
    .min(0, 'Maximum stock level cannot be negative')
    .optional(),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters').default('pcs'),
}).refine(
  (data) => {
    if (data.minStockLevel !== undefined && data.maxStockLevel !== undefined) {
      return data.maxStockLevel >= data.minStockLevel;
    }
    return true;
  },
  {
    message: 'Maximum stock level must be greater than or equal to minimum stock level',
    path: ['maxStockLevel'],
  }
);

export type ProductFormData = z.infer<typeof productSchema>;
