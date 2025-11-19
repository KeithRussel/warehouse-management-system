# Components Directory

**Created:** November 14, 2025
**Last Updated:** November 14, 2025

## Overview

This directory contains all React components used throughout the application.

## Structure

```
components/
├── ui/              # Shadcn UI base components (Button, Input, Dialog, etc.)
├── forms/           # Form components for data entry
├── tables/          # Table components for data display
└── layouts/         # Layout components (Header, Sidebar, Navigation)
```

## Component Categories

### UI Components (`ui/`)
Base UI components from Shadcn/ui library. These are the building blocks:
- Buttons, Inputs, Selects
- Dialogs, Modals, Sheets
- Cards, Tables, Tabs
- Alerts, Badges, Toast
- Form elements

**Note:** These components are auto-generated via Shadcn CLI.

### Form Components (`forms/`)
Reusable form components for different entities:
- `product-form.tsx` - Product creation/editing
- `supplier-form.tsx` - Supplier management
- `inbound-form.tsx` - Receiving goods form
- `outbound-form.tsx` - Order creation form
- `location-form.tsx` - Storage location form
- `user-form.tsx` - User management form
- `temperature-log-form.tsx` - Temperature logging

### Table Components (`tables/`)
Data table components using TanStack Table:
- `inventory-table.tsx` - Inventory listing
- `products-table.tsx` - Product catalog
- `orders-table.tsx` - Orders listing
- `suppliers-table.tsx` - Supplier list
- `users-table.tsx` - User management table
- `movements-table.tsx` - Stock movement history

### Layout Components (`layouts/`)
Page layout and navigation components:
- `dashboard-layout.tsx` - Main dashboard layout
- `sidebar.tsx` - Navigation sidebar
- `header.tsx` - Top header with user menu
- `breadcrumb.tsx` - Breadcrumb navigation
- `page-header.tsx` - Page title and actions

## Naming Conventions

- Use kebab-case for file names: `product-form.tsx`
- Use PascalCase for component names: `ProductForm`
- Prefix form components with entity name: `ProductForm`, `SupplierForm`
- Suffix table components with `Table`: `InventoryTable`

## Best Practices

1. **Keep components focused** - One responsibility per component
2. **Use TypeScript** - Define proper prop types
3. **Make components reusable** - Extract common patterns
4. **Handle loading states** - Show loading indicators
5. **Handle errors** - Display error messages
6. **Accessibility** - Use semantic HTML and ARIA labels
7. **Responsive design** - Mobile-first approach

## Example Component Structure

```typescript
// components/forms/product-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validations/product';

interface ProductFormProps {
  defaultValues?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
}

export function ProductForm({ defaultValues, onSubmit }: ProductFormProps) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Adding New Components

1. Create component file in appropriate subdirectory
2. Define TypeScript interfaces for props
3. Implement component with proper error handling
4. Export component from index file (if applicable)
5. Add documentation comments

## Dependencies

- `react` - React library
- `react-hook-form` - Form handling
- `@radix-ui/*` - UI primitives (via Shadcn)
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
- `tailwind-merge` - Tailwind class merging

---

**Last Updated:** November 14, 2025
