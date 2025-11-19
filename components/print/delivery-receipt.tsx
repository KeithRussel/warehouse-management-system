'use client';

/**
 * Delivery Receipt Print Component
 * Created: November 18, 2025
 * Printable delivery receipt for dispatched outbound orders
 */

import React from 'react';
import { format } from 'date-fns';

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

interface DeliveryReceiptProps {
  order: OutboundOrder;
}

export const DeliveryReceipt = React.forwardRef<HTMLDivElement, DeliveryReceiptProps>(
  ({ order }, ref) => {
    const calculateTotals = () => {
      const totalBoxes = order.items.reduce(
        (sum, item) => sum + (item.boxQuantity || 0),
        0
      );
      const totalWeight = order.items.reduce(
        (sum, item) => sum + (item.weightKilos || 0),
        0
      );
      const totalAmount = order.items.reduce(
        (sum, item) => sum + (item.totalAmount || 0),
        0
      );

      return { totalBoxes, totalWeight, totalAmount };
    };

    const totals = calculateTotals();

    return (
      <div ref={ref} className="p-8 bg-white text-black" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* Header */}
        <div className="mb-6 border-b-2 border-black pb-4">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">DELIVERY RECEIPT</h1>
            <p className="text-lg font-semibold">DR No: {order.drNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm">
              <span className="font-semibold">Order Number:</span> {order.orderNumber}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Customer:</span> {order.customer.name}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Customer Address:</span> {order.customer.address || 'N/A'}
            </p>
            {order.customer.contactPerson && (
              <p className="text-sm">
                <span className="font-semibold">Contact Person:</span> {order.customer.contactPerson}
              </p>
            )}
            {order.customer.phone && (
              <p className="text-sm">
                <span className="font-semibold">Phone:</span> {order.customer.phone}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm">
              <span className="font-semibold">Dispatch Date:</span>{' '}
              {order.dispatchDate ? format(new Date(order.dispatchDate), 'PPP') : 'N/A'}
            </p>
            {order.deliveryAddress && (
              <p className="text-sm">
                <span className="font-semibold">Delivery Address:</span>
                <br />
                <span className="text-xs">{order.deliveryAddress}</span>
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-xs">SKU</th>
              <th className="border border-black p-2 text-left text-xs">Product Name</th>
              <th className="border border-black p-2 text-center text-xs">Boxes</th>
              <th className="border border-black p-2 text-center text-xs">Weight (kg)</th>
              <th className="border border-black p-2 text-center text-xs">Unit Price</th>
              <th className="border border-black p-2 text-center text-xs">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="border border-black p-2 text-xs">{item.product.sku}</td>
                <td className="border border-black p-2 text-xs">{item.product.name}</td>
                <td className="border border-black p-2 text-center text-xs">
                  {item.boxQuantity || 0}
                </td>
                <td className="border border-black p-2 text-center text-xs">
                  {item.weightKilos.toFixed(2)}
                </td>
                <td className="border border-black p-2 text-center text-xs">
                  ₱{item.unitPrice.toFixed(2)}
                </td>
                <td className="border border-black p-2 text-center text-xs">
                  ₱{item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="font-bold bg-gray-50">
              <td colSpan={2} className="border border-black p-2 text-right text-xs">
                TOTAL:
              </td>
              <td className="border border-black p-2 text-center text-xs">
                {totals.totalBoxes}
              </td>
              <td className="border border-black p-2 text-center text-xs">
                {totals.totalWeight.toFixed(2)}
              </td>
              <td className="border border-black p-2 text-center text-xs">
                -
              </td>
              <td className="border border-black p-2 text-center text-xs">
                ₱{totals.totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t-2 border-black pt-2 mt-16">
              <p className="text-sm font-semibold">Prepared By</p>
              <p className="text-xs">{order.preparedBy || '_____________'}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-black pt-2 mt-16">
              <p className="text-sm font-semibold">Received By</p>
              <p className="text-xs">{order.receivedByCustomer || '_____________'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs font-semibold">
          <p>NOTE: THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES</p>
        </div>
      </div>
    );
  }
);

DeliveryReceipt.displayName = 'DeliveryReceipt';
