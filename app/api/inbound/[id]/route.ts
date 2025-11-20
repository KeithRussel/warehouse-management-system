/**
 * Inbound Order API Routes by ID
 * Created: November 18, 2025
 * Handles GET, PATCH, DELETE operations and receiving workflow
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateInboundOrderSchema } from '@/lib/validations/inbound';
import { z } from 'zod';

// GET /api/inbound/[id] - Get single inbound order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const inboundOrder = await db.inboundOrder.findUnique({
      where: { id },
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
    });

    if (!inboundOrder) {
      return NextResponse.json({ error: 'Inbound order not found' }, { status: 404 });
    }

    return NextResponse.json(inboundOrder);
  } catch (error) {
    console.error('Error fetching inbound order:', error);
    return NextResponse.json({ error: 'Failed to fetch inbound order' }, { status: 500 });
  }
}

// PATCH /api/inbound/[id] - Update inbound order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can update inbound orders
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();

    // Validate request body
    const validatedData = updateInboundOrderSchema.parse(body);

    // Check if inbound order exists
    const existingOrder = await db.inboundOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Inbound order not found' }, { status: 404 });
    }

    // Prevent modification if already completed
    if (existingOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot modify completed inbound order' },
        { status: 400 }
      );
    }

    // Update inbound order
    const inboundOrder = await db.inboundOrder.update({
      where: { id },
      data: {
        supplierId: validatedData.supplierId,
        status: validatedData.status,
        expectedDate: validatedData.expectedDate,
        receivedDate: validatedData.receivedDate,
        receivedBy: validatedData.receivedBy || null,
        driverName: validatedData.driverName || null,
        plateNumber: validatedData.plateNumber || null,
        notes: validatedData.notes || null,
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

    return NextResponse.json(inboundOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating inbound order:', error);
    return NextResponse.json({ error: 'Failed to update inbound order' }, { status: 500 });
  }
}

// DELETE /api/inbound/[id] - Delete inbound order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can delete inbound orders
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if inbound order exists
    const existingOrder = await db.inboundOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Inbound order not found' }, { status: 404 });
    }

    // Prevent deletion if already completed
    if (existingOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed inbound order' },
        { status: 400 }
      );
    }

    // Delete inbound order (items will be cascade deleted)
    await db.inboundOrder.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Inbound order deleted successfully' });
  } catch (error) {
    console.error('Error deleting inbound order:', error);
    return NextResponse.json({ error: 'Failed to delete inbound order' }, { status: 500 });
  }
}
