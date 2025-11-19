/**
 * Outbound Orders API Routes
 * Created: November 18, 2025
 * Handles customer orders with stock reservation and DR number generation
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createOutboundOrderSchema } from '@/lib/validations/outbound';
import { z } from 'zod';

// GET /api/outbound - List all outbound orders
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const outboundOrders = await db.outboundOrder.findMany({
      include: {
        customer: true,
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

    return NextResponse.json(outboundOrders);
  } catch (error) {
    console.error('Error fetching outbound orders:', error);
    return NextResponse.json({ error: 'Failed to fetch outbound orders' }, { status: 500 });
  }
}

// POST /api/outbound - Create new outbound order (Advance Order - reserves stock)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can create outbound orders
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createOutboundOrderSchema.parse(body);

    // Generate unique order number
    const orderNumber = await generateOutboundOrderNumber();

    // Check stock availability for all items
    for (const item of validatedData.items) {
      const availableStock = await getAvailableStock(item.productId);

      if (availableStock < item.requestedQuantity) {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true },
        });

        return NextResponse.json(
          {
            error: `Insufficient stock for ${product?.name || 'product'}. Available: ${availableStock}, Requested: ${item.requestedQuantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate total amount for each item (weight × unit price)
    const itemsWithTotals = validatedData.items.map((item) => ({
      productId: item.productId,
      requestedQuantity: item.requestedQuantity,
      boxQuantity: item.boxQuantity || null,
      weightKilos: item.weightKilos || null,
      unitPrice: item.unitPrice || null,
      totalAmount: item.unitPrice && item.weightKilos ? item.weightKilos * item.unitPrice : null,
      notes: item.notes || null,
    }));

    // Create outbound order (Status: PENDING = Advance Order)
    const outboundOrder = await db.outboundOrder.create({
      data: {
        orderNumber,
        customerId: validatedData.customerId,
        deliveryAddress: validatedData.deliveryAddress || null,
        notes: validatedData.notes || null,
        createdById: session.user.id,
        items: {
          create: itemsWithTotals,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(outboundOrder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating outbound order:', error);
    return NextResponse.json({ error: 'Failed to create outbound order' }, { status: 500 });
  }
}

// Helper function to generate unique outbound order number
async function generateOutboundOrderNumber(): Promise<string> {
  const lastOrder = await db.outboundOrder.findFirst({
    orderBy: { orderNumber: 'desc' },
  });

  if (!lastOrder) {
    return 'ORD0001';
  }

  // Extract number from last order number (e.g., "ORD0001" -> 1)
  const lastNumber = parseInt(lastOrder.orderNumber.replace('ORD', ''));
  const nextNumber = lastNumber + 1;

  // Format with leading zeros (ORD0001, ORD0002, etc.)
  return `ORD${String(nextNumber).padStart(4, '0')}`;
}

// Helper function to calculate available stock (On-Hand - Reserved)
async function getAvailableStock(productId: string): Promise<number> {
  // Get total on-hand stock
  const inventory = await db.inventory.aggregate({
    where: { productId },
    _sum: { quantity: true },
  });

  const onHandQty = inventory._sum.quantity || 0;

  // Get reserved stock from pending/picking/packed orders (not yet dispatched)
  const reserved = await db.outboundOrderItem.aggregate({
    where: {
      productId,
      outboundOrder: {
        status: { in: ['PENDING', 'PICKING', 'PACKED'] },
      },
    },
    _sum: { requestedQuantity: true },
  });

  const reservedQty = reserved._sum.requestedQuantity || 0;

  // Available = On-Hand - Reserved
  return onHandQty - reservedQty;
}
