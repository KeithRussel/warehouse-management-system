/**
 * Suppliers List Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { SuppliersTable } from '@/components/tables/suppliers-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Suppliers | Cold Storage WMS',
  description: 'Manage supplier information',
};

export default async function SuppliersPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check permissions
  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Fetch suppliers
  const suppliers = await db.supplier.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">
            Manage supplier information and contacts
          </p>
        </div>
        <Link href="/suppliers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </div>

      {/* Suppliers Table */}
      <SuppliersTable data={suppliers} />
    </div>
  );
}
