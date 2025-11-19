/**
 * Login Page
 * Created: November 14, 2025
 */

import { Metadata } from 'next';
import { LoginForm } from '@/components/forms/login-form';

export const metadata: Metadata = {
  title: 'Login | Cold Storage WMS',
  description: 'Login to Cold Storage Warehouse Management System',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Cold Storage WMS
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Warehouse Management System
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
