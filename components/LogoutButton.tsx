'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface LogoutButtonProps {
  collapsed?: boolean;
}

export default function LogoutButton({ collapsed = false }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50 rounded-lg relative group',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? 'Logout' : ''}
    >
      <LogOut className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{isLoading ? 'Signing out...' : 'Logout'}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          Logout
        </div>
      )}
    </button>
  );
}
