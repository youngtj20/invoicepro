'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  Home,
  Shield,
} from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Tenants',
      href: '/admin/tenants',
      icon: Users,
    },
    {
      label: 'Plans',
      href: '/admin/plans',
      icon: CreditCard,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="flex items-center space-x-2">
              <Shield className="w-6 h-6" />
              <span className="text-xl font-bold">Admin Panel</span>
            </Link>

            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
