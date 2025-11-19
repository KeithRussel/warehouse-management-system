/**
 * Outbound Order Dispatch Workflow API
 * Created: November 18, 2025
 * Handles order dispatch - generates DR number and reduces inventory
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { dispatchOrderSchema } from '@/lib/validations/outbound';
import { z } from 'zod';

// POST /api/outbound/[id]/dispatch - Dispatch order (generate DR, reduce inventory)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

    const body = await request.json();

    // Convert date strings to Date objects for items
    const formattedBody = {
      ...body,
      items: body.items?.map((item: any) => ({
        ...item,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      })) || [],
    };

    const validatedData = dispatchOrderSchema.parse(formattedBody);

    // Check if outbound order exists
    const outboundOrder = await db.outboundOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!outboundOrder) {
      return NextResponse.json({ error: 'Outbound order not found' }, { status: 404 });
    }

    if (outboundOrder.status === 'DISPATCHED') {
      return NextResponse.json(
        { error: 'Order already dispatched' },
        { status: 400 }
      );
    }

    // Generate DR number
    const drNumber = await generateDRNumber();

    // Process dispatch in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update each outbound order item and reduce inventory
      for (const dispatchItem of validatedData.items) {
        const orderItem = outboundOrder.items.find((i) => i.id === dispatchItem.itemId);

        if (!orderItem) {
          throw new Error(`Item ${dispatchItem.itemId} not found in order`);
        }

        if (dispatchItem.pickedQuantity > orderItem.requestedQuantity) {
          throw new Error(
            `Picked quantity (${dispatchItem.pickedQuantity}) cannot exceed requested quantity (${orderItem.requestedQuantity}) for ${orderItem.product.name}`
          );
        }

        // Update outbound order item
        await tx.outboundOrderItem.update({
          where: { id: dispatchItem.itemId },
          data: {
            pickedQuantity: dispatchItem.pickedQuantity,
            boxQuantity: dispatchItem.boxQuantity,
            weightKilos: dispatchItem.weightKilos,
            batchNumber: dispatchItem.batchNumber,
            expiryDate: dispatchItem.expiryDate,
          },
        });

        // Reduce inventory (FIFO - First In, First Out)
        if (dispatchItem.pickedQuantity > 0) {
          await reduceInventory(
            tx,
            orderItem.productId,
            dispatchItem.pickedQuantity,
            dispatchItem.batchNumber
          );

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              type: 'PICK',
              productSku: orderItem.product.sku,
              productName: orderItem.product.name,
              batchNumber: dispatchItem.batchNumber || null,
              quantity: dispatchItem.pickedQuantity,
              reason: 'Outbound dispatch',
              referenceNumber: `${outboundOrder.orderNumber} / ${drNumber}`,
              movedById: session.user.id,
            },
          });
        }
      }

      // Update outbound order status
      const updatedOrder = await tx.outboundOrder.update({
        where: { id },
        data: {
          status: 'DISPATCHED',
          drNumber,
          dispatchDate: new Date(),
          preparedBy: validatedData.preparedBy,
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

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error dispatching order:', errorMessage);
    return NextResponse.json(
      {
        error: 'Failed to dispatch order',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Helper function to generate DR number
async function generateDRNumber(): Promise<string> {
  const lastDR = await db.outboundOrder.findFirst({
    where: { drNumber: { not: null } },
    orderBy: { drNumber: 'desc' },
  });

  if (!lastDR || !lastDR.drNumber) {
    return 'DR-001';
  }

  // Extract number from last DR (e.g., "DR-001" -> 1)
  const lastNumber = parseInt(lastDR.drNumber.split('-')[1]);
  const nextNumber = lastNumber + 1;

  // Format with leading zeros (DR-001, DR-018, etc.)
  return `DR-${String(nextNumber).padStart(3, '0')}`;
}

// Helper function to reduce inventory using FIFO
async function reduceInventory(
  tx: any,
  productId: string,
  quantity: number,
  batchNumber?: string | null
): Promise<void> {
  let remainingQty = quantity;

  // Get inventory records sorted by FIFO (oldest expiry date first)
  const inventoryRecords = await tx.inventory.findMany({
    where: {
      productId,
      quantity: { gt: 0 },
      ...(batchNumber ? { batchNumber } : {}),
    },
    orderBy: { expiryDate: 'asc' }, // FIFO: First expiring first
  });

  if (inventoryRecords.length === 0) {
    throw new Error('No inventory available for this product');
  }

  for (const record of inventoryRecords) {
    if (remainingQty <= 0) break;

    const qtyToReduce = Math.min(record.quantity, remainingQty);

    await tx.inventory.update({
      where: { id: record.id },
      data: {
        quantity: {
          decrement: qtyToReduce,
        },
      },
    });

    remainingQty -= qtyToReduce;
  }

  if (remainingQty > 0) {
    throw new Error(`Insufficient inventory. Short by ${remainingQty} units`);
  }
}
