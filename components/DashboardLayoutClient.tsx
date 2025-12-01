'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';

interface DashboardLayoutClientProps {
  user: any;
  tenant: any;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  user,
  tenant,
  children,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar - only visible on mobile */}
      <div className="md:hidden">
        <DashboardSidebar
          tenant={tenant}
          userRole={user.role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Desktop Collapsible Sidebar - only visible on desktop */}
      <div className="hidden md:flex">
        <CollapsibleSidebar
          tenant={tenant}
          userRole={user.role}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <DashboardHeader
          user={user}
          tenant={tenant}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
