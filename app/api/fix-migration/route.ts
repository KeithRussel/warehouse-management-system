/**
 * Migration Fix API - DELETE AFTER USE
 * Fixes the failed migration state in production database
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Delete the failed migration record
    await db.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations"
      WHERE migration_name = '20251120152845_add_customers_table'
    `);

    return NextResponse.json({
      status: 'ok',
      message: 'Failed migration record removed. Redeploy to apply the new migration.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
