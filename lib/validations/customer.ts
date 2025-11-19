/**
 * Customer Validation Schemas
 * Created: November 18, 2025
 */

import { z } from 'zod';

export const customerSchema = z.object({
  code: z
    .string()
    .min(1, 'Customer code is required')
    .max(50, 'Customer code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Customer code can only contain uppercase letters, numbers, hyphens, and underscores'),
  name: z
    .string()
    .min(1, 'Customer name is required')
    .max(200, 'Customer name must be less than 200 characters'),
  contactPerson: z
    .string()
    .max(100, 'Contact person name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(50, 'Phone number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
