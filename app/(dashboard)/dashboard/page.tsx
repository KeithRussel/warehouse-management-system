/**
 * Dashboard Page
 * Created: November 14, 2025
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Building2, MapPin, Thermometer, TrendingUp, AlertTriangle } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Mock statistics - will be replaced with real data later
  const stats = [
    {
      title: 'Total Products',
      value: '5',
      description: 'Active products in catalog',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Suppliers',
      value: '2',
      description: 'Active suppliers',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Storage Locations',
      value: '5',
      description: 'Available locations',
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Temperature Zones',
      value: '3',
      description: 'Frozen, Chilled, Ambient',
      icon: Thermometer,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  const quickActions = [
    { title: 'Receive Goods', href: '/inbound/new', color: 'bg-green-600 hover:bg-green-700' },
    { title: 'Pick Order', href: '/outbound/new', color: 'bg-blue-600 hover:bg-blue-700' },
    { title: 'Add Product', href: '/products/new', color: 'bg-purple-600 hover:bg-purple-700' },
    { title: 'Log Temperature', href: '/temperature', color: 'bg-cyan-600 hover:bg-cyan-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening in your warehouse today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className={`${action.color} text-white px-4 py-3 rounded-lg text-center font-medium transition-colors`}
              >
                {action.title}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-600">System initialized successfully</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-gray-600">Database seeded with sample data</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-gray-600">5 products added to catalog</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className="text-gray-600">5 storage locations configured</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-sm font-medium text-yellow-900">
                  System Ready
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Start adding inventory and processing orders
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm font-medium text-blue-900">
                  No expiring items
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  All inventory is within safe expiry range
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Version</p>
              <p className="text-lg font-semibold">0.3.0 (Dashboard Complete)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-lg font-semibold">50% Complete</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className="text-lg font-semibold">PostgreSQL (Connected)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
