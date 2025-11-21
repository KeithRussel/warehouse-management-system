/**
 * Outbound Order Detail Page
 * Created: November 18, 2025
 * View order details and dispatch workflow
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronLeft, Package, Truck, XCircle } from 'lucide-react';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DispatchOrderDialog } from '@/components/dialogs/dispatch-order-dialog';
import { PrintDRButton } from '@/components/buttons/print-dr-button';
import { AmendDispatchDialog } from '@/components/dialogs/amend-dispatch-dialog';
import { CancelOrderDialog } from '@/components/dialogs/cancel-order-dialog';

async function getOutboundOrder(id: string) {
  return await db.outboundOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              weightPerUnit: true,
              unitsPerBox: true,
              inventory: {
                where: {
                  quantity: { gt: 0 },
                },
                orderBy: {
                  expiryDate: 'asc',
                },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

// Serialize order for dispatch dialog (includes product metadata for validation)
function serializeOrderForDispatch(order: NonNullable<Awaited<ReturnType<typeof getOutboundOrder>>>) {
  return {
    ...order,
    items: order.items.map(item => ({
      ...item,
      weightKilos: item.weightKilos ? Number(item.weightKilos) : null,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
      totalAmount: item.totalAmount ? Number(item.totalAmount) : null,
      product: {
        ...item.product,
        weightPerUnit: item.product.weightPerUnit ? Number(item.product.weightPerUnit) : null,
      },
    })),
  };
}

// Serialize order for client components (convert Decimal to number)
function serializeOrderForPrint(order: NonNullable<Awaited<ReturnType<typeof getOutboundOrder>>>) {
  return {
    ...order,
    customer: order.customer!,
    items: order.items.map(item => ({
      ...item,
      weightKilos: Number(item.weightKilos),
      unitPrice: Number(item.unitPrice),
      totalAmount: Number(item.totalAmount),
      product: {
        sku: item.product.sku,
        name: item.product.name,
      },
    })),
  };
}

export default async function OutboundOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params;

  const order = await getOutboundOrder(id);

  if (!order) {
    notFound();
  }

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

  const calculateTotals = () => {
    const totalRequested = order.items.reduce(
      (sum, item) => sum + item.requestedQuantity,
      0
    );
    const totalPicked = order.items.reduce(
      (sum, item) => sum + (item.pickedQuantity || 0),
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
    const totalAmount = order.items.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );

    return { totalRequested, totalPicked, totalBoxes, totalWeight, totalAmount };
  };

  const totals = calculateTotals();
  const canDispatch =
    order.status !== 'DISPATCHED' &&
    order.status !== 'CANCELLED' &&
    (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN');
  const canCancel =
    order.status === 'PENDING' &&
    (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/outbound">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {order.orderNumber}
              </h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-muted-foreground">
              Created {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {canCancel && (
            <CancelOrderDialog
              orderId={order.id}
              orderNumber={order.orderNumber}
              orderType="outbound"
            >
              <Button variant="outline">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </CancelOrderDialog>
          )}
          {canDispatch && (
            <DispatchOrderDialog order={serializeOrderForDispatch(order)}>
              <Button>
                <Truck className="mr-2 h-4 w-4" />
                Dispatch Order
              </Button>
            </DispatchOrderDialog>
          )}
          {order.status === 'DISPATCHED' && (
            <>
              <AmendDispatchDialog order={serializeOrderForPrint(order)} />
              <PrintDRButton order={serializeOrderForPrint(order)} variant="outline" />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">
                {order.customer?.name || 'N/A'}
              </p>
              {order.customer?.code && (
                <p className="text-sm text-muted-foreground">
                  Code: {order.customer.code}
                </p>
              )}
            </div>
            {order.customer?.contactPerson && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{order.customer.contactPerson}</p>
              </div>
            )}
            {order.customer?.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Delivery Address</p>
              <p className="font-medium">
                {order.deliveryAddress || order.customer?.address || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
            {order.drNumber && (
              <div>
                <p className="text-sm text-muted-foreground">DR Number</p>
                <p className="font-mono font-medium">{order.drNumber}</p>
              </div>
            )}
            {order.dispatchDate && (
              <div>
                <p className="text-sm text-muted-foreground">Dispatch Date</p>
                <p className="font-medium">
                  {format(new Date(order.dispatchDate), 'PPP')}
                </p>
              </div>
            )}
            {order.preparedBy && (
              <div>
                <p className="text-sm text-muted-foreground">Prepared By</p>
                <p className="font-medium">{order.preparedBy}</p>
              </div>
            )}
            {order.receivedByCustomer && (
              <div>
                <p className="text-sm text-muted-foreground">Received By</p>
                <p className="font-medium">{order.receivedByCustomer}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">{order.createdBy?.name || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.items.length} item(s) in this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Requested</TableHead>
                <TableHead className="text-right">Picked</TableHead>
                <TableHead className="text-right">Boxes</TableHead>
                <TableHead className="text-right">Weight (kg)</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {order.status === 'DISPATCHED' && (
                  <>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.product.sku}
                  </TableCell>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-right">
                    {item.requestedQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.pickedQuantity ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.boxQuantity ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.weightKilos
                      ? Number(item.weightKilos).toFixed(2)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice
                      ? `₱${Number(item.unitPrice).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.totalAmount
                      ? `₱${Number(item.totalAmount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`
                      : '-'}
                  </TableCell>
                  {order.status === 'DISPATCHED' && (
                    <>
                      <TableCell>{item.batchNumber || '-'}</TableCell>
                      <TableCell>
                        {item.expiryDate
                          ? format(new Date(item.expiryDate), 'PP')
                          : '-'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{totals.totalRequested}</TableCell>
                <TableCell className="text-right">
                  {totals.totalPicked > 0 ? totals.totalPicked : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {totals.totalBoxes > 0 ? totals.totalBoxes : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {totals.totalWeight > 0 ? totals.totalWeight.toFixed(2) : '-'}
                </TableCell>
                <TableCell />
                <TableCell className="text-right">
                  {totals.totalAmount > 0
                    ? `₱${totals.totalAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}`
                    : '-'}
                </TableCell>
                {order.status === 'DISPATCHED' && (
                  <>
                    <TableCell />
                    <TableCell />
                  </>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
