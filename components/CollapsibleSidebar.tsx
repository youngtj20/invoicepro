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
  Percent,
  Shield,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Palette,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import LogoutButton from './LogoutButton';
import { Tenant } from '@prisma/client';

interface CollapsibleSidebarProps {
  tenant: Tenant;
  userRole?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Items', href: '/dashboard/items', icon: Package },
  { name: 'Taxes', href: '/dashboard/taxes', icon: Percent },
  { name: 'Templates', href: '/dashboard/templates', icon: Palette },
  { name: 'Receipts', href: '/dashboard/receipts', icon: Receipt },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function CollapsibleSidebar({
  tenant,
  userRole,
  isCollapsed,
  onToggle,
}: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === 'SUPER_ADMIN';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-gray-900 transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-1.5 border border-gray-700 transition-colors z-10"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800 border-b border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-bold text-lg whitespace-nowrap">InvoicePro</span>
          )}
        </Link>
      </div>

      {/* Company info */}
      {!isCollapsed && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Company</p>
          <p className="text-sm font-medium text-white truncate">{tenant.companyName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
              title={isCollapsed ? item.name : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}

        {/* Admin Panel Link - Only for SUPER_ADMIN */}
        {isAdmin && (
          <>
            {!isCollapsed && <div className="border-t border-gray-700 my-2"></div>}
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative',
                pathname?.startsWith('/admin')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
              title={isCollapsed ? 'Admin Panel' : ''}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">Admin Panel</span>
                  {pathname?.startsWith('/admin') && <ChevronRight className="w-4 h-4" />}
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  Admin Panel
                </div>
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Logout button */}
      <div className="p-2 border-t border-gray-800">
        <LogoutButton collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
