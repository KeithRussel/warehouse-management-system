/**
 * Storage Location API Routes by ID
 * Created: November 18, 2025
 * Handles GET, PATCH, and DELETE operations for individual storage locations
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { locationSchema } from '@/lib/validations/location';
import { z } from 'zod';

// GET /api/locations/[id] - Get single storage location
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const location = await db.storageLocation.findUnique({
      where: { id: params.id },
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}

// PATCH /api/locations/[id] - Update storage location
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can update locations
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = locationSchema.parse(body);

    // Check if location exists
    const existingLocation = await db.storageLocation.findUnique({
      where: { id: params.id },
    });

    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if code is being changed and if it conflicts with another location
    if (validatedData.code !== existingLocation.code) {
      const codeConflict = await db.storageLocation.findUnique({
        where: { code: validatedData.code },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: 'Location code already exists' },
          { status: 400 }
        );
      }
    }

    // Update location
    const location = await db.storageLocation.update({
      where: { id: params.id },
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

    return NextResponse.json(location);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating location:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

// DELETE /api/locations/[id] - Delete storage location
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and super admin can delete locations
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if location exists
    const existingLocation = await db.storageLocation.findUnique({
      where: { id: params.id },
      include: {
        inventory: true,
      },
    });

    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if location has inventory
    if (existingLocation.inventory.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete location with existing inventory' },
        { status: 400 }
      );
    }

    // Delete location
    await db.storageLocation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
