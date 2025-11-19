/**
 * Inbound Order Form Component
 * Created: November 18, 2025
 * Multi-item form for creating inbound receiving orders
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInboundOrderSchema, type CreateInboundOrderFormData } from '@/lib/validations/inbound';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Supplier, Product } from '@prisma/client';

interface InboundOrderFormProps {
  suppliers: Supplier[];
  products: Product[];
}

export function InboundOrderForm({ suppliers, products }: InboundOrderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateInboundOrderFormData>({
    resolver: zodResolver(createInboundOrderSchema),
    defaultValues: {
      supplierId: '',
      expectedDate: undefined,
      receivedBy: '',
      driverName: '',
      plateNumber: '',
      notes: '',
      items: [
        {
          productId: '',
          expectedQuantity: 1,
          unitPrice: undefined,
          notes: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (data: CreateInboundOrderFormData) => {
    setIsLoading(true);

    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        receivedBy: data.receivedBy || undefined,
        driverName: data.driverName || undefined,
        plateNumber: data.plateNumber || undefined,
        notes: data.notes || undefined,
        items: data.items.map(item => ({
          ...item,
          notes: item.notes || undefined,
        })),
      };

      const response = await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create inbound order');
      }

      router.push('/inbound');
      router.refresh();
    } catch (error) {
      console.error('Error creating inbound order:', error);
      alert(error instanceof Error ? error.message : 'Failed to create inbound order');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    append({
      productId: '',
      expectedQuantity: 1,
      unitPrice: undefined,
      notes: '',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Order Information Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier */}
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Supplier for this inbound order
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expected Date */}
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Expected delivery date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Received By */}
              <FormField
                control={form.control}
                name="receivedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received By (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="RODZ, ZALDY, JOEY, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Person who will receive the delivery
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Driver Name */}
              <FormField
                control={form.control}
                name="driverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Driver name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Delivery driver name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plate Number */}
              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="CBQ 324, CBS 2556, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Vehicle plate number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or instructions..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Items Section */}
          <div className="space-y-6">
            <div className="border-b pb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                      Item {index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Product */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Expected Quantity */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.expectedQuantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unit Price */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Item Notes */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Notes for this item..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Inbound Order
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inbound')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
