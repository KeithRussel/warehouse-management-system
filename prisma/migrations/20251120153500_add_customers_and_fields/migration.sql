-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");

-- AlterTable: Add customerId and deliveryAddress columns to outbound_orders
ALTER TABLE "outbound_orders" ADD COLUMN "customerId" TEXT;
ALTER TABLE "outbound_orders" ADD COLUMN "deliveryAddress" TEXT;

-- AddForeignKey
ALTER TABLE "outbound_orders" ADD CONSTRAINT "outbound_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
