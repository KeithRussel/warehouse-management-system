# Library Directory

**Created:** November 14, 2025
**Last Updated:** November 14, 2025

## Overview

This directory contains utility functions, configurations, and helper modules used throughout the application.

## Structure

```
lib/
├── validations/     # Zod schemas for validation
├── db.ts            # Prisma client instance
├── auth.ts          # NextAuth configuration
├── utils.ts         # General utility functions
├── fefo.ts          # FEFO (First Expired First Out) logic
├── excel.ts         # Excel export utilities
└── constants.ts     # Application constants
```

## Key Files

### `db.ts` - Database Client
Singleton Prisma client instance for database operations.

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### `auth.ts` - Authentication Configuration
NextAuth.js configuration with local credentials provider.

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db';
import bcrypt from 'bcryptjs';

export const { auth, handlers, signIn, signOut } = NextAuth({
  // Configuration
});
```

### `utils.ts` - Utility Functions
General-purpose utility functions:
- `cn()` - Tailwind class name merger
- `formatDate()` - Date formatting
- `calculateExpiryDate()` - Calculate expiry from received date
- `isExpired()` - Check if item is expired
- `daysUntilExpiry()` - Days remaining until expiry
- `generateOrderNumber()` - Generate unique order numbers

### `fefo.ts` - FEFO Logic
First Expired, First Out inventory management:
- `sortByFefo()` - Sort inventory by expiry date
- `getNextToExpire()` - Get items expiring soonest
- `filterExpired()` - Filter out expired items
- `getNearExpiry()` - Get items near expiry threshold

### `excel.ts` - Excel Export
Export data to Excel format:
- `exportInventoryToExcel()` - Export inventory report
- `exportMovementsToExcel()` - Export stock movements
- `exportOrdersToExcel()` - Export orders
- `generateExcelFile()` - Generic Excel generator

### `constants.ts` - Application Constants
Application-wide constants:
- Temperature zone definitions
- Default expiry thresholds
- Role permissions
- Movement types
- Status enums

## Validation Directory (`validations/`)

Zod schemas for form and API validation:

```
validations/
├── product.ts       # Product validation schemas
├── supplier.ts      # Supplier validation schemas
├── inbound.ts       # Inbound order schemas
├── outbound.ts      # Outbound order schemas
├── user.ts          # User management schemas
├── location.ts      # Storage location schemas
└── auth.ts          # Authentication schemas
```

### Example Schema

```typescript
// lib/validations/product.ts
import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  barcode: z.string().optional(),
  temperatureZone: z.enum(['FROZEN', 'CHILLED', 'AMBIENT']),
  shelfLifeDays: z.number().min(1, 'Shelf life must be at least 1 day'),
  minStockLevel: z.number().min(0).optional(),
  maxStockLevel: z.number().min(0).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

## Best Practices

1. **Keep utilities pure** - No side effects
2. **Type everything** - Use TypeScript types
3. **Document functions** - Add JSDoc comments
4. **Test utilities** - Write unit tests for complex logic
5. **Avoid duplication** - Extract common patterns
6. **Handle errors** - Proper error handling and validation

## Usage Examples

### Using Database Client

```typescript
import { db } from '@/lib/db';

// Get all products
const products = await db.product.findMany();

// Create a product
const product = await db.product.create({
  data: {
    sku: 'SKU001',
    name: 'Product Name',
    temperatureZone: 'FROZEN',
    shelfLifeDays: 180,
  },
});
```

### Using Validation

```typescript
import { productSchema } from '@/lib/validations/product';

// Validate data
const result = productSchema.safeParse(formData);

if (!result.success) {
  console.error(result.error.errors);
  return;
}

// Use validated data
const validData = result.data;
```

### Using Utilities

```typescript
import { cn, calculateExpiryDate, isExpired } from '@/lib/utils';

// Merge Tailwind classes
const className = cn('bg-blue-500', 'hover:bg-blue-600');

// Calculate expiry
const expiryDate = calculateExpiryDate(new Date(), 180); // 180 days shelf life

// Check if expired
const expired = isExpired(expiryDate);
```

## Adding New Utilities

1. Create function in appropriate file
2. Add TypeScript types
3. Add JSDoc documentation
4. Export function
5. Write tests if complex logic

## Dependencies

- `@prisma/client` - Database client
- `next-auth` - Authentication
- `bcryptjs` - Password hashing
- `zod` - Schema validation
- `date-fns` - Date utilities
- `clsx` - Class name utility
- `tailwind-merge` - Tailwind merger
- `xlsx` - Excel generation

---

**Last Updated:** November 14, 2025
