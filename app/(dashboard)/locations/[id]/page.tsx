/**
 * Edit Storage Location Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { LocationForm } from '@/components/forms/location-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Storage Location | Cold Storage WMS',
  description: 'Edit storage location details',
};

interface EditLocationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Fetch location
  const location = await db.storageLocation.findUnique({
    where: { id },
  });

  if (!location) {
    redirect('/locations');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/locations"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Storage Locations
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Storage Location</h1>
        <p className="text-gray-600 mt-1">
          Update location details for {location.code}
        </p>
      </div>

      {/* Form */}
      <LocationForm initialData={location} />
    </div>
  );
}
