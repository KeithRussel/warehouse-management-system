/**
 * Inbound Order Receiving Workflow API
 * Created: November 18, 2025
 * Handles receiving items and updating inventory
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { receiveInboundItemSchema } from '@/lib/validations/inbound';
import { z } from 'zod';

// POST /api/inbound/[id]/receive - Receive items and update inventory
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
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Validate all items - convert date strings to Date objects
    const validatedItems = items.map((item) => {
      const itemWithDates = {
        ...item,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      };
      return receiveInboundItemSchema.parse(itemWithDates);
    });

    // Check if inbound order exists
    const inboundOrder = await db.inboundOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!inboundOrder) {
      return NextResponse.json({ error: 'Inbound order not found' }, { status: 404 });
    }

    if (inboundOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Inbound order already completed' },
        { status: 400 }
      );
    }

    // Process receiving in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update each inbound order item
      for (const item of validatedItems) {
        console.log('Processing item:', item.itemId);
        const orderItem = inboundOrder.items.find((i) => i.id === item.itemId);

        if (!orderItem) {
          throw new Error(`Item ${item.itemId} not found in inbound order`);
        }

        console.log('Updating inbound order item...');
        try {
          // Update inbound order item
          await tx.inboundOrderItem.update({
            where: { id: item.itemId },
            data: {
              receivedQuantity: item.receivedQuantity,
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate,
              temperatureOnReceipt: item.temperatureOnReceipt,
              locationId: item.locationId,
              unitPrice: item.unitPrice,
            },
          });
          console.log('Inbound order item updated');
        } catch (updateError) {
          throw new Error(`Failed to update inbound order item: ${updateError instanceof Error ? updateError.message : String(updateError)}`);
        }

        // Only add to inventory if received quantity > 0
        if (item.receivedQuantity > 0) {
          console.log('Checking for existing inventory...');
          // Check if inventory record exists for this batch
          const existingInventory = await tx.inventory.findUnique({
            where: {
              productId_locationId_batchNumber: {
                productId: orderItem.productId,
                locationId: item.locationId,
                batchNumber: item.batchNumber,
              },
            },
          });
          console.log('Existing inventory:', existingInventory ? 'found' : 'not found');

          if (existingInventory) {
            // Update existing inventory
            await tx.inventory.update({
              where: { id: existingInventory.id },
              data: {
                quantity: {
                  increment: item.receivedQuantity,
                },
              },
            });
          } else {
            // Create new inventory record
            await tx.inventory.create({
              data: {
                productId: orderItem.productId,
                locationId: item.locationId,
                batchNumber: item.batchNumber,
                quantity: item.receivedQuantity,
                expiryDate: item.expiryDate,
                receivedDate: new Date(),
                temperatureOnReceipt: item.temperatureOnReceipt,
              },
            });
          }

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              type: 'RECEIPT',
              productSku: orderItem.product.sku,
              productName: orderItem.product.name,
              batchNumber: item.batchNumber,
              toLocationId: item.locationId,
              quantity: item.receivedQuantity,
              reason: 'Inbound receipt',
              referenceNumber: inboundOrder.orderNumber,
              movedById: session.user.id,
            },
          });
          console.log('Stock movement created');
        }
      }

      console.log('All items processed. Checking if all items fully received...');
      // Check if all items are fully received
      const allItemsReceived = inboundOrder.items.every((item) => {
        const receivedItem = validatedItems.find((v) => v.itemId === item.id);
        if (!receivedItem) return false;
        return receivedItem.receivedQuantity >= item.expectedQuantity;
      });
      console.log('All items received:', allItemsReceived);

      console.log('Updating inbound order status...');
      console.log('Order ID:', id);
      console.log('New status:', allItemsReceived ? 'COMPLETED' : 'RECEIVING');
      console.log('New receivedDate:', allItemsReceived ? new Date() : inboundOrder.receivedDate);

      // Update inbound order status - simplified without includes first
      console.log('About to execute UPDATE query...');
      const updatedOrder = await tx.inboundOrder.update({
        where: { id },
        data: {
          status: allItemsReceived ? 'COMPLETED' : 'RECEIVING',
          receivedDate: allItemsReceived ? new Date() : inboundOrder.receivedDate,
        },
      });
      console.log('Inbound order updated successfully (basic)');

      // Now fetch with includes separately
      console.log('Fetching updated order with relations...');
      const fullOrder = await tx.inboundOrder.findUnique({
        where: { id },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
              location: true,
            },
          },
        },
      });
      console.log('Full order fetched successfully');
      return fullOrder!
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Get error message without logging (Next.js has bugs with error logging)
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: 'Failed to receive items',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
