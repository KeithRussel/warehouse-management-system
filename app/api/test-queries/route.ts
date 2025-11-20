/**
 * Test Queries API - DELETE AFTER DEBUGGING
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const results: Record<string, any> = {};

  try {
    // Test 1: Simple product count
    console.log('Testing product count...');
    results.productCount = await db.product.count();

    // Test 2: Simple product findMany
    console.log('Testing product findMany...');
    results.products = await db.product.findMany({
      take: 1,
    }).catch(e => ({ error: e.message }));

    // Test 3: Products with inventory (like the products page)
    console.log('Testing products with inventory...');
    results.productsWithInventory = await db.product.findMany({
      take: 1,
      include: {
        inventory: {
          include: {
            location: true,
          },
        },
      },
    }).catch(e => ({ error: e.message }));

    // Test 4: Products with outboundOrderItems
    console.log('Testing products with outboundOrderItems...');
    results.productsWithOrders = await db.product.findMany({
      take: 1,
      include: {
        outboundOrderItems: {
          where: {
            outboundOrder: {
              status: {
                in: ['PENDING', 'PICKING', 'PACKED'],
              },
            },
          },
          select: {
            requestedQuantity: true,
          },
        },
      },
    }).catch(e => ({ error: e.message }));

    // Test 5: Full products query
    console.log('Testing full products query...');
    results.fullProductsQuery = await db.product.findMany({
      take: 1,
      include: {
        inventory: {
          include: {
            location: true,
          },
        },
        outboundOrderItems: {
          where: {
            outboundOrder: {
              status: {
                in: ['PENDING', 'PICKING', 'PACKED'],
              },
            },
          },
          select: {
            requestedQuantity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(e => ({ error: e.message }));

    // Test 6: Inbound orders
    console.log('Testing inbound orders...');
    results.inboundOrders = await db.inboundOrder.findMany({
      take: 1,
      include: {
        supplier: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    }).catch(e => ({ error: e.message }));

    // Test 7: Outbound orders
    console.log('Testing outbound orders...');
    results.outboundOrders = await db.outboundOrder.findMany({
      take: 1,
      include: {
        customer: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    }).catch(e => ({ error: e.message }));

    return NextResponse.json({
      status: 'ok',
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        results,
      },
      { status: 500 }
    );
  }
}
