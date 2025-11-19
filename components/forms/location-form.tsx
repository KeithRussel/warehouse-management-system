/**
 * Storage Location Form Component
 * Created: November 18, 2025
 * Handles both create and edit modes for storage locations
 */

'use client';

import { StorageLocation } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, type LocationFormData } from '@/lib/validations/location';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LocationFormProps {
  initialData?: StorageLocation;
}

export function LocationForm({ initialData }: LocationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: LocationFormData = initialData
    ? {
        code: initialData.code,
        zone: initialData.zone,
        section: initialData.section || '',
        rack: initialData.rack || '',
        shelf: initialData.shelf || '',
        temperatureZone: initialData.temperatureZone,
        capacity: initialData.capacity || undefined,
      }
    : {
        code: '',
        zone: '',
        section: '',
        rack: '',
        shelf: '',
        temperatureZone: 'AMBIENT',
        capacity: undefined,
      };

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues,
  });

  const onSubmit = async (data: LocationFormData) => {
    setIsLoading(true);

    try {
      const url = initialData ? `/api/locations/${initialData.id}` : '/api/locations';
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save location');
      }

      router.push('/locations');
      router.refresh();
    } catch (error) {
      console.error('Error saving location:', error);
      alert(error instanceof Error ? error.message : 'Failed to save location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="LOC-A1-R1-S1"
                      {...field}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Unique location identifier (uppercase letters, numbers, hyphens, underscores)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zone */}
            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Zone A, Warehouse 1, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Primary storage zone or area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section */}
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Section 1, Aisle A, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Section within the zone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rack */}
            <FormField
              control={form.control}
              name="rack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rack (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rack 1, R01, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Rack number or identifier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shelf */}
            <FormField
              control={form.control}
              name="shelf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shelf (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Shelf 1, S01, Level 3, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Shelf or level within the rack
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Temperature Zone */}
            <FormField
              control={form.control}
              name="temperatureZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature Zone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select temperature zone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FROZEN">❄️ Frozen (-18°C or below)</SelectItem>
                      <SelectItem value="CHILLED">🧊 Chilled (0-5°C)</SelectItem>
                      <SelectItem value="AMBIENT">🌡️ Ambient (Room Temperature)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Temperature control requirement for this location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum storage capacity (in units)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update Location' : 'Create Location'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/locations')}
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
