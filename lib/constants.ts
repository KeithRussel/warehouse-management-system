/**
 * Application Constants
 * Created: November 14, 2025
 *
 * Application-wide constants and configuration values.
 */

/**
 * Temperature Zone Definitions
 */
export const TEMPERATURE_ZONES = {
  FROZEN: {
    label: 'Frozen',
    value: 'FROZEN',
    minTemp: -30,
    maxTemp: -18,
    description: '-18°C or below',
    color: 'blue',
  },
  CHILLED: {
    label: 'Chilled',
    value: 'CHILLED',
    minTemp: 0,
    maxTemp: 5,
    description: '0°C to 5°C',
    color: 'cyan',
  },
  AMBIENT: {
    label: 'Ambient',
    value: 'AMBIENT',
    minTemp: 15,
    maxTemp: 25,
    description: 'Room temperature',
    color: 'orange',
  },
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    value: 'SUPER_ADMIN',
    description: 'Full system access and user management',
  },
  ADMIN: {
    label: 'Admin',
    value: 'ADMIN',
    description: 'Manage inventory, reports, and suppliers',
  },
  EMPLOYEE: {
    label: 'Employee',
    value: 'EMPLOYEE',
    description: 'Daily operations and data entry',
  },
} as const;

/**
 * Order Status Values
 */
export const INBOUND_STATUS = {
  PENDING: { label: 'Pending', value: 'PENDING', color: 'yellow' },
  RECEIVING: { label: 'Receiving', value: 'RECEIVING', color: 'blue' },
  COMPLETED: { label: 'Completed', value: 'COMPLETED', color: 'green' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED', color: 'red' },
} as const;

export const OUTBOUND_STATUS = {
  PENDING: { label: 'Pending', value: 'PENDING', color: 'yellow' },
  PICKING: { label: 'Picking', value: 'PICKING', color: 'blue' },
  PACKED: { label: 'Packed', value: 'PACKED', color: 'indigo' },
  DISPATCHED: { label: 'Dispatched', value: 'DISPATCHED', color: 'green' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED', color: 'red' },
} as const;

/**
 * Stock Movement Types
 */
export const MOVEMENT_TYPES = {
  RECEIPT: { label: 'Receipt', value: 'RECEIPT', icon: 'ArrowDown' },
  PICK: { label: 'Pick', value: 'PICK', icon: 'ArrowUp' },
  ADJUSTMENT: { label: 'Adjustment', value: 'ADJUSTMENT', icon: 'Edit' },
  TRANSFER: { label: 'Transfer', value: 'TRANSFER', icon: 'ArrowRightLeft' },
  RETURN: { label: 'Return', value: 'RETURN', icon: 'RotateCcw' },
  DISPOSAL: { label: 'Disposal', value: 'DISPOSAL', icon: 'Trash2' },
} as const;

/**
 * Units of Measure
 */
export const UNITS_OF_MEASURE = [
  { label: 'Pieces', value: 'pcs' },
  { label: 'Kilograms', value: 'kg' },
  { label: 'Grams', value: 'g' },
  { label: 'Boxes', value: 'box' },
  { label: 'Cases', value: 'case' },
  { label: 'Cartons', value: 'carton' },
  { label: 'Pallets', value: 'pallet' },
  { label: 'Bags', value: 'bag' },
] as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  EXPIRY_WARNING_DAYS: 7, // Warn when items are within 7 days of expiry
  LOW_STOCK_MULTIPLIER: 0.2, // 20% of max stock level
  PAGE_SIZE: 20, // Default pagination size
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  DATE_FORMAT: 'MMM dd, yyyy',
  DATETIME_FORMAT: 'MMM dd, yyyy HH:mm',
} as const;

/**
 * API Routes
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id: string) => `/api/products/${id}`,
    BY_BARCODE: (barcode: string) => `/api/products/barcode/${barcode}`,
  },
  INVENTORY: {
    BASE: '/api/inventory',
    BY_ID: (id: string) => `/api/inventory/${id}`,
    EXPIRING: '/api/inventory/expiring',
    LOW_STOCK: '/api/inventory/low-stock',
    ADJUST: '/api/inventory/adjust',
  },
  INBOUND: {
    BASE: '/api/inbound',
    BY_ID: (id: string) => `/api/inbound/${id}`,
    RECEIVE: (id: string) => `/api/inbound/${id}/receive`,
  },
  OUTBOUND: {
    BASE: '/api/outbound',
    BY_ID: (id: string) => `/api/outbound/${id}`,
    PICK: (id: string) => `/api/outbound/${id}/pick`,
    DISPATCH: (id: string) => `/api/outbound/${id}/dispatch`,
  },
  SUPPLIERS: {
    BASE: '/api/suppliers',
    BY_ID: (id: string) => `/api/suppliers/${id}`,
  },
  LOCATIONS: {
    BASE: '/api/locations',
    BY_ID: (id: string) => `/api/locations/${id}`,
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
  },
  TEMPERATURE: {
    BASE: '/api/temperature',
    BY_LOCATION: (id: string) => `/api/temperature/location/${id}`,
  },
  REPORTS: {
    INVENTORY: '/api/reports/inventory',
    MOVEMENTS: '/api/reports/movements',
    EXPIRY: '/api/reports/expiry',
    TEMPERATURE: '/api/reports/temperature',
    EXPORT: '/api/reports/export',
  },
} as const;

/**
 * Navigation Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  PRODUCTS: '/products',
  PRODUCTS_NEW: '/products/new',
  PRODUCTS_EDIT: (id: string) => `/products/${id}`,
  INBOUND: '/inbound',
  INBOUND_NEW: '/inbound/new',
  INBOUND_DETAIL: (id: string) => `/inbound/${id}`,
  OUTBOUND: '/outbound',
  OUTBOUND_NEW: '/outbound/new',
  OUTBOUND_DETAIL: (id: string) => `/outbound/${id}`,
  LOCATIONS: '/locations',
  SUPPLIERS: '/suppliers',
  USERS: '/users',
  TEMPERATURE: '/temperature',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const;

/**
 * Permission Levels
 */
export const PERMISSIONS = {
  VIEW_DASHBOARD: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'],
  MANAGE_PRODUCTS: ['SUPER_ADMIN', 'ADMIN'],
  MANAGE_INVENTORY: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'],
  MANAGE_INBOUND: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'],
  MANAGE_OUTBOUND: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'],
  MANAGE_SUPPLIERS: ['SUPER_ADMIN', 'ADMIN'],
  MANAGE_LOCATIONS: ['SUPER_ADMIN', 'ADMIN'],
  MANAGE_USERS: ['SUPER_ADMIN'],
  VIEW_REPORTS: ['SUPER_ADMIN', 'ADMIN'],
  LOG_TEMPERATURE: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'],
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  SKU_MIN_LENGTH: 1,
  SKU_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 200,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\d\s\-\+\(\)]+$/,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999999,
  MIN_TEMPERATURE: -50,
  MAX_TEMPERATURE: 50,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  PRODUCT_NOT_FOUND: 'Product not found',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
  EXPIRED_PRODUCT: 'Cannot pick expired products',
  INVALID_TEMPERATURE_ZONE: 'Product temperature zone does not match location',
  LOCATION_NOT_FOUND: 'Storage location not found',
  ORDER_NOT_FOUND: 'Order not found',
  DUPLICATE_SKU: 'A product with this SKU already exists',
  DUPLICATE_BARCODE: 'A product with this barcode already exists',
  NETWORK_ERROR: 'Network error. Please try again.',
  SERVER_ERROR: 'An error occurred. Please try again later.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  INVENTORY_ADJUSTED: 'Inventory adjusted successfully',
  ORDER_CREATED: 'Order created successfully',
  ORDER_COMPLETED: 'Order completed successfully',
  RECEIVED_SUCCESSFULLY: 'Goods received successfully',
  PICKED_SUCCESSFULLY: 'Order picked successfully',
  DISPATCHED_SUCCESSFULLY: 'Order dispatched successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;
