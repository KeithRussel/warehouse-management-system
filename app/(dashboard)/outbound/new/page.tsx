/**
 * New Outbound Order Page
 * Created: November 18, 2025
 * Form for creating new customer orders with stock availability
 */

import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { OutboundOrderForm } from '@/components/forms/outbound-order-form';

export const dynamic = 'force-dynamic';

async function getProducts() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // Calculate available stock for each product
  const productsWithAvailability = await Promise.all(
    products.map(async (product) => {
      // Get total on-hand stock
      const inventory = await db.inventory.aggregate({
        where: { productId: product.id },
        _sum: { quantity: true },
      });
      const onHandQty = inventory._sum.quantity || 0;

      // Get reserved stock from non-dispatched orders
      const reserved = await db.outboundOrderItem.aggregate({
        where: {
          productId: product.id,
          outboundOrder: {
            status: { in: ['PENDING', 'PICKING', 'PACKED'] },
          },
        },
        _sum: { requestedQuantity: true },
      });
      const reservedQty = reserved._sum.requestedQuantity || 0;

      return {
        ...product,
        availableStock: onHandQty - reservedQty,
      };
    })
  );

  return productsWithAvailability;
}

async function getCustomers() {
  return await db.customer.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export default async function NewOutboundOrderPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Only admin and super admin can create orders
  if (session.user.role === 'EMPLOYEE') {
    redirect('/outbound');
  }

  const [products, customers] = await Promise.all([
    getProducts(),
    getCustomers(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/outbound">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Outbound Order
          </h1>
          <p className="text-muted-foreground">
            Create a new advance order to reserve stock for customer
          </p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No customers available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You need to create at least one customer before creating orders.
          </p>
          <Button asChild className="mt-4">
            <Link href="/customers/new">Create Customer</Link>
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No products available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You need to have at least one active product before creating orders.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products/new">Create Product</Link>
          </Button>
        </div>
      ) : (
        <div className="max-w-5xl">
          <OutboundOrderForm products={products} customers={customers} />
        </div>
      )}
    </div>
  );
}
