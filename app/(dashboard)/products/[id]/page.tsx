/**
 * Edit Product Page
 * Created: November 14, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductForm } from '@/components/forms/product-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Product | Cold Storage WMS',
  description: 'Edit product details',
};

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'EMPLOYEE') {
    redirect('/dashboard');
  }

  // Fetch product
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    redirect('/products');
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">
          Update product details for {product.name}
        </p>
      </div>

      {/* Form */}
      <ProductForm initialData={product} />
    </div>
  );
}
