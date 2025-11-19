/**
 * New Inbound Order Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { InboundOrderForm } from '@/components/forms/inbound-order-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'New Inbound Order | Cold Storage WMS',
  description: 'Create a new inbound receiving order',
};

export default async function NewInboundOrderPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Fetch suppliers and products for the form
  const [suppliers, products] = await Promise.all([
    db.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    db.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/inbound"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inbound Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">New Inbound Order</h1>
        <p className="text-gray-600 mt-1">
          Create a new receiving order from supplier
        </p>
      </div>

      {/* Form */}
      <InboundOrderForm suppliers={suppliers} products={products} />
    </div>
  );
}
