-- AlterTable: Add missing columns to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weightPerUnit" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "unitsPerBox" INTEGER;

-- AlterTable: Add missing columns to inbound_orders
ALTER TABLE "inbound_orders" ADD COLUMN IF NOT EXISTS "receivedBy" TEXT;
ALTER TABLE "inbound_orders" ADD COLUMN IF NOT EXISTS "driverName" TEXT;
ALTER TABLE "inbound_orders" ADD COLUMN IF NOT EXISTS "plateNumber" TEXT;

-- AlterTable: Add missing columns to outbound_orders
ALTER TABLE "outbound_orders" ADD COLUMN IF NOT EXISTS "drNumber" TEXT;
ALTER TABLE "outbound_orders" ADD COLUMN IF NOT EXISTS "preparedBy" TEXT;

-- CreateIndex: Add unique constraint on drNumber
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'outbound_orders_drNumber_key') THEN
        CREATE UNIQUE INDEX "outbound_orders_drNumber_key" ON "outbound_orders"("drNumber");
    END IF;
END $$;
