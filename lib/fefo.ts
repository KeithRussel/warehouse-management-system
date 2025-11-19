/**
 * FEFO (First Expired, First Out) Logic
 * Created: November 14, 2025
 *
 * Implements First Expired First Out inventory management logic
 * for cold storage warehouse operations.
 */

import { isBefore, parseISO } from 'date-fns';

/**
 * Inventory item interface for FEFO operations
 */
export interface InventoryItem {
  id: string;
  productId: string;
  locationId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date | string;
  receivedDate: Date | string;
}

/**
 * Sort inventory items by FEFO logic (earliest expiry first)
 *
 * @param items - Array of inventory items
 * @returns Sorted array with items expiring soonest first
 */
export function sortByFefo<T extends Pick<InventoryItem, 'expiryDate'>>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const dateA = typeof a.expiryDate === 'string' ? parseISO(a.expiryDate) : a.expiryDate;
    const dateB = typeof b.expiryDate === 'string' ? parseISO(b.expiryDate) : b.expiryDate;

    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Get items that are expiring soonest
 *
 * @param items - Array of inventory items
 * @param count - Number of items to return
 * @returns Array of items expiring soonest
 */
export function getNextToExpire<T extends Pick<InventoryItem, 'expiryDate'>>(
  items: T[],
  count: number = 10
): T[] {
  return sortByFefo(items).slice(0, count);
}

/**
 * Filter out expired items
 *
 * @param items - Array of inventory items
 * @param currentDate - Current date (defaults to now)
 * @returns Array of non-expired items
 */
export function filterExpired<T extends Pick<InventoryItem, 'expiryDate'>>(
  items: T[],
  currentDate: Date = new Date()
): T[] {
  return items.filter(item => {
    const expiryDate = typeof item.expiryDate === 'string'
      ? parseISO(item.expiryDate)
      : item.expiryDate;
    return !isBefore(expiryDate, currentDate);
  });
}

/**
 * Get items near expiry within threshold days
 *
 * @param items - Array of inventory items
 * @param thresholdDays - Days until expiry threshold
 * @returns Array of items near expiry
 */
export function getNearExpiry<T extends Pick<InventoryItem, 'expiryDate'>>(
  items: T[],
  thresholdDays: number = 7
): T[] {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);

  return items.filter(item => {
    const expiryDate = typeof item.expiryDate === 'string'
      ? parseISO(item.expiryDate)
      : item.expiryDate;

    // Not expired yet but expiring within threshold
    return !isBefore(expiryDate, now) && isBefore(expiryDate, thresholdDate);
  });
}

/**
 * Get available quantity for picking using FEFO logic
 * Excludes expired items and prioritizes items expiring soonest
 *
 * @param items - Array of inventory items for same product
 * @param requestedQty - Quantity requested
 * @returns Array of items to pick with quantities
 */
export function getPickingItems(
  items: InventoryItem[],
  requestedQty: number
): Array<InventoryItem & { pickQuantity: number }> {
  // Filter out expired items
  const validItems = filterExpired(items);

  // Sort by FEFO
  const sortedItems = sortByFefo(validItems);

  const pickingList: Array<InventoryItem & { pickQuantity: number }> = [];
  let remainingQty = requestedQty;

  for (const item of sortedItems) {
    if (remainingQty <= 0) break;

    const pickQty = Math.min(item.quantity, remainingQty);

    pickingList.push({
      ...item,
      pickQuantity: pickQty,
    });

    remainingQty -= pickQty;
  }

  return pickingList;
}

/**
 * Calculate total available quantity (excluding expired items)
 *
 * @param items - Array of inventory items
 * @returns Total available quantity
 */
export function getTotalAvailableQuantity(items: InventoryItem[]): number {
  const validItems = filterExpired(items);
  return validItems.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Group inventory by product with FEFO information
 *
 * @param items - Array of inventory items
 * @returns Map of productId to inventory summary
 */
export function groupByProductWithFefo(
  items: InventoryItem[]
): Map<string, {
  productId: string;
  totalQuantity: number;
  availableQuantity: number;
  expiredQuantity: number;
  nearExpiryQuantity: number;
  nextExpiryDate: Date | null;
  items: InventoryItem[];
}> {
  const grouped = new Map<string, {
    productId: string;
    totalQuantity: number;
    availableQuantity: number;
    expiredQuantity: number;
    nearExpiryQuantity: number;
    nextExpiryDate: Date | null;
    items: InventoryItem[];
  }>();

  for (const item of items) {
    const existing = grouped.get(item.productId);

    const isExpired = isBefore(
      typeof item.expiryDate === 'string' ? parseISO(item.expiryDate) : item.expiryDate,
      new Date()
    );

    const isNearExpiry = getNearExpiry([item]).length > 0;

    if (existing) {
      existing.totalQuantity += item.quantity;
      existing.items.push(item);

      if (isExpired) {
        existing.expiredQuantity += item.quantity;
      } else {
        existing.availableQuantity += item.quantity;
      }

      if (isNearExpiry) {
        existing.nearExpiryQuantity += item.quantity;
      }

      // Update next expiry date if this item expires sooner
      const itemExpiry = typeof item.expiryDate === 'string'
        ? parseISO(item.expiryDate)
        : item.expiryDate;

      if (!existing.nextExpiryDate || isBefore(itemExpiry, existing.nextExpiryDate)) {
        existing.nextExpiryDate = itemExpiry;
      }
    } else {
      grouped.set(item.productId, {
        productId: item.productId,
        totalQuantity: item.quantity,
        availableQuantity: isExpired ? 0 : item.quantity,
        expiredQuantity: isExpired ? item.quantity : 0,
        nearExpiryQuantity: isNearExpiry ? item.quantity : 0,
        nextExpiryDate: typeof item.expiryDate === 'string'
          ? parseISO(item.expiryDate)
          : item.expiryDate,
        items: [item],
      });
    }
  }

  return grouped;
}

/**
 * Check if sufficient quantity is available for picking
 *
 * @param items - Array of inventory items for same product
 * @param requestedQty - Quantity requested
 * @returns True if sufficient quantity available
 */
export function hasSufficientStock(
  items: InventoryItem[],
  requestedQty: number
): boolean {
  return getTotalAvailableQuantity(items) >= requestedQty;
}

/**
 * Get FEFO priority score (lower is higher priority)
 * Used for sorting and prioritization
 *
 * @param item - Inventory item
 * @returns Priority score (days until expiry)
 */
export function getFefoPriority(item: Pick<InventoryItem, 'expiryDate'>): number {
  const expiryDate = typeof item.expiryDate === 'string'
    ? parseISO(item.expiryDate)
    : item.expiryDate;

  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry;
}
