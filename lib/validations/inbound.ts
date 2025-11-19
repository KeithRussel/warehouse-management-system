/**
 * Inbound Order Validation Schemas
 * Created: November 18, 2025
 * Enhanced based on Excel reference file analysis
 */

import { z } from 'zod';

// Validation for inbound order item
export const inboundOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  expectedQuantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  receivedQuantity: z
    .number()
    .int('Received quantity must be a whole number')
    .min(0, 'Received quantity cannot be negative')
    .optional(),
  batchNumber: z
    .string()
    .max(100, 'Batch number must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  expiryDate: z.date().optional().nullable(),
  temperatureOnReceipt: z
    .number()
    .min(-50, 'Temperature seems too low')
    .max(50, 'Temperature seems too high')
    .optional()
    .nullable(),
  locationId: z.string().optional().nullable(),
  unitPrice: z
    .number()
    .min(0, 'Unit price cannot be negative')
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Validation for creating inbound order
export const createInboundOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDate: z.date().optional().nullable(),
  receivedBy: z
    .string()
    .max(100, 'Received by name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  driverName: z
    .string()
    .max(100, 'Driver name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  plateNumber: z
    .string()
    .max(50, 'Plate number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  items: z.array(inboundOrderItemSchema).min(1, 'At least one item is required'),
});

// Validation for updating inbound order
export const updateInboundOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required').optional(),
  status: z.enum(['PENDING', 'RECEIVING', 'COMPLETED', 'CANCELLED']).optional(),
  expectedDate: z.date().optional().nullable(),
  receivedDate: z.date().optional().nullable(),
  receivedBy: z
    .string()
    .max(100, 'Received by name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  driverName: z
    .string()
    .max(100, 'Driver name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  plateNumber: z
    .string()
    .max(50, 'Plate number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

// Validation for receiving items
export const receiveInboundItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  receivedQuantity: z
    .number()
    .int('Received quantity must be a whole number')
    .min(0, 'Received quantity cannot be negative'),
  batchNumber: z
    .string()
    .min(1, 'Batch number is required')
    .max(100, 'Batch number must be less than 100 characters'),
  expiryDate: z.date(),
  temperatureOnReceipt: z
    .number()
    .min(-50, 'Temperature seems too low')
    .max(50, 'Temperature seems too high')
    .optional()
    .nullable(),
  locationId: z.string().min(1, 'Storage location is required'),
  unitPrice: z
    .number()
    .min(0, 'Unit price cannot be negative')
    .optional()
    .nullable(),
});

export type InboundOrderItemFormData = z.infer<typeof inboundOrderItemSchema>;
export type CreateInboundOrderFormData = z.infer<typeof createInboundOrderSchema>;
export type UpdateInboundOrderFormData = z.infer<typeof updateInboundOrderSchema>;
export type ReceiveInboundItemFormData = z.infer<typeof receiveInboundItemSchema>;
