/**
 * Edit Customer Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { CustomerForm } from '@/components/forms/customer-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Customer | Cold Storage WMS',
  description: 'Edit customer details',
};

interface EditCustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Fetch customer
  const customer = await db.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    redirect('/customers');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
        <p className="text-gray-600 mt-1">
          Update customer details for {customer.name}
        </p>
      </div>

      {/* Form */}
      <CustomerForm initialData={customer} />
    </div>
  );
}
