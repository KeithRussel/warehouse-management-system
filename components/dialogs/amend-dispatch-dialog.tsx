'use client';

/**
 * Amend Dispatch Dialog
 * Created: November 18, 2025
 * Allows amending dispatched orders for returns or corrections
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Validation schema for amendment
const amendmentSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string(),
      newPickedQuantity: z.coerce.number().min(0),
      newBoxQuantity: z.coerce.number().min(0).nullable(),
      newWeightKilos: z.coerce.number().min(0).nullable(),
      reason: z.string().optional(),
    })
  ),
  amendmentNotes: z.string().min(1, 'Amendment notes are required'),
});

type AmendmentFormData = z.infer<typeof amendmentSchema>;

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
  batchNumber: string | null;
  product: Product;
}

interface OutboundOrder {
  id: string;
  orderNumber: string;
  drNumber: string | null;
  status: string;
  items: OrderItem[];
}

interface AmendDispatchDialogProps {
  order: OutboundOrder;
  children?: React.ReactNode;
}

export function AmendDispatchDialog({ order, children }: AmendDispatchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AmendmentFormData>({
    resolver: zodResolver(amendmentSchema),
    defaultValues: {
      items: order.items.map((item) => ({
        itemId: item.id,
        newPickedQuantity: item.pickedQuantity || 0,
        newBoxQuantity: item.boxQuantity || 0,
        newWeightKilos: item.weightKilos || 0,
        reason: '',
      })),
      amendmentNotes: '',
    },
  });

  const onSubmit = async (data: AmendmentFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/outbound/${order.id}/amend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to amend dispatch');
      }

      toast.success('Dispatch amended successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Amend Dispatch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Amend Dispatched Order</DialogTitle>
          <DialogDescription>
            Update picked quantities for returns or corrections. Changes will adjust inventory
            accordingly.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Order Info */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Order Number:</span> {order.orderNumber}
                </div>
                <div>
                  <span className="font-semibold">DR Number:</span> {order.drNumber}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h4 className="font-semibold">Items</h4>
              {order.items.map((item, index) => (
                <div key={item.id} className="rounded-lg border p-4 space-y-4">
                  <div className="font-medium">
                    {item.product.sku} - {item.product.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Batch: {item.batchNumber || 'N/A'} | Originally Picked:{' '}
                    {item.pickedQuantity || 0} boxes
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.newPickedQuantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Picked Qty (boxes)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.newBoxQuantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Box Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.newWeightKilos`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.reason`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Change (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Customer returned 2 boxes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Amendment Notes */}
            <FormField
              control={form.control}
              name="amendmentNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amendment Notes *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the reason for this amendment..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Amendment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
