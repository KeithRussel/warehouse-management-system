/**
 * Customers List Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { CustomersTable } from '@/components/tables/customers-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Customers | Cold Storage WMS',
  description: 'Manage customer information',
};

export default async function CustomersPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check permissions
  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Fetch customers
  const customers = await db.customer.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage customer information and contacts
          </p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Customers Table */}
      <CustomersTable data={customers} />
    </div>
  );
}
