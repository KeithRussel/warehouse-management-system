/**
 * Supplier API Routes by ID
 * Created: November 18, 2025
 * Handles GET, PATCH, and DELETE operations for individual suppliers
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { supplierSchema } from '@/lib/validations/supplier';
import { z } from 'zod';

// GET /api/suppliers/[id] - Get single supplier
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

    const supplier = await db.supplier.findUnique({
      where: { id },
      include: {
        inboundOrders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
}

// PATCH /api/suppliers/[id] - Update supplier
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can update suppliers
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();

    // Validate request body
    const validatedData = supplierSchema.parse(body);

    // Check if supplier exists
    const existingSupplier = await db.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Check if code is being changed and if it conflicts with another supplier
    if (validatedData.code !== existingSupplier.code) {
      const codeConflict = await db.supplier.findUnique({
        where: { code: validatedData.code },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: 'Supplier code already exists' },
          { status: 400 }
        );
      }
    }

    // Update supplier
    const supplier = await db.supplier.update({
      where: { id },
      data: {
        code: validatedData.code,
        name: validatedData.name,
        contactName: validatedData.contactName || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can delete suppliers
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if supplier exists
    const existingSupplier = await db.supplier.findUnique({
      where: { id },
      include: {
        inboundOrders: true,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Check if supplier has associated inbound orders
    if (existingSupplier.inboundOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with existing inbound orders' },
        { status: 400 }
      );
    }

    // Delete supplier
    await db.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}
