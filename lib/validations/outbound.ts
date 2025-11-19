/**
 * Outbound Order Validation Schemas
 * Created: November 18, 2025
 * Based on Excel Orders sheet requirements
 */

import { z } from 'zod';

// Validation for outbound order item
export const outboundOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  requestedQuantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  boxQuantity: z
    .number()
    .int('Box quantity must be a whole number')
    .min(0, 'Box quantity cannot be negative')
    .optional()
    .nullable(),
  weightKilos: z
    .number()
    .min(0, 'Weight cannot be negative')
    .optional()
    .nullable(),
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

// Validation for creating outbound order
export const createOutboundOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  deliveryAddress: z
    .string()
    .max(500, 'Delivery address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  items: z.array(outboundOrderItemSchema).min(1, 'At least one item is required'),
});

// Validation for updating outbound order
export const updateOutboundOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required').optional(),
  deliveryAddress: z
    .string()
    .max(500, 'Delivery address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['PENDING', 'PICKING', 'PACKED', 'DISPATCHED', 'CANCELLED']).optional(),
  preparedBy: z
    .string()
    .max(100, 'Prepared by name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  receivedByCustomer: z
    .string()
    .max(100, 'Received by name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

// Validation for dispatching order (generates DR number)
export const dispatchOrderSchema = z.object({
  preparedBy: z
    .string()
    .min(1, 'Prepared by is required')
    .max(100, 'Prepared by name must be less than 100 characters'),
  items: z.array(
    z.object({
      itemId: z.string().min(1, 'Item ID is required'),
      pickedQuantity: z
        .number()
        .int('Picked quantity must be a whole number')
        .min(0, 'Picked quantity cannot be negative'),
      boxQuantity: z
        .number()
        .int('Box quantity must be a whole number')
        .min(0, 'Box quantity cannot be negative')
        .optional()
        .nullable(),
      weightKilos: z
        .number()
        .min(0, 'Weight cannot be negative')
        .optional()
        .nullable(),
      batchNumber: z.string().optional().nullable(),
      expiryDate: z.date().optional().nullable(),
    })
  ).min(1, 'At least one item is required'),
});

export type OutboundOrderItemFormData = z.infer<typeof outboundOrderItemSchema>;
export type CreateOutboundOrderFormData = z.infer<typeof createOutboundOrderSchema>;
export type UpdateOutboundOrderFormData = z.infer<typeof updateOutboundOrderSchema>;
export type DispatchOrderFormData = z.infer<typeof dispatchOrderSchema>;
