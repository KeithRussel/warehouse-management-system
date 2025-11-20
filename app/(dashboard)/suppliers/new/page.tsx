/**
 * New Supplier Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SupplierForm } from '@/components/forms/supplier-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Add Supplier | Cold Storage WMS',
  description: 'Add a new supplier to the system',
};

export default async function NewSupplierPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
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
        <h1 className="text-3xl font-bold text-gray-900">Add New Supplier</h1>
        <p className="text-gray-600 mt-1">
          Create a new supplier record in the system
        </p>
      </div>

      {/* Form */}
      <SupplierForm />
    </div>
  );
}
