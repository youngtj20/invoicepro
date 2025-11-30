'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
    >
      <LogOut className="w-5 h-5" />
      <span>{isLoading ? 'Signing out...' : 'Logout'}</span>
    </button>
  );
}
