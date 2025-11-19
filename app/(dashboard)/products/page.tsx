/**
 * Products List Page
 * Created: November 14, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductsTable } from '@/components/tables/products-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Products | Cold Storage WMS',
  description: 'Manage product catalog',
};

export default async function ProductsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check permissions
  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Fetch products with inventory data and reserved quantities
  const products = await db.product.findMany({
    include: {
      inventory: {
        include: {
          location: true,
        },
      },
      outboundOrderItems: {
        where: {
          outboundOrder: {
            status: {
              in: ['PENDING', 'PICKING', 'PACKED'],
            },
          },
        },
        select: {
          requestedQuantity: true,
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog with inventory tracking
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      <ProductsTable data={products} />
    </div>
  );
}
