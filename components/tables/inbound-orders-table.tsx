/**
 * Inbound Orders Table Component
 * Created: November 18, 2025
 * Displays all inbound orders with supplier and status information
 */

'use client';

import { InboundOrder, Supplier, User, InboundOrderItem, Product } from '@prisma/client';
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
import { Edit, MoreHorizontal, Trash2, Package, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
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
import { format } from 'date-fns';

type InboundOrderWithDetails = InboundOrder & {
  supplier: Supplier;
  items: (InboundOrderItem & {
    product: Product;
  })[];
  createdBy: {
    name: string;
    email: string;
  };
};

interface InboundOrdersTableProps {
  data: InboundOrderWithDetails[];
}

export function InboundOrdersTable({ data }: InboundOrdersTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/inbound/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete inbound order');
      }
    } catch (error) {
      alert('Failed to delete inbound order');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'RECEIVING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalQuantity = (items: InboundOrderItem[]) => {
    return items.reduce((sum, item) => sum + item.expectedQuantity, 0);
  };

  const getReceivedQuantity = (items: InboundOrderItem[]) => {
    return items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No inbound orders found. Create your first receiving order to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Inbound ID</TableHead>
              <TableHead className="font-semibold">Supplier</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold text-right">Quantity</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Received By</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => {
              const totalQty = getTotalQuantity(order.items);
              const receivedQty = getReceivedQuantity(order.items);

              return (
                <TableRow key={order.id}>
                  {/* Inbound ID */}
                  <TableCell className="font-medium">
                    <Link href={`/inbound/${order.id}`} className="hover:underline">
                      <Badge variant="outline" className="font-mono">
                        {order.orderNumber}
                      </Badge>
                    </Link>
                  </TableCell>

                  {/* Supplier */}
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.supplier.name}</div>
                      <div className="text-xs text-gray-500">{order.supplier.code}</div>
                    </div>
                  </TableCell>

                  {/* Items */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Package className="h-3.5 w-3.5" />
                      <span>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">
                        {receivedQty} / {totalQty}
                      </div>
                      {order.status !== 'PENDING' && (
                        <div className="text-xs text-gray-500">
                          {Math.round((receivedQty / totalQty) * 100)}% received
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge className={getStatusColor(order.status)} variant="secondary">
                      {order.status}
                    </Badge>
                  </TableCell>

                  {/* Received By */}
                  <TableCell>
                    {order.receivedBy ? (
                      <div className="text-sm">
                        <div>{order.receivedBy}</div>
                        {order.driverName && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Truck className="h-3 w-3" />
                            <span>{order.driverName}</span>
                            {order.plateNumber && <span>({order.plateNumber})</span>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className="text-sm">
                      {order.receivedDate ? (
                        <>
                          <div className="font-medium">
                            {format(new Date(order.receivedDate), 'MM/dd/yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(order.receivedDate), 'HH:mm')}
                          </div>
                        </>
                      ) : order.expectedDate ? (
                        <>
                          <div className="text-gray-600">
                            Expected: {format(new Date(order.expectedDate), 'MM/dd/yyyy')}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
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
                          onClick={() => router.push(`/inbound/${order.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          View/Edit
                        </DropdownMenuItem>
                        {order.status !== 'COMPLETED' && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(order.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
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
              inbound order. Note: Completed orders cannot be deleted.
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
