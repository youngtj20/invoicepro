'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Receipt,
  Settings,
  X,
  Percent,
  Shield,
  CreditCard,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import LogoutButton from './LogoutButton';
import { Tenant } from '@prisma/client';
import { useState } from 'react';

interface DashboardSidebarProps {
  tenant: Tenant;
  userRole?: string;
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Items', href: '/dashboard/items', icon: Package },
  { name: 'Taxes', href: '/dashboard/taxes', icon: Percent },
  { name: 'Receipts', href: '/dashboard/receipts', icon: Receipt },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar({ tenant, userRole, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === 'SUPER_ADMIN';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out flex flex-col h-screen md:h-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center h-16 px-4 bg-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">InvoicePro</span>
          </Link>
        </div>

        {/* Company info */}
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Company</p>
          <p className="text-sm font-medium text-white truncate">{tenant.companyName}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
              </Link>
            );
          })}

          {/* Admin Panel Link - Only for SUPER_ADMIN */}
          {isAdmin && (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <Link
                href="/admin"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                  pathname?.startsWith('/admin')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">Admin Panel</span>
                {pathname?.startsWith('/admin') && <ChevronRight className="w-4 h-4" />}
              </Link>
            </>
          )}
        </nav>

        {/* Logout button */}
        <div className="p-2 border-t border-gray-800">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
