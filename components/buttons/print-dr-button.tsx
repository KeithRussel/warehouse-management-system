'use client';

/**
 * Print Delivery Receipt Button
 * Created: November 18, 2025
 * Button component that triggers DR printing
 */

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryReceipt } from '@/components/print/delivery-receipt';

interface Product {
  sku: string;
  name: string;
}

interface OrderItem {
  id: string;
  productId: string;
  requestedQuantity: number;
  pickedQuantity: number | null;
  boxQuantity: number | null;
  weightKilos: number;
  unitPrice: number;
  totalAmount: number;
  batchNumber: string | null;
  expiryDate: Date | null;
  product: Product;
}

interface Customer {
  name: string;
  code: string;
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
}

interface OutboundOrder {
  id: string;
  orderNumber: string;
  drNumber: string | null;
  status: string;
  deliveryAddress: string | null;
  preparedBy: string | null;
  receivedByCustomer: string | null;
  dispatchDate: Date | null;
  createdAt: Date;
  customer: Customer;
  items: OrderItem[];
}

interface PrintDRButtonProps {
  order: OutboundOrder;
  variant?: 'default' | 'outline' | 'ghost';
}

export function PrintDRButton({ order, variant = 'outline' }: PrintDRButtonProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `DR-${order.drNumber || order.orderNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  return (
    <>
      <Button variant={variant} onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print DR
      </Button>

      {/* Hidden component for printing */}
      <div style={{ display: 'none' }}>
        <DeliveryReceipt ref={componentRef} order={order} />
      </div>
    </>
  );
}
