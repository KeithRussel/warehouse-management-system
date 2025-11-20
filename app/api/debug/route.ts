/**
 * Debug API Route - DELETE AFTER TESTING
 * Tests database connection and user lookup
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Test 1: Database connection
    const userCount = await db.user.count();

    // Test 2: Find admin user
    const adminUser = await db.user.findUnique({
      where: { email: 'admin@wms.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true, // We'll check if password exists
      },
    });

    // Test 3: Test password verification
    let passwordTest = null;
    if (adminUser?.password) {
      const testPassword = 'admin123';
      passwordTest = await bcrypt.compare(testPassword, adminUser.password);
    }

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
      },
      adminUser: {
        exists: !!adminUser,
        email: adminUser?.email,
        name: adminUser?.name,
        role: adminUser?.role,
        isActive: adminUser?.isActive,
        hasPassword: !!adminUser?.password,
        passwordCorrect: passwordTest,
      },
      environment: {
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
