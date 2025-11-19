# App Directory

**Created:** November 14, 2025
**Last Updated:** November 14, 2025

## Overview

This directory contains the Next.js 15 App Router structure. All pages, layouts, and API routes are defined here.

## Structure

```
app/
├── (auth)/              # Authentication routes (grouped)
│   ├── login/          # Login page
│   └── layout.tsx      # Auth layout
├── (dashboard)/        # Main application routes (grouped)
│   ├── dashboard/      # Dashboard home
│   ├── inventory/      # Inventory management
│   ├── products/       # Product catalog
│   ├── inbound/        # Receiving orders
│   ├── outbound/       # Picking/dispatch orders
│   ├── locations/      # Storage locations
│   ├── suppliers/      # Supplier management
│   ├── users/          # User management
│   ├── temperature/    # Temperature logs
│   ├── reports/        # Reports and analytics
│   └── layout.tsx      # Dashboard layout
├── api/                # API routes
│   ├── auth/          # Authentication endpoints
│   ├── products/      # Product CRUD
│   ├── inventory/     # Inventory operations
│   ├── inbound/       # Inbound order operations
│   ├── outbound/      # Outbound order operations
│   └── reports/       # Report generation
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Home page
```

## Route Groups

### `(auth)` - Authentication Routes
Public routes for authentication. Uses a minimal layout without navigation.

**Routes:**
- `/login` - User login page
- `/register` - User registration (Super Admin only)

### `(dashboard)` - Protected Dashboard Routes
All main application routes. Requires authentication. Uses dashboard layout with sidebar.

**Routes:**
- `/dashboard` - Main dashboard with overview
- `/inventory` - Inventory listing and management
- `/products` - Product catalog
- `/products/new` - Add new product
- `/products/[id]` - Edit product
- `/inbound` - Inbound orders (receiving)
- `/inbound/new` - Create receiving order
- `/inbound/[id]` - Process receiving order
- `/outbound` - Outbound orders (picking/dispatch)
- `/outbound/new` - Create pick order
- `/outbound/[id]` - Process pick order
- `/locations` - Storage location management
- `/suppliers` - Supplier management
- `/users` - User management (Admin/Super Admin only)
- `/temperature` - Temperature logging
- `/reports` - Reports and analytics

## API Routes

All API routes follow RESTful conventions:

### Authentication (`/api/auth/`)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Products (`/api/products/`)
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product by ID
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/products/barcode/[code]` - Get product by barcode

### Inventory (`/api/inventory/`)
- `GET /api/inventory` - List inventory
- `GET /api/inventory/[id]` - Get inventory item
- `POST /api/inventory/adjust` - Stock adjustment
- `GET /api/inventory/expiring` - Get items expiring soon
- `GET /api/inventory/low-stock` - Get low stock items

### Inbound Orders (`/api/inbound/`)
- `GET /api/inbound` - List inbound orders
- `POST /api/inbound` - Create inbound order
- `GET /api/inbound/[id]` - Get inbound order
- `PATCH /api/inbound/[id]` - Update inbound order
- `POST /api/inbound/[id]/receive` - Process receiving
- `DELETE /api/inbound/[id]` - Cancel order

### Outbound Orders (`/api/outbound/`)
- `GET /api/outbound` - List outbound orders
- `POST /api/outbound` - Create outbound order
- `GET /api/outbound/[id]` - Get outbound order
- `PATCH /api/outbound/[id]` - Update outbound order
- `POST /api/outbound/[id]/pick` - Process picking
- `POST /api/outbound/[id]/dispatch` - Mark as dispatched
- `DELETE /api/outbound/[id]` - Cancel order

### Storage Locations (`/api/locations/`)
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `PATCH /api/locations/[id]` - Update location
- `DELETE /api/locations/[id]` - Delete location

### Suppliers (`/api/suppliers/`)
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PATCH /api/suppliers/[id]` - Update supplier
- `DELETE /api/suppliers/[id]` - Delete supplier

### Users (`/api/users/`)
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Super Admin only)
- `PATCH /api/users/[id]` - Update user (Admin only)
- `DELETE /api/users/[id]` - Delete user (Super Admin only)

### Temperature Logs (`/api/temperature/`)
- `GET /api/temperature` - List temperature logs
- `POST /api/temperature` - Create temperature log
- `GET /api/temperature/location/[id]` - Get logs by location

### Reports (`/api/reports/`)
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/movements` - Stock movement report
- `GET /api/reports/expiry` - Expiry report
- `GET /api/reports/temperature` - Temperature report
- `GET /api/reports/export` - Export to Excel

## Layouts

### Root Layout (`layout.tsx`)
Global layout for the entire application:
- Imports global CSS
- Sets up fonts
- Wraps with providers (React Query, Toast, etc.)

### Auth Layout (`(auth)/layout.tsx`)
Minimal layout for authentication pages:
- No navigation
- Centered content
- Clean design

### Dashboard Layout (`(dashboard)/layout.tsx`)
Main application layout:
- Sidebar navigation
- Top header with user menu
- Breadcrumbs
- Protected route wrapper

## Page Structure

Each page follows this structure:

```typescript
// app/(dashboard)/products/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | WMS',
  description: 'Product catalog management',
};

export default async function ProductsPage() {
  // Server-side data fetching (optional)
  const products = await getProducts();

  return (
    <div>
      <PageHeader title="Products" />
      <ProductsTable data={products} />
    </div>
  );
}
```

## API Route Structure

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await db.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle POST request
}
```

## Best Practices

1. **Use route groups** - Organize related routes with `(group)`
2. **Metadata per page** - Define SEO metadata
3. **Server Components** - Use by default for better performance
4. **Client Components** - Use `'use client'` only when needed
5. **Error handling** - Use `error.tsx` files
6. **Loading states** - Use `loading.tsx` files
7. **API validation** - Validate input with Zod
8. **Auth protection** - Check auth in API routes and pages

## Authentication

All dashboard routes are protected and require authentication:

```typescript
// middleware.ts (at root)
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Error Handling

Use error boundaries:

```typescript
// app/(dashboard)/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Loading States

```typescript
// app/(dashboard)/products/loading.tsx
export default function Loading() {
  return <LoadingSpinner />;
}
```

---

**Last Updated:** November 14, 2025
