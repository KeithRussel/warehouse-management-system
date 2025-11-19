/**
 * Supplier Validation Schemas
 * Created: November 14, 2025
 */

import { z } from 'zod';

export const supplierSchema = z.object({
  code: z
    .string()
    .min(1, 'Supplier code is required')
    .max(50, 'Supplier code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Supplier code can only contain uppercase letters, numbers, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  contactName: z.string().max(200, 'Contact name must be less than 200 characters').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().or(z.literal('')),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
