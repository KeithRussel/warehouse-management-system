/**
 * Storage Locations API Routes
 * Created: November 18, 2025
 * Handles GET (list) and POST (create) operations
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { locationSchema } from '@/lib/validations/location';
import { z } from 'zod';

// GET /api/locations - List all storage locations
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const locations = await db.storageLocation.findMany({
      include: {
        inventory: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate utilization for each location
    const locationsWithStats = locations.map((location) => {
      const currentStock = location.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      const utilization = location.capacity ? Math.round((currentStock / location.capacity) * 100) : 0;

      return {
        ...location,
        currentStock,
        utilization,
      };
    });

    return NextResponse.json(locationsWithStats);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

// POST /api/locations - Create new storage location
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can create locations
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = locationSchema.parse(body);

    // Check if location code already exists
    const existingLocation = await db.storageLocation.findUnique({
      where: { code: validatedData.code },
    });

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location code already exists' },
        { status: 400 }
      );
    }

    // Create location
    const location = await db.storageLocation.create({
      data: {
        code: validatedData.code,
        zone: validatedData.zone,
        section: validatedData.section || null,
        rack: validatedData.rack || null,
        shelf: validatedData.shelf || null,
        temperatureZone: validatedData.temperatureZone,
        capacity: validatedData.capacity || null,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating location:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
