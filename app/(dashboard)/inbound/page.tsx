/**
 * Inbound Orders List Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { InboundOrdersTable } from '@/components/tables/inbound-orders-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Inbound Orders | Cold Storage WMS',
  description: 'Manage inbound receiving orders',
};

export default async function InboundOrdersPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch inbound orders with related data
  const inboundOrders = await db.inboundOrder.findMany({
    include: {
      supplier: true,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inbound Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage receiving orders and stock intake
          </p>
        </div>
        {(session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') && (
          <Link href="/inbound/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Inbound Order
            </Button>
          </Link>
        )}
      </div>

      {/* Inbound Orders Table */}
      <InboundOrdersTable data={inboundOrders} />
    </div>
  );
}
