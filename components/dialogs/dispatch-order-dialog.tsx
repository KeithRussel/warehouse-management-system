'use client';

/**
 * Dispatch Order Dialog Component
 * Created: November 18, 2025
 * Handles the dispatch workflow - collects picked quantities, batch, expiry
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  dispatchOrderSchema,
  type DispatchOrderFormData,
} from '@/lib/validations/outbound';

interface Product {
  id: string;
  sku: string;
  name: string;
  inventory: {
    id: string;
    batchNumber: string | null;
    expiryDate: Date | null;
    quantity: number;
  }[];
}

interface OrderItem {
  id: string;
  productId: string;
  requestedQuantity: number;
  pickedQuantity: number | null;
  boxQuantity: number | null;
  weightKilos: number | null;
  batchNumber: string | null;
  expiryDate: Date | null;
  product: Product;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
}

interface DispatchOrderDialogProps {
  order: Order;
  children: React.ReactNode;
}

export function DispatchOrderDialog({ order, children }: DispatchOrderDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DispatchOrderFormData>({
    resolver: zodResolver(dispatchOrderSchema),
    defaultValues: {
      preparedBy: '',
      items: order.items.map((item) => ({
        itemId: item.id,
        pickedQuantity: item.requestedQuantity,
        boxQuantity: item.boxQuantity ?? null,
        weightKilos: item.weightKilos ?? null,
        batchNumber: item.product.inventory[0]?.batchNumber ?? null,
        expiryDate: item.product.inventory[0]?.expiryDate ?? null,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (data: DispatchOrderFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/outbound/${order.id}/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to dispatch order');
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispatch Order {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Enter picked quantities, batch numbers, and expiry dates. This will
            generate a DR number and reduce inventory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="preparedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prepared By *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name (e.g., RODZ, ZALDY, JOEY)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name of the person who prepared this order
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Order Items</h3>
              {fields.map((field, index) => {
                const orderItem = order.items[index];
                const availableBatches = orderItem.product.inventory;

                return (
                  <div
                    key={field.id}
                    className="rounded-lg border p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{orderItem.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {orderItem.product.sku} | Requested:{' '}
                          {orderItem.requestedQuantity}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.pickedQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Picked Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max={orderItem.requestedQuantity}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value, 10))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Max: {orderItem.requestedQuantity}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.boxQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Box Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value, 10)
                                      : null
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.weightKilos`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.batchNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter batch"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            {availableBatches.length > 0 && (
                              <FormDescription>
                                Available: {availableBatches.map(b => b.batchNumber).filter(Boolean).join(', ') || 'No batch numbers'}
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Expiry Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'PP')
                                    ) : (
                                      <span>Pick date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ?? undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Dispatch & Generate DR
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
