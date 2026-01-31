'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionDebugPage() {
  const { data: session, status, update } = useSession();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDbUser = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      setDbUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async () => {
    setLoading(true);
    try {
      await update();
      alert('Session updated! Check console for details.');
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Debug Page</h1>

        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${status === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status}</span></p>
          </div>
        </div>

        {/* Session Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Data</h2>
          {session ? (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {session.user?.id || 'N/A'}</p>
              <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
              <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
              <p><strong>Role:</strong> {session.user?.role || 'N/A'}</p>
              <p><strong>Tenant ID:</strong> 
                <span className={`ml-2 px-2 py-1 rounded ${session.user?.tenantId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {session.user?.tenantId || 'NULL ❌'}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No session data</p>
          )}
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* Database User Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database User Data</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : dbUser ? (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {dbUser.id || 'N/A'}</p>
              <p><strong>Email:</strong> {dbUser.email || 'N/A'}</p>
              <p><strong>Name:</strong> {dbUser.name || 'N/A'}</p>
              <p><strong>Role:</strong> {dbUser.role || 'N/A'}</p>
              <p><strong>Tenant ID (DB):</strong> 
                <span className={`ml-2 px-2 py-1 rounded ${dbUser.tenantId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {dbUser.tenantId || 'NULL ❌'}
                </span>
              </p>
              {dbUser.tenant && (
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <p className="font-semibold mb-2">Tenant Info:</p>
                  <p><strong>Company:</strong> {dbUser.tenant.companyName}</p>
                  <p><strong>Status:</strong> {dbUser.tenant.status}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-500">Failed to load user data</p>
          )}
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-xs">
            {JSON.stringify(dbUser, null, 2)}
          </pre>
        </div>

        {/* Comparison */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Comparison</h2>
          <div className="space-y-2">
            <p><strong>Session tenantId:</strong> {session?.user?.tenantId || 'NULL'}</p>
            <p><strong>Database tenantId:</strong> {dbUser?.tenantId || 'NULL'}</p>
            {session?.user?.tenantId !== dbUser?.tenantId && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-semibold">⚠️ MISMATCH DETECTED!</p>
                <p className="text-sm mt-2">The session tenantId doesn't match the database. This is the root cause of your issue.</p>
              </div>
            )}
            {session?.user?.tenantId === dbUser?.tenantId && dbUser?.tenantId && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">✅ MATCH!</p>
                <p className="text-sm mt-2">Session and database are in sync.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={fetchDbUser}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Refresh Database Data
            </button>
            <button
              onClick={handleUpdateSession}
              disabled={loading}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Update Session
            </button>
            <button
              onClick={() => window.location.href = '/api/auth/signout'}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> If there's a mismatch, click "Update Session" to sync the session with the database.
              If that doesn't work, sign out and sign back in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
