/**
 * Individual Product API Routes
 * Created: November 14, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { productSchema } from '@/lib/validations/product';

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if SKU is being changed and if it conflicts
    if (validatedData.sku !== existingProduct.sku) {
      const skuConflict = await db.product.findUnique({
        where: { sku: validatedData.sku },
      });

      if (skuConflict) {
        return NextResponse.json(
          { error: 'A product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Check if barcode is being changed and if it conflicts
    if (validatedData.barcode && validatedData.barcode !== existingProduct.barcode) {
      const barcodeConflict = await db.product.findUnique({
        where: { barcode: validatedData.barcode },
      });

      if (barcodeConflict) {
        return NextResponse.json(
          { error: 'A product with this barcode already exists' },
          { status: 400 }
        );
      }
    }

    // Update product
    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        barcode: validatedData.barcode || null,
        description: validatedData.description || null,
        category: validatedData.category || null,
        minStockLevel: validatedData.minStockLevel || 0,
        maxStockLevel: validatedData.maxStockLevel || null,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has inventory (prevent deletion if it does)
    const inventoryCount = await db.inventory.count({
      where: { productId: params.id },
    });

    if (inventoryCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing inventory' },
        { status: 400 }
      );
    }

    // Delete product
    await db.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
