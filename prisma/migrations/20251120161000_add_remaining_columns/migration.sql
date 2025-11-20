-- AlterTable: Add missing column to outbound_orders
ALTER TABLE "outbound_orders" ADD COLUMN IF NOT EXISTS "receivedByCustomer" TEXT;

-- AlterTable: Add missing column to inbound_order_items
ALTER TABLE "inbound_order_items" ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(10,2);

-- AlterTable: Add missing columns to outbound_order_items
ALTER TABLE "outbound_order_items" ADD COLUMN IF NOT EXISTS "boxQuantity" INTEGER;
ALTER TABLE "outbound_order_items" ADD COLUMN IF NOT EXISTS "weightKilos" DECIMAL(10,2);
ALTER TABLE "outbound_order_items" ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(10,2);
ALTER TABLE "outbound_order_items" ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(10,2);
