/**
 * Storage Locations List Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { LocationsTable } from '@/components/tables/locations-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Storage Locations | Cold Storage WMS',
  description: 'Manage warehouse storage locations',
};

export default async function LocationsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check permissions
  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Fetch locations with inventory data
  const locations = await db.storageLocation.findMany({
    include: {
      inventory: {
        select: {
          quantity: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate utilization for each location
  const locationsWithStats = locations.map((location) => {
    const currentStock = location.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const utilization = location.capacity ? Math.round((currentStock / location.capacity) * 100) : 0;

    return {
      ...location,
      currentStock,
      utilization,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storage Locations</h1>
          <p className="text-gray-600 mt-1">
            Manage warehouse storage locations and capacity
          </p>
        </div>
        <Link href="/locations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Locations Table */}
      <LocationsTable data={locationsWithStats} />
    </div>
  );
}
