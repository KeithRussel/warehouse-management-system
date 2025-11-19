/**
 * Products Table Component
 * Created: November 14, 2025
 * Updated with inventory tracking and expiry status
 */

'use client';

import { Product, Inventory, StorageLocation } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { daysUntilExpiry, isExpired } from '@/lib/utils';

type ProductWithInventory = Product & {
  inventory: (Inventory & {
    location: StorageLocation;
  })[];
  outboundOrderItems?: {
    requestedQuantity: number;
  }[];
};

interface ProductsTableProps {
  data: ProductWithInventory[];
}

export function ProductsTable({ data }: ProductsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      alert('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate inventory totals for each product
  const getProductStats = (product: ProductWithInventory) => {
    const totalQty = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);

    // Calculate reserved quantity from pending/picking/packed outbound orders
    const advanceOrderQty = product.outboundOrderItems?.reduce(
      (sum, item) => sum + item.requestedQuantity,
      0
    ) || 0;
    const availableQty = totalQty - advanceOrderQty;

    // Check expiry status
    let expiryStatus = 'Good';
    let expiryDays = Infinity;

    product.inventory.forEach(inv => {
      const days = daysUntilExpiry(inv.expiryDate);
      if (days < expiryDays) {
        expiryDays = days;
      }
    });

    if (expiryDays < 0) {
      expiryStatus = 'Expired';
    } else if (expiryDays <= 7) {
      expiryStatus = 'Near Expire';
    }

    // Determine status based on stock levels
    let status = 'In Stock';
    if (totalQty === 0) {
      status = 'Out of Stock';
    } else if (product.minStockLevel && totalQty <= product.minStockLevel) {
      status = 'Low Stock';
    }

    return {
      onHandQty: totalQty,
      advanceOrderQty,
      availableQty,
      status,
      shelfLife: `${product.shelfLifeDays} days`,
      remarks: expiryStatus,
      expiryDays,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRemarksColor = (remarks: string) => {
    switch (remarks) {
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Near Expire':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Good':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No products found. Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Item Code</TableHead>
              <TableHead className="font-semibold">Item Description</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold text-right">On-Hand</TableHead>
              <TableHead className="font-semibold text-right">Reserved</TableHead>
              <TableHead className="font-semibold text-right">Available</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Shelf Life</TableHead>
              <TableHead className="font-semibold">Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => {
              const stats = getProductStats(product);
              return (
                <TableRow key={product.id}>
                  {/* Item Code */}
                  <TableCell className="font-medium">
                    {product.sku}
                  </TableCell>

                  {/* Item Description */}
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>{product.category || '-'}</TableCell>

                  {/* On-Hand Qty */}
                  <TableCell className="text-right font-medium">
                    {stats.onHandQty} {product.unit}
                  </TableCell>

                  {/* Reserved Qty */}
                  <TableCell className="text-right text-orange-600">
                    {stats.advanceOrderQty > 0 ? `${stats.advanceOrderQty} ${product.unit}` : '-'}
                  </TableCell>

                  {/* Available Qty */}
                  <TableCell className="text-right font-semibold">
                    <span className={
                      stats.availableQty <= 0
                        ? 'text-red-600'
                        : stats.availableQty <= (product.minStockLevel || 0)
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }>
                      {stats.availableQty} {product.unit}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge className={getStatusColor(stats.status)} variant="secondary">
                      {stats.status}
                    </Badge>
                  </TableCell>

                  {/* Shelf Life */}
                  <TableCell className="text-gray-700">
                    {stats.shelfLife}
                  </TableCell>

                  {/* Remarks */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {stats.remarks !== 'Good' && (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                      <Badge
                        className={getRemarksColor(stats.remarks)}
                        variant="outline"
                      >
                        {stats.remarks}
                      </Badge>
                      {stats.remarks === 'Near Expire' && stats.expiryDays > 0 && (
                        <span className="text-xs text-gray-500">
                          ({stats.expiryDays}d left)
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
