/**
 * Edit Supplier Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { SupplierForm } from '@/components/forms/supplier-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Supplier | Cold Storage WMS',
  description: 'Edit supplier details',
};

interface EditSupplierPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Fetch supplier
  const supplier = await db.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    redirect('/suppliers');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/suppliers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Suppliers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Supplier</h1>
        <p className="text-gray-600 mt-1">
          Update supplier details for {supplier.name}
        </p>
      </div>

      {/* Form */}
      <SupplierForm initialData={supplier} />
    </div>
  );
}
