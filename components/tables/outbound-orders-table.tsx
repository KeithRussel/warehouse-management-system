'use client';

/**
 * Outbound Orders Table Component
 * Created: November 18, 2025
 * Displays customer orders with Advance Order/DISPATCHED status
 */

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Truck,
  Printer,
  Package,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

interface OutboundOrderItem {
  id: string;
  productId: string;
  requestedQuantity: number;
  pickedQuantity: number | null;
  boxQuantity: number | null;
  weightKilos: number | null;
  unitPrice: number | null;
  totalAmount: number | null;
  product: {
    id: string;
    sku: string;
    name: string;
  };
}

interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
}

interface OutboundOrder {
  id: string;
  orderNumber: string;
  customerId: string | null;
  status: 'PENDING' | 'PICKING' | 'PACKED' | 'DISPATCHED' | 'CANCELLED';
  drNumber: string | null;
  dispatchDate: Date | null;
  deliveryAddress: string | null;
  preparedBy: string | null;
  receivedByCustomer: string | null;
  notes: string | null;
  createdAt: Date;
  customer: Customer | null;
  items: OutboundOrderItem[];
}

interface OutboundOrdersTableProps {
  orders: OutboundOrder[];
  onDelete?: (id: string) => Promise<void>;
  onDispatch?: (id: string) => void;
  userRole: string;
}

export function OutboundOrdersTable({
  orders,
  onDelete,
  onDispatch,
  userRole,
}: OutboundOrdersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'outline',
      PICKING: 'secondary',
      PACKED: 'default',
      DISPATCHED: 'default',
      CANCELLED: 'destructive',
    };

    const labels: Record<string, string> = {
      PENDING: 'Advance Order',
      PICKING: 'Picking',
      PACKED: 'Packed',
      DISPATCHED: 'DISPATCHED',
      CANCELLED: 'Cancelled',
    };

    return (
      <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
    );
  };

  const calculateTotals = (order: OutboundOrder) => {
    const totalItems = order.items.reduce((sum, item) => sum + item.requestedQuantity, 0);
    const totalAmount = order.items.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );
    const totalBoxes = order.items.reduce(
      (sum, item) => sum + (item.boxQuantity || 0),
      0
    );
    const totalWeight = order.items.reduce(
      (sum, item) => sum + (Number(item.weightKilos) || 0),
      0
    );

    return { totalItems, totalAmount, totalBoxes, totalWeight };
  };

  const canDelete = (order: OutboundOrder) => {
    return (
      (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') &&
      order.status !== 'DISPATCHED'
    );
  };

  const canDispatch = (order: OutboundOrder) => {
    return order.status !== 'DISPATCHED' && order.status !== 'CANCELLED';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>DR Number</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Boxes</TableHead>
              <TableHead className="text-right">Weight (kg)</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Dispatch Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No outbound orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const totals = calculateTotals(order);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/outbound/${order.id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {order.customer?.name || 'N/A'}
                        </span>
                        {order.customer?.contactPerson && (
                          <span className="text-xs text-muted-foreground">
                            {order.customer.contactPerson}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.drNumber ? (
                        <span className="font-mono text-sm font-medium">
                          {order.drNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{totals.totalItems}</TableCell>
                    <TableCell className="text-right">
                      {totals.totalBoxes > 0 ? totals.totalBoxes : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {totals.totalWeight > 0
                        ? totals.totalWeight.toFixed(2)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {totals.totalAmount > 0
                        ? `₱${totals.totalAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {order.dispatchDate
                        ? format(new Date(order.dispatchDate), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/outbound/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {order.status !== 'DISPATCHED' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/outbound/${order.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {canDispatch(order) && onDispatch && (
                            <DropdownMenuItem onClick={() => onDispatch(order.id)}>
                              <Truck className="mr-2 h-4 w-4" />
                              Dispatch Order
                            </DropdownMenuItem>
                          )}
                          {order.status === 'DISPATCHED' && (
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print DR
                            </DropdownMenuItem>
                          )}
                          {canDelete(order) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(order.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the outbound
              order and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
