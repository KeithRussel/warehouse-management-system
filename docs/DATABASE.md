# Database Documentation

**Created:** November 14, 2025
**Last Updated:** November 14, 2025

## Overview

This document provides detailed information about the PostgreSQL database schema, relationships, and data management for the Cold Storage Warehouse Management System.

## Database Technology

- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Schema Location:** `prisma/schema.prisma`

## Entity Relationship Diagram

```
Users (1) ──────< (M) InboundOrders
Users (1) ──────< (M) OutboundOrders
Users (1) ──────< (M) StockMovements
Users (1) ──────< (M) TemperatureLogs

Suppliers (1) ───< (M) InboundOrders

Products (1) ────< (M) Inventory
Products (1) ────< (M) InboundOrderItems
Products (1) ────< (M) OutboundOrderItems

StorageLocations (1) < (M) Inventory
StorageLocations (1) < (M) StockMovements
StorageLocations (1) < (M) TemperatureLogs

InboundOrders (1) < (M) InboundOrderItems
OutboundOrders (1) < (M) OutboundOrderItems
```

## Entities

### Users
Manages all user accounts with role-based access control.

**Fields:**
- `id` (String, PK) - Unique identifier (CUID)
- `email` (String, Unique) - User email address
- `username` (String, Unique) - Login username
- `password` (String) - Hashed password (bcrypt)
- `name` (String) - Full name
- `role` (Enum) - User role: SUPER_ADMIN, ADMIN, EMPLOYEE
- `isActive` (Boolean) - Account status
- `createdAt` (DateTime) - Account creation date
- `updatedAt` (DateTime) - Last update date

**Relationships:**
- Has many InboundOrders (as creator)
- Has many OutboundOrders (as creator)
- Has many StockMovements (as mover)
- Has many TemperatureLogs (as logger)

**Indexes:**
- email (unique)
- username (unique)

---

### Suppliers
Stores supplier information for procurement.

**Fields:**
- `id` (String, PK) - Unique identifier
- `code` (String, Unique) - Supplier code
- `name` (String) - Supplier name
- `contactName` (String?) - Contact person
- `email` (String?) - Contact email
- `phone` (String?) - Contact phone
- `address` (String?) - Supplier address
- `isActive` (Boolean) - Supplier status
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Has many InboundOrders

**Indexes:**
- code (unique)

---

### Products
Product catalog with temperature zone requirements.

**Fields:**
- `id` (String, PK) - Unique identifier
- `sku` (String, Unique) - Stock Keeping Unit
- `barcode` (String?, Unique) - Product barcode
- `name` (String) - Product name
- `description` (String?) - Product description
- `category` (String?) - Product category
- `temperatureZone` (Enum) - FROZEN, CHILLED, AMBIENT
- `shelfLifeDays` (Int) - Days before expiry
- `minStockLevel` (Int?) - Minimum stock threshold
- `maxStockLevel` (Int?) - Maximum stock capacity
- `unit` (String) - Unit of measure (pcs, kg, box)
- `isActive` (Boolean) - Product status
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Has many Inventory items
- Has many InboundOrderItems
- Has many OutboundOrderItems

**Indexes:**
- sku (unique)
- barcode (unique)

**Temperature Zones:**
- **FROZEN:** -18°C or below
- **CHILLED:** 0°C to 5°C
- **AMBIENT:** Room temperature

---

### StorageLocations
Physical storage locations in the warehouse.

**Fields:**
- `id` (String, PK) - Unique identifier
- `code` (String, Unique) - Location code (e.g., "A1-R3-S2")
- `zone` (String) - Zone name (e.g., "Freezer A")
- `section` (String?) - Section identifier
- `rack` (String?) - Rack identifier
- `shelf` (String?) - Shelf identifier
- `temperatureZone` (Enum) - FROZEN, CHILLED, AMBIENT
- `capacity` (Int?) - Maximum capacity
- `isActive` (Boolean) - Location status
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Has many Inventory items
- Has many StockMovements
- Has many TemperatureLogs

**Indexes:**
- code (unique)

**Location Hierarchy:**
```
Zone → Section → Rack → Shelf
Example: Freezer A → A1 → R3 → S2
Code: A1-R3-S2
```

---

### Inventory
Current stock levels by product, location, and batch.

**Fields:**
- `id` (String, PK) - Unique identifier
- `productId` (String, FK) - Product reference
- `locationId` (String, FK) - Storage location reference
- `batchNumber` (String) - Batch/lot number
- `quantity` (Int) - Current quantity
- `expiryDate` (DateTime) - Expiry date
- `receivedDate` (DateTime) - Date received
- `temperatureOnReceipt` (Float?) - Temperature when received
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Belongs to Product
- Belongs to StorageLocation

**Indexes:**
- productId
- expiryDate
- batchNumber
- Unique constraint: [productId, locationId, batchNumber]

**Business Rules:**
- Quantity must be > 0
- Expiry date must be future date at creation
- Temperature zone must match product and location

---

### InboundOrders
Purchase orders for receiving goods.

**Fields:**
- `id` (String, PK) - Unique identifier
- `orderNumber` (String, Unique) - Order number
- `supplierId` (String, FK) - Supplier reference
- `status` (Enum) - PENDING, RECEIVING, COMPLETED, CANCELLED
- `expectedDate` (DateTime?) - Expected delivery date
- `receivedDate` (DateTime?) - Actual receipt date
- `notes` (String?) - Order notes
- `createdById` (String, FK) - User who created order
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Belongs to Supplier
- Belongs to User (creator)
- Has many InboundOrderItems

**Indexes:**
- orderNumber (unique)

**Status Flow:**
```
PENDING → RECEIVING → COMPLETED
         ↓
      CANCELLED
```

---

### InboundOrderItems
Line items for inbound orders.

**Fields:**
- `id` (String, PK) - Unique identifier
- `inboundOrderId` (String, FK) - Order reference
- `productId` (String, FK) - Product reference
- `expectedQuantity` (Int) - Expected quantity
- `receivedQuantity` (Int) - Actual received quantity
- `batchNumber` (String?) - Batch number
- `expiryDate` (DateTime?) - Product expiry date
- `temperatureOnReceipt` (Float?) - Temperature check
- `locationId` (String?) - Assigned storage location
- `notes` (String?) - Item notes
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Belongs to InboundOrder (cascade delete)
- Belongs to Product

---

### OutboundOrders
Sales orders for picking and dispatch.

**Fields:**
- `id` (String, PK) - Unique identifier
- `orderNumber` (String, Unique) - Order number
- `customerName` (String?) - Customer name
- `customerAddress` (String?) - Delivery address
- `status` (Enum) - PENDING, PICKING, PACKED, DISPATCHED, CANCELLED
- `orderDate` (DateTime) - Order creation date
- `pickDate` (DateTime?) - Picking completion date
- `dispatchDate` (DateTime?) - Dispatch date
- `truckTemperature` (Float?) - Delivery truck temperature
- `notes` (String?) - Order notes
- `createdById` (String, FK) - User who created order
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Belongs to User (creator)
- Has many OutboundOrderItems

**Indexes:**
- orderNumber (unique)

**Status Flow:**
```
PENDING → PICKING → PACKED → DISPATCHED
          ↓
       CANCELLED
```

---

### OutboundOrderItems
Line items for outbound orders.

**Fields:**
- `id` (String, PK) - Unique identifier
- `outboundOrderId` (String, FK) - Order reference
- `productId` (String, FK) - Product reference
- `requestedQuantity` (Int) - Requested quantity
- `pickedQuantity` (Int) - Actually picked quantity
- `batchNumber` (String?) - Picked batch number
- `expiryDate` (DateTime?) - Product expiry date
- `notes` (String?) - Item notes
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update

**Relationships:**
- Belongs to OutboundOrder (cascade delete)
- Belongs to Product

**FEFO Logic:**
- System automatically suggests items expiring soonest
- Cannot pick expired items
- Warns on items near expiry

---

### StockMovements
Audit trail of all inventory movements.

**Fields:**
- `id` (String, PK) - Unique identifier
- `type` (Enum) - RECEIPT, PICK, ADJUSTMENT, TRANSFER, RETURN, DISPOSAL
- `productSku` (String) - Product SKU
- `productName` (String) - Product name (denormalized)
- `batchNumber` (String?) - Batch number
- `fromLocation` (String?) - Source location code
- `toLocationId` (String?, FK) - Destination location
- `quantity` (Int) - Movement quantity
- `reason` (String?) - Movement reason
- `referenceNumber` (String?) - Order/reference number
- `movedById` (String, FK) - User who performed movement
- `createdAt` (DateTime) - Movement timestamp

**Relationships:**
- Belongs to StorageLocation (to location)
- Belongs to User (mover)

**Indexes:**
- productSku
- createdAt

**Movement Types:**
- **RECEIPT:** Goods received (inbound)
- **PICK:** Goods picked for order
- **ADJUSTMENT:** Stock count adjustment
- **TRANSFER:** Move between locations
- **RETURN:** Return to stock
- **DISPOSAL:** Waste/disposal

---

### TemperatureLogs
Temperature monitoring for storage locations.

**Fields:**
- `id` (String, PK) - Unique identifier
- `locationId` (String, FK) - Location reference
- `temperature` (Float) - Temperature reading (°C)
- `notes` (String?) - Log notes
- `loggedById` (String, FK) - User who logged
- `createdAt` (DateTime) - Log timestamp

**Relationships:**
- Belongs to StorageLocation
- Belongs to User (logger)

**Indexes:**
- locationId
- createdAt

**Temperature Thresholds:**
- Frozen: ≤ -18°C
- Chilled: 0-5°C
- Ambient: 15-25°C (room temp)

---

## Database Operations

### Connection

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Seeding

```bash
# Seed database
npx prisma db seed
```

### Backup

```bash
# Backup database
pg_dump -h localhost -U username -d warehouse_db > backup.sql

# Restore database
psql -h localhost -U username -d warehouse_db < backup.sql
```

## Performance Optimization

### Indexes
All foreign keys and frequently queried fields are indexed:
- User email, username
- Product SKU, barcode
- Inventory productId, expiryDate, batchNumber
- StockMovement productSku, createdAt
- TemperatureLog locationId, createdAt

### Query Optimization
- Use `select` to fetch only needed fields
- Use `include` sparingly
- Implement pagination for large datasets
- Use database-level sorting when possible

### Connection Pooling
Prisma handles connection pooling automatically. Configure in `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Connection string format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&connection_limit=5
```

---

**Last Updated:** November 14, 2025
