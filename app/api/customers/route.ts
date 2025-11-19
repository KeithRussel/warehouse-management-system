/**
 * Customers API Routes
 * Created: November 18, 2025
 * Handles GET (list) and POST (create) operations
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customerSchema } from '@/lib/validations/customer';
import { z } from 'zod';

// GET /api/customers - List all customers
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await db.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST /api/customers - Create new customer
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can create customers
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = customerSchema.parse(body);

    // Check if customer code already exists
    const existingCustomer = await db.customer.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer code already exists' },
        { status: 400 }
      );
    }

    // Create customer
    const customer = await db.customer.create({
      data: {
        code: validatedData.code,
        name: validatedData.name,
        contactPerson: validatedData.contactPerson || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
