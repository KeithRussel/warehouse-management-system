/**
 * One-time setup route to create super admin
 * DELETE THIS FILE after running once in production
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Check if super admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Super admin already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create super admin
    const superAdmin = await db.user.create({
      data: {
        email: 'admin@warehouse.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'Super admin created successfully',
      email: superAdmin.email,
      note: 'DELETE /app/api/setup/route.ts after running this once',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create super admin' },
      { status: 500 }
    );
  }
}
