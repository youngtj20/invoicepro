'use client';

import { useState } from 'react';
import { Bell, ChevronDown, User, Menu } from 'lucide-react';
import { Tenant, User as PrismaUser } from '@prisma/client';
import { signOut } from 'next-auth/react';

interface DashboardHeaderProps {
  user: PrismaUser;
  tenant: Tenant;
  onMenuClick?: () => void;
}

export default function DashboardHeader({ user, tenant, onMenuClick }: DashboardHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 sticky top-0 z-20">
      {/* Left side - menu button on mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:block">
          {/* Placeholder for future breadcrumbs */}
        </div>
      </div>

      {/* Right side - notifications and user menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          {/* Notification badge - example */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              {user.image ? (
                <img src={user.image} alt={user.name || ''} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500">{tenant.companyName}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <a
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <a
                  href="/dashboard/subscription"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Subscription
                </a>

                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
