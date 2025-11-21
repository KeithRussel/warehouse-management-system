/**
 * Cancel Inbound Order API
 * POST /api/inbound/[id]/cancel
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can cancel orders
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if order exists
    const order = await db.inboundOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Can only cancel PENDING orders
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.status}. Only PENDING orders can be cancelled.` },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const updatedOrder = await db.inboundOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling inbound order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel inbound order' },
      { status: 500 }
    );
  }
}
