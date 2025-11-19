/**
 * Inbound Order Detail Page
 * Created: November 18, 2025
 * View order details and receive stock
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronLeft, Package, Check, FileText } from 'lucide-react';

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
import { ReceiveOrderDialog } from '@/components/dialogs/receive-order-dialog';

async function getInboundOrder(id: string) {
  return await db.inboundOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
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

async function getLocations() {
  return await db.storageLocation.findMany({
    where: { isActive: true },
    orderBy: { code: 'asc' },
  });
}

export default async function InboundOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const [order, locations] = await Promise.all([
    getInboundOrder(params.id),
    getLocations(),
  ]);

  if (!order) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'outline',
      RECEIVING: 'secondary',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>{status}</Badge>
    );
  };

  const calculateTotals = () => {
    const totalExpected = order.items.reduce(
      (sum, item) => sum + item.expectedQuantity,
      0
    );
    const totalReceived = order.items.reduce(
      (sum, item) => sum + (item.receivedQuantity || 0),
      0
    );
    const totalAmount = order.items.reduce(
      (sum, item) => {
        const price = item.unitPrice || 0;
        const qty = item.receivedQuantity || item.expectedQuantity;
        return sum + (price * qty);
      },
      0
    );

    return { totalExpected, totalReceived, totalAmount };
  };

  const totals = calculateTotals();
  const canReceive = order.status === 'PENDING' || order.status === 'RECEIVING';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inbound">
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
          {canReceive && (
            <ReceiveOrderDialog order={order} locations={locations}>
              <Button>
                <Check className="mr-2 h-4 w-4" />
                Receive Order
              </Button>
            </ReceiveOrderDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">
                {order.supplier.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Code: {order.supplier.code}
              </p>
            </div>
            {order.supplier.contactPerson && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{order.supplier.contactPerson}</p>
              </div>
            )}
            {order.supplier.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.supplier.phone}</p>
              </div>
            )}
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
            {order.expectedDate && (
              <div>
                <p className="text-sm text-muted-foreground">Expected Date</p>
                <p className="font-medium">
                  {format(new Date(order.expectedDate), 'PPP')}
                </p>
              </div>
            )}
            {order.receivedDate && (
              <div>
                <p className="text-sm text-muted-foreground">Received Date</p>
                <p className="font-medium">
                  {format(new Date(order.receivedDate), 'PPP')}
                </p>
              </div>
            )}
            {order.receivedBy && (
              <div>
                <p className="text-sm text-muted-foreground">Received By</p>
                <p className="font-medium">{order.receivedBy}</p>
              </div>
            )}
            {order.driverName && (
              <div>
                <p className="text-sm text-muted-foreground">Driver Name</p>
                <p className="font-medium">{order.driverName}</p>
              </div>
            )}
            {order.plateNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Plate Number</p>
                <p className="font-medium">{order.plateNumber}</p>
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
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {order.status === 'COMPLETED' && (
                  <>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Temp (°C)</TableHead>
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
                    {item.expectedQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.receivedQuantity ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice
                      ? `₱${item.unitPrice.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice
                      ? `₱${(
                          item.unitPrice *
                          (item.receivedQuantity || item.expectedQuantity)
                        ).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`
                      : '-'}
                  </TableCell>
                  {order.status === 'COMPLETED' && (
                    <>
                      <TableCell>{item.batchNumber || '-'}</TableCell>
                      <TableCell>
                        {item.expiryDate
                          ? format(new Date(item.expiryDate), 'PP')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {item.location?.code || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.temperatureOnReceipt ?? '-'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{totals.totalExpected}</TableCell>
                <TableCell className="text-right">
                  {totals.totalReceived > 0 ? totals.totalReceived : '-'}
                </TableCell>
                <TableCell />
                <TableCell className="text-right">
                  {totals.totalAmount > 0
                    ? `₱${totals.totalAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}`
                    : '-'}
                </TableCell>
                {order.status === 'COMPLETED' && (
                  <>
                    <TableCell />
                    <TableCell />
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
