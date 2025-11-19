# Stores Directory

**Created:** November 14, 2025
**Last Updated:** November 14, 2025

## Overview

This directory contains Zustand stores for global state management across the application.

## Structure

```
stores/
├── use-auth-store.ts        # Authentication state
├── use-ui-store.ts          # UI state (sidebar, modals, etc.)
├── use-cart-store.ts        # Shopping cart for orders
└── use-scanner-store.ts     # Barcode scanner state
```

## Store Files

### `use-auth-store.ts` - Authentication Store
Manages user authentication state:
- Current user information
- User role and permissions
- Authentication status

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}
```

### `use-ui-store.ts` - UI Store
Manages UI state across the application:
- Sidebar open/closed state
- Modal visibility
- Loading states
- Toast notifications
- Theme preferences

```typescript
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```

### `use-cart-store.ts` - Cart Store
Manages items being added to orders:
- Items for inbound orders
- Items for outbound orders
- Add/remove/update items
- Clear cart

```typescript
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}
```

### `use-scanner-store.ts` - Scanner Store
Manages barcode scanner state:
- Scanner active/inactive
- Last scanned code
- Scanner mode (product, location, batch)

```typescript
interface ScannerState {
  isActive: boolean;
  lastScanned: string | null;
  mode: 'product' | 'location' | 'batch';
  setActive: (active: boolean) => void;
  setLastScanned: (code: string) => void;
  setMode: (mode: string) => void;
}
```

## Why Zustand?

Zustand is chosen for global state management because:
- **Simple API** - Easy to learn and use
- **Minimal boilerplate** - Less code than Redux
- **TypeScript support** - Excellent type inference
- **No providers** - No need to wrap app in providers
- **Devtools support** - Integration with Redux DevTools
- **Small bundle size** - ~1KB gzipped

## Usage Example

### Creating a Store

```typescript
// stores/use-example-store.ts
import { create } from 'zustand';

interface ExampleState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### Using a Store in Components

```typescript
import { useUIStore } from '@/stores/use-ui-store';

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  );
}
```

### Persisting State (Optional)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage', // localStorage key
    }
  )
);
```

## Best Practices

1. **Keep stores focused** - One store per domain
2. **Use TypeScript** - Define proper interfaces
3. **Avoid over-using** - Use React Query for server state
4. **Name consistently** - `use-[name]-store.ts` format
5. **Keep actions simple** - Complex logic should be in utilities
6. **Don't store server data** - Use TanStack Query instead

## Store vs. React Query

**Use Zustand for:**
- UI state (modals, sidebar, theme)
- Client-only state
- Cross-component communication
- Temporary state (cart, form wizards)

**Use TanStack Query for:**
- Server data (products, orders, users)
- Data fetching and caching
- Background refetching
- Optimistic updates

## Testing Stores

```typescript
import { renderHook, act } from '@testing-library/react';
import { useExampleStore } from './use-example-store';

describe('useExampleStore', () => {
  it('should increment count', () => {
    const { result } = renderHook(() => useExampleStore());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## Adding New Stores

1. Create file: `stores/use-[name]-store.ts`
2. Define TypeScript interface for state
3. Create store with `create()` function
4. Export store hook
5. Document usage in this README

## Dependencies

- `zustand` - State management library

---

**Last Updated:** November 14, 2025
