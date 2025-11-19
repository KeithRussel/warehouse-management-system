/**
 * New Product Page
 * Created: November 14, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProductForm } from '@/components/forms/product-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Add Product | Cold Storage WMS',
  description: 'Add a new product to the catalog',
};

export default async function NewProductPage() {
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
          href="/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-1">
          Create a new product in your catalog
        </p>
      </div>

      {/* Form */}
      <ProductForm />
    </div>
  );
}
