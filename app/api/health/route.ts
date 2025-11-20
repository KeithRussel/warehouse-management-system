/**
 * Health Check API - DELETE AFTER DEBUGGING
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection and table structure
    const results = await Promise.all([
      db.user.count().catch(e => ({ error: e.message })),
      db.product.count().catch(e => ({ error: e.message })),
      db.customer.count().catch(e => ({ error: e.message })),
      db.supplier.count().catch(e => ({ error: e.message })),
      db.storageLocation.count().catch(e => ({ error: e.message })),
      db.inboundOrder.count().catch(e => ({ error: e.message })),
      db.outboundOrder.count().catch(e => ({ error: e.message })),
    ]);

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      tables: {
        users: results[0],
        products: results[1],
        customers: results[2],
        suppliers: results[3],
        storageLocations: results[4],
        inboundOrders: results[5],
        outboundOrders: results[6],
      },
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
