/**
 * Suppliers Table Component
 * Created: November 18, 2025
 */

'use client';

import { Supplier } from '@prisma/client';
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
import { Edit, MoreHorizontal, Trash2, Mail, Phone, MapPin } from 'lucide-react';
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

interface SuppliersTableProps {
  data: Supplier[];
}

export function SuppliersTable({ data }: SuppliersTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete supplier');
      }
    } catch (error) {
      alert('Failed to delete supplier');
    } finally {
      setIsDeleting(false);
    }
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No suppliers found. Add your first supplier to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Supplier Code</TableHead>
              <TableHead className="font-semibold">Supplier Name</TableHead>
              <TableHead className="font-semibold">Contact Person</TableHead>
              <TableHead className="font-semibold">Contact Information</TableHead>
              <TableHead className="font-semibold">Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((supplier) => (
              <TableRow key={supplier.id}>
                {/* Supplier Code */}
                <TableCell className="font-medium">
                  <Badge variant="outline" className="font-mono">
                    {supplier.code}
                  </Badge>
                </TableCell>

                {/* Supplier Name */}
                <TableCell>
                  <div className="font-medium">{supplier.name}</div>
                </TableCell>

                {/* Contact Person */}
                <TableCell>
                  {supplier.contactName ? (
                    <span className="text-gray-700">{supplier.contactName}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>

                {/* Contact Information */}
                <TableCell>
                  <div className="space-y-1">
                    {supplier.email && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5" />
                        <a
                          href={`mailto:${supplier.email}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {supplier.email}
                        </a>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" />
                        <a
                          href={`tel:${supplier.phone}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {supplier.phone}
                        </a>
                      </div>
                    )}
                    {!supplier.email && !supplier.phone && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </TableCell>

                {/* Address */}
                <TableCell>
                  {supplier.address ? (
                    <div className="flex items-start gap-1.5 text-sm text-gray-600 max-w-xs">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{supplier.address}</span>
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
                        onClick={() => router.push(`/suppliers/${supplier.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(supplier.id)}
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
              supplier. Note: Suppliers with existing inbound orders cannot be deleted.
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
