/**
 * Suppliers API Routes
 * Created: November 18, 2025
 * Handles GET (list) and POST (create) operations
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { supplierSchema } from '@/lib/validations/supplier';
import { z } from 'zod';

// GET /api/suppliers - List all suppliers
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const suppliers = await db.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can create suppliers
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = supplierSchema.parse(body);

    // Check if supplier code already exists
    const existingSupplier = await db.supplier.findUnique({
      where: { code: validatedData.code },
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier code already exists' },
        { status: 400 }
      );
    }

    // Create supplier
    const supplier = await db.supplier.create({
      data: {
        code: validatedData.code,
        name: validatedData.name,
        contactName: validatedData.contactName || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
