/**
 * Sidebar Navigation Component
 * Created: November 14, 2025
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Building2,
  MapPin,
  PackageSearch,
  PackagePlus,
  PackageMinus,
  Thermometer,
  FileText,
  Users,
  UserCircle2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Building2,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: UserCircle2,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Locations',
    href: '/locations',
    icon: MapPin,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: PackageSearch,
  },
  {
    title: 'Inbound',
    href: '/inbound',
    icon: PackagePlus,
  },
  {
    title: 'Outbound',
    href: '/outbound',
    icon: PackageMinus,
  },
  {
    title: 'Temperature',
    href: '/temperature',
    icon: Thermometer,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['SUPER_ADMIN'],
  },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole || '');
  });

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col border-r bg-gray-50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
              WMS
            </div>
            <span className="text-lg font-semibold">Cold Storage</span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold mx-auto">
            W
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
