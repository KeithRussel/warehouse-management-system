/**
 * New Customer Page
 * Created: November 18, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CustomerForm } from '@/components/forms/customer-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Add Customer | Cold Storage WMS',
  description: 'Add a new customer to the system',
};

export default async function NewCustomerPage() {
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
          href="/customers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-600 mt-1">
          Create a new customer record in the system
        </p>
      </div>

      {/* Form */}
      <CustomerForm />
    </div>
  );
}
