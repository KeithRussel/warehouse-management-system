'use client';

/**
 * Receive Order Dialog Component
 * Created: November 18, 2025
 * Handles receiving stock with batch, expiry, location, and temperature
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Receive order validation schema - matches API expectations
const receiveOrderItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  receivedQuantity: z.number().int().min(0, 'Received quantity cannot be negative'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.date({ required_error: 'Expiry date is required' }),
  temperatureOnReceipt: z.number().optional().nullable(),
  locationId: z.string().min(1, 'Storage location is required'),
  unitPrice: z.number().min(0).optional().nullable(),
});

const receiveOrderSchema = z.object({
  items: z.array(receiveOrderItemSchema).min(1),
});

type ReceiveOrderFormData = z.infer<typeof receiveOrderSchema>;

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface OrderItem {
  id: string;
  productId: string;
  expectedQuantity: number;
  receivedQuantity: number | null;
  product: Product;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
}

interface Location {
  id: string;
  code: string;
  name: string;
}

interface ReceiveOrderDialogProps {
  order: Order;
  locations: Location[];
  children: React.ReactNode;
}

export function ReceiveOrderDialog({ order, locations, children }: ReceiveOrderDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReceiveOrderFormData>({
    resolver: zodResolver(receiveOrderSchema),
    defaultValues: {
      items: order.items.map((item) => ({
        itemId: item.id,
        receivedQuantity: item.expectedQuantity,
        batchNumber: '',
        expiryDate: undefined as any,
        temperatureOnReceipt: null,
        locationId: locations[0]?.id || '',
        unitPrice: null,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (data: ReceiveOrderFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Format data for API - ensure dates are ISO strings and numbers are proper type
      const formattedData = {
        items: data.items.map(item => ({
          ...item,
          expiryDate: item.expiryDate ? item.expiryDate.toISOString() : null,
          temperatureOnReceipt: item.temperatureOnReceipt !== null && item.temperatureOnReceipt !== undefined
            ? Number(item.temperatureOnReceipt)
            : null,
          unitPrice: item.unitPrice !== null && item.unitPrice !== undefined
            ? Number(item.unitPrice)
            : null,
        })),
      };

      console.log('Submitting receive order data:', formattedData);

      const response = await fetch(`/api/inbound/${order.id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      let result;
      try {
        result = await response.json();
        console.log('API response:', result);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server error: Unable to process the response. Check server logs.');
      }

      if (!response.ok) {
        // Show detailed validation errors if available
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((err: any) =>
            `${err.path.join('.')}: ${err.message}`
          ).join(', ');
          throw new Error(`${result.error}: ${errorMessages}`);
        }
        throw new Error(result.error || 'Failed to receive order');
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error receiving order:', err);
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
          <DialogTitle>Receive Order {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Enter received quantities, batch numbers, expiry dates, and storage locations.
            This will add stock to inventory.
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

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Receiving Details</h3>
              {fields.map((field, index) => {
                const orderItem = order.items[index];

                return (
                  <div
                    key={field.id}
                    className="rounded-lg border p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{orderItem.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {orderItem.product.sku} | Expected:{' '}
                          {orderItem.expectedQuantity}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.receivedQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Received Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value, 10))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Expected: {orderItem.expectedQuantity}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.batchNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Number *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., BATCH-2025-001"
                                {...field}
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
                        name={`items.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Expiry Date *</FormLabel>
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

                      <FormField
                        control={form.control}
                        name={`items.${index}.locationId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Storage Location *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.code} - {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.temperatureOnReceipt`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="-18.5"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Temperature on receipt
                            </FormDescription>
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
                Receive & Add to Inventory
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
