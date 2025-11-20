/**
 * Outbound Orders List Page
 * Created: November 18, 2025
 * Displays all customer orders with filtering and actions
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { OutboundOrdersTable } from '@/components/tables/outbound-orders-table';
import { Skeleton } from '@/components/ui/skeleton';

async function getOutboundOrders() {
  return await db.outboundOrder.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Serialize orders for client component (convert Decimal to number)
function serializeOrders(orders: Awaited<ReturnType<typeof getOutboundOrders>>) {
  return orders.map(order => ({
    ...order,
    items: order.items.map(item => ({
      ...item,
      weightKilos: item.weightKilos ? Number(item.weightKilos) : null,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
      totalAmount: item.totalAmount ? Number(item.totalAmount) : null,
    })),
  }));
}

async function OutboundOrdersContent() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const ordersRaw = await getOutboundOrders();
  const orders = serializeOrders(ordersRaw);

  return (
    <OutboundOrdersTable
      orders={orders}
      userRole={session.user.role}
      onDelete={async (id: string) => {
        'use server';
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/outbound/${id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete order');
        }
      }}
    />
  );
}

export default async function OutboundOrdersPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const canCreate =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outbound Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and dispatch deliveries
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/outbound/new">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        )}
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <OutboundOrdersContent />
      </Suspense>
    </div>
  );
}
