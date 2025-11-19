/**
 * Storage Location Validation Schemas
 * Created: November 14, 2025
 */

import { z } from 'zod';

export const locationSchema = z.object({
  code: z
    .string()
    .min(1, 'Location code is required')
    .max(50, 'Location code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Location code can only contain uppercase letters, numbers, hyphens, and underscores'),
  zone: z.string().min(1, 'Zone is required').max(100, 'Zone must be less than 100 characters'),
  section: z.string().max(50, 'Section must be less than 50 characters').optional().or(z.literal('')),
  rack: z.string().max(50, 'Rack must be less than 50 characters').optional().or(z.literal('')),
  shelf: z.string().max(50, 'Shelf must be less than 50 characters').optional().or(z.literal('')),
  temperatureZone: z.enum(['FROZEN', 'CHILLED', 'AMBIENT'], {
    required_error: 'Temperature zone is required',
  }),
  capacity: z
    .number()
    .int('Capacity must be a whole number')
    .min(0, 'Capacity cannot be negative')
    .optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;
