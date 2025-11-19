/**
 * Amend Dispatched Order API
 * Created: November 18, 2025
 * Allows amending dispatched orders for returns or corrections
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const amendmentItemSchema = z.object({
  itemId: z.string(),
  newPickedQuantity: z.number().min(0),
  newBoxQuantity: z.number().min(0).nullable(),
  newWeightKilos: z.number().min(0).nullable(),
  reason: z.string().optional(),
});

const amendDispatchSchema = z.object({
  items: z.array(amendmentItemSchema),
  amendmentNotes: z.string().min(1, 'Amendment notes are required'),
});

// POST /api/outbound/[id]/amend - Amend dispatched order
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can amend dispatches
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

    const body = await request.json();
    const validatedData = amendDispatchSchema.parse(body);

    // Check if outbound order exists and is dispatched
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

    if (outboundOrder.status !== 'DISPATCHED') {
      return NextResponse.json(
        { error: 'Only dispatched orders can be amended' },
        { status: 400 }
      );
    }

    // Process amendments in a transaction
    await db.$transaction(async (tx) => {
      for (const amendment of validatedData.items) {
        // Get current item data
        const currentItem = outboundOrder.items.find((item) => item.id === amendment.itemId);

        if (!currentItem) {
          throw new Error(`Item ${amendment.itemId} not found in order`);
        }

        const currentPickedQty = currentItem.pickedQuantity || 0;
        const newPickedQty = amendment.newPickedQuantity;
        const quantityDifference = currentPickedQty - newPickedQty;

        // If quantity decreased (returned items), add back to inventory
        if (quantityDifference > 0) {
          // Add back to inventory with same batch
          await tx.inventory.upsert({
            where: {
              productId_batchNumber_expiryDate: {
                productId: currentItem.productId,
                batchNumber: currentItem.batchNumber || '',
                expiryDate: currentItem.expiryDate || new Date(),
              },
            },
            update: {
              quantity: { increment: quantityDifference },
            },
            create: {
              productId: currentItem.productId,
              batchNumber: currentItem.batchNumber || '',
              expiryDate: currentItem.expiryDate || new Date(),
              quantity: quantityDifference,
            },
          });

          // Create stock movement record for return
          await tx.stockMovement.create({
            data: {
              type: 'RETURN',
              productSku: currentItem.product.sku,
              productName: currentItem.product.name,
              batchNumber: currentItem.batchNumber || null,
              quantity: quantityDifference,
              reason: amendment.reason || 'Amendment - items returned',
              referenceNumber: `${outboundOrder.orderNumber} / ${outboundOrder.drNumber} (AMENDED)`,
              movedById: session.user.id,
            },
          });
        }

        // If quantity increased (additional items picked), reduce from inventory
        if (quantityDifference < 0) {
          const additionalQty = Math.abs(quantityDifference);

          // Reduce from inventory
          const inventory = await tx.inventory.findFirst({
            where: {
              productId: currentItem.productId,
              batchNumber: currentItem.batchNumber || '',
              quantity: { gte: additionalQty },
            },
          });

          if (!inventory) {
            throw new Error(
              `Insufficient inventory for ${currentItem.product.name} to pick additional ${additionalQty} boxes`
            );
          }

          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: { decrement: additionalQty } },
          });

          // Create stock movement record for additional pick
          await tx.stockMovement.create({
            data: {
              type: 'PICK',
              productSku: currentItem.product.sku,
              productName: currentItem.product.name,
              batchNumber: currentItem.batchNumber || null,
              quantity: additionalQty,
              reason: amendment.reason || 'Amendment - additional items picked',
              referenceNumber: `${outboundOrder.orderNumber} / ${outboundOrder.drNumber} (AMENDED)`,
              movedById: session.user.id,
            },
          });
        }

        // Calculate new total amount (weight × unit price)
        const newTotalAmount =
          amendment.newWeightKilos && currentItem.unitPrice
            ? amendment.newWeightKilos * Number(currentItem.unitPrice)
            : null;

        // Update order item with new values
        await tx.outboundOrderItem.update({
          where: { id: amendment.itemId },
          data: {
            pickedQuantity: amendment.newPickedQuantity,
            boxQuantity: amendment.newBoxQuantity,
            weightKilos: amendment.newWeightKilos,
            totalAmount: newTotalAmount,
          },
        });
      }

      // Add amendment log to order notes
      const amendmentLog = `\n\n[AMENDMENT - ${new Date().toISOString()}]\nAmended by: ${session.user.name || session.user.email}\nNotes: ${validatedData.amendmentNotes}`;

      await tx.outboundOrder.update({
        where: { id },
        data: {
          notes: (outboundOrder.notes || '') + amendmentLog,
        },
      });
    });

    // Fetch updated order
    const updatedOrder = await db.outboundOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error amending dispatch:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to amend dispatch', details: errorMessage },
      { status: 500 }
    );
  }
}
