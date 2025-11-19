/**
 * Storage Locations Table Component
 * Created: November 18, 2025
 */

'use client';

import { StorageLocation } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2, Thermometer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { getTemperatureZoneColor } from '@/lib/utils';

type LocationWithStats = StorageLocation & {
  currentStock: number;
  utilization: number;
};

interface LocationsTableProps {
  data: LocationWithStats[];
}

export function LocationsTable({ data }: LocationsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete location');
      }
    } catch (error) {
      alert('Failed to delete location');
    } finally {
      setIsDeleting(false);
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-100 text-red-800';
    if (utilization >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatLocation = (location: LocationWithStats) => {
    const parts = [location.zone];
    if (location.section) parts.push(location.section);
    if (location.rack) parts.push(location.rack);
    if (location.shelf) parts.push(location.shelf);
    return parts.join(' > ');
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No storage locations found. Add your first location to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Location Code</TableHead>
              <TableHead className="font-semibold">Location Path</TableHead>
              <TableHead className="font-semibold">Temperature Zone</TableHead>
              <TableHead className="font-semibold text-right">Capacity</TableHead>
              <TableHead className="font-semibold text-right">Current Stock</TableHead>
              <TableHead className="font-semibold">Utilization</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((location) => (
              <TableRow key={location.id}>
                {/* Location Code */}
                <TableCell className="font-medium">
                  <Badge variant="outline" className="font-mono">
                    {location.code}
                  </Badge>
                </TableCell>

                {/* Location Path */}
                <TableCell>
                  <div className="text-sm text-gray-700">
                    {formatLocation(location)}
                  </div>
                </TableCell>

                {/* Temperature Zone */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-gray-400" />
                    <Badge
                      className={getTemperatureZoneColor(location.temperatureZone)}
                      variant="secondary"
                    >
                      {location.temperatureZone === 'FROZEN' && '❄️ '}
                      {location.temperatureZone === 'CHILLED' && '🧊 '}
                      {location.temperatureZone === 'AMBIENT' && '🌡️ '}
                      {location.temperatureZone}
                    </Badge>
                  </div>
                </TableCell>

                {/* Capacity */}
                <TableCell className="text-right">
                  {location.capacity ? (
                    <span className="font-medium">{location.capacity.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>

                {/* Current Stock */}
                <TableCell className="text-right">
                  <span className="font-medium text-blue-600">
                    {location.currentStock.toLocaleString()}
                  </span>
                </TableCell>

                {/* Utilization */}
                <TableCell>
                  {location.capacity ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getUtilizationColor(location.utilization)}
                        variant="secondary"
                      >
                        {location.utilization}%
                      </Badge>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            location.utilization >= 90
                              ? 'bg-red-500'
                              : location.utilization >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(location.utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => router.push(`/locations/${location.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(location.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              storage location. Note: Locations with existing inventory cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
