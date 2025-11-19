/**
 * Inbound Orders API Routes
 * Created: November 18, 2025
 * Handles GET (list) and POST (create) operations for receiving orders
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createInboundOrderSchema } from '@/lib/validations/inbound';
import { z } from 'zod';

// GET /api/inbound - List all inbound orders
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inboundOrders = await db.inboundOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(inboundOrders);
  } catch (error) {
    console.error('Error fetching inbound orders:', error);
    return NextResponse.json({ error: 'Failed to fetch inbound orders' }, { status: 500 });
  }
}

// POST /api/inbound - Create new inbound order
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can create inbound orders
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createInboundOrderSchema.parse(body);

    // Generate unique order number
    const orderNumber = await generateInboundOrderNumber();

    // Create inbound order with items
    const inboundOrder = await db.inboundOrder.create({
      data: {
        orderNumber,
        supplierId: validatedData.supplierId,
        expectedDate: validatedData.expectedDate,
        receivedBy: validatedData.receivedBy || null,
        driverName: validatedData.driverName || null,
        plateNumber: validatedData.plateNumber || null,
        notes: validatedData.notes || null,
        createdById: session.user.id,
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            expectedQuantity: item.expectedQuantity,
            receivedQuantity: item.receivedQuantity || 0,
            batchNumber: item.batchNumber || null,
            expiryDate: item.expiryDate || null,
            temperatureOnReceipt: item.temperatureOnReceipt || null,
            locationId: item.locationId || null,
            unitPrice: item.unitPrice || null,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(inboundOrder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating inbound order:', error);
    return NextResponse.json({ error: 'Failed to create inbound order' }, { status: 500 });
  }
}

// Helper function to generate unique inbound order number
async function generateInboundOrderNumber(): Promise<string> {
  const lastOrder = await db.inboundOrder.findFirst({
    orderBy: { orderNumber: 'desc' },
  });

  if (!lastOrder) {
    return 'INB0001';
  }

  // Extract number from last order number (e.g., "INB0001" -> 1)
  const lastNumber = parseInt(lastOrder.orderNumber.replace('INB', ''));
  const nextNumber = lastNumber + 1;

  // Format with leading zeros (INB0001, INB0002, etc.)
  return `INB${String(nextNumber).padStart(4, '0')}`;
}
