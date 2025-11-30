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
  Menu,
  X,
  Percent,
  Shield,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import LogoutButton from './LogoutButton';
import { useState } from 'react';
import { Tenant } from '@prisma/client';

interface DashboardSidebarProps {
  tenant: Tenant;
  isMobile?: boolean;
  userRole?: string;
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

export default function DashboardSidebar({ tenant, isMobile = false, userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gray-900 text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out">
              <SidebarContent tenant={tenant} pathname={pathname} userRole={userRole} />
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <SidebarContent tenant={tenant} pathname={pathname} userRole={userRole} />
    </div>
  );
}

function SidebarContent({ tenant, pathname, userRole }: { tenant: Tenant; pathname: string; userRole?: string }) {
  const isAdmin = userRole === 'SUPER_ADMIN';

  return (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 bg-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <span className="text-white font-bold text-lg">InvoicePro</span>
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
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Admin Panel Link - Only for SUPER_ADMIN */}
        {isAdmin && (
          <>
            <div className="border-t border-gray-700 my-2"></div>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname?.startsWith('/admin')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Shield className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Logout button */}
      <div className="p-2 border-t border-gray-800">
        <LogoutButton />
      </div>
    </>
  );
}
