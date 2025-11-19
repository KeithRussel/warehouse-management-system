/**
 * Outbound Order API Routes by ID
 * Created: November 18, 2025
 * Handles GET, PATCH, DELETE operations for individual orders
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateOutboundOrderSchema } from '@/lib/validations/outbound';
import { z } from 'zod';

// GET /api/outbound/[id] - Get single outbound order
export async function GET(
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

    const outboundOrder = await db.outboundOrder.findUnique({
      where: { id },
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
    });

    if (!outboundOrder) {
      return NextResponse.json({ error: 'Outbound order not found' }, { status: 404 });
    }

    return NextResponse.json(outboundOrder);
  } catch (error) {
    console.error('Error fetching outbound order:', error);
    return NextResponse.json({ error: 'Failed to fetch outbound order' }, { status: 500 });
  }
}

// PATCH /api/outbound/[id] - Update outbound order
export async function PATCH(
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

    // Only admin and super admin can update outbound orders
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = updateOutboundOrderSchema.parse(body);

    // Check if outbound order exists
    const existingOrder = await db.outboundOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Outbound order not found' }, { status: 404 });
    }

    // Prevent modification if already dispatched
    if (existingOrder.status === 'DISPATCHED') {
      return NextResponse.json(
        { error: 'Cannot modify dispatched order' },
        { status: 400 }
      );
    }

    // Update outbound order
    const outboundOrder = await db.outboundOrder.update({
      where: { id },
      data: {
        customerId: validatedData.customerId,
        deliveryAddress: validatedData.deliveryAddress || null,
        status: validatedData.status,
        preparedBy: validatedData.preparedBy || null,
        receivedByCustomer: validatedData.receivedByCustomer || null,
        notes: validatedData.notes || null,
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

    return NextResponse.json(outboundOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating outbound order:', error);
    return NextResponse.json({ error: 'Failed to update outbound order' }, { status: 500 });
  }
}

// DELETE /api/outbound/[id] - Delete outbound order
export async function DELETE(
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

    // Only admin and super admin can delete outbound orders
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if outbound order exists
    const existingOrder = await db.outboundOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Outbound order not found' }, { status: 404 });
    }

    // Prevent deletion if already dispatched
    if (existingOrder.status === 'DISPATCHED') {
      return NextResponse.json(
        { error: 'Cannot delete dispatched order' },
        { status: 400 }
      );
    }

    // Delete outbound order (items will be cascade deleted)
    await db.outboundOrder.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Outbound order deleted successfully' });
  } catch (error) {
    console.error('Error deleting outbound order:', error);
    return NextResponse.json({ error: 'Failed to delete outbound order' }, { status: 500 });
  }
}
