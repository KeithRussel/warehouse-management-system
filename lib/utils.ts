/**
 * Utility Functions
 * Created: November 14, 2025
 *
 * General-purpose utility functions used throughout the application.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addDays, differenceInDays, isAfter, isBefore, format } from 'date-fns';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format datetime to readable string
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Calculate expiry date from received date and shelf life
 */
export function calculateExpiryDate(receivedDate: Date, shelfLifeDays: number): Date {
  return addDays(receivedDate, shelfLifeDays);
}

/**
 * Check if item is expired
 */
export function isExpired(expiryDate: Date): boolean {
  return isBefore(expiryDate, new Date());
}

/**
 * Calculate days until expiry (negative if expired)
 */
export function daysUntilExpiry(expiryDate: Date): number {
  return differenceInDays(expiryDate, new Date());
}

/**
 * Check if item is near expiry (within threshold days)
 */
export function isNearExpiry(expiryDate: Date, thresholdDays: number = 7): boolean {
  const daysLeft = daysUntilExpiry(expiryDate);
  return daysLeft >= 0 && daysLeft <= thresholdDays;
}

/**
 * Generate unique order number with prefix and timestamp
 */
export function generateOrderNumber(prefix: string = 'ORD'): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate unique batch number
 */
export function generateBatchNumber(prefix: string = 'BAT'): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * Format temperature with unit
 */
export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

/**
 * Check if temperature is within safe range for zone
 */
export function isTemperatureSafe(
  temp: number,
  zone: 'FROZEN' | 'CHILLED' | 'AMBIENT'
): boolean {
  switch (zone) {
    case 'FROZEN':
      return temp <= -18;
    case 'CHILLED':
      return temp >= 0 && temp <= 5;
    case 'AMBIENT':
      return temp >= 15 && temp <= 25;
    default:
      return false;
  }
}

/**
 * Get temperature zone color class
 */
export function getTemperatureZoneColor(zone: 'FROZEN' | 'CHILLED' | 'AMBIENT'): string {
  switch (zone) {
    case 'FROZEN':
      return 'text-blue-600 bg-blue-50';
    case 'CHILLED':
      return 'text-cyan-600 bg-cyan-50';
    case 'AMBIENT':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower === 'completed' || statusLower === 'dispatched' || statusLower === 'active') {
    return 'text-green-600 bg-green-50';
  }

  if (statusLower === 'pending' || statusLower === 'receiving') {
    return 'text-yellow-600 bg-yellow-50';
  }

  if (statusLower === 'cancelled' || statusLower === 'expired') {
    return 'text-red-600 bg-red-50';
  }

  if (statusLower === 'picking' || statusLower === 'packed') {
    return 'text-blue-600 bg-blue-50';
  }

  return 'text-gray-600 bg-gray-50';
}

/**
 * Format quantity with unit
 */
export function formatQuantity(quantity: number, unit: string = 'pcs'): string {
  return `${quantity} ${unit}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format enum value to readable text
 */
export function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Parse search params to object
 */
export function parseSearchParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
