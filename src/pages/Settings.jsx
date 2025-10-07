import { useState, useEffect } from 'react';
import { getUser, clearUser } from '../utils/db';
import { syncData } from '../utils/sync';
import { format } from 'date-fns';

export default function Settings({ onLogout }) {
  const [user, setUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    const result = await syncData();
    setSyncMessage(result.message);
    setSyncing(false);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await clearUser();
      onLogout();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Settings</h2>

      {user && (
        <div className="card">
          <h3 className="font-bold text-lg mb-2">Shop Information</h3>
          <p className="text-gray-600">Shop Name: <span className="font-semibold">{user.shopName}</span></p>
          <p className="text-sm text-gray-500 mt-1">
            Created: {format(user.createdAt, 'MMM d, yyyy')}
          </p>
        </div>
      )}

      <div className="card">
        <h3 className="font-bold text-lg mb-3">Cloud Sync</h3>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary w-full"
        >
          {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
        </button>
        {syncMessage && (
          <p className={`mt-2 text-sm ${
            syncMessage.includes('completed') ? 'text-green-600' : 'text-red-600'
          }`}>
            {syncMessage}
          </p>
        )}
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-3">About</h3>
        <p className="text-sm text-gray-600 mb-2">Chikondi POS v1.0.0</p>
        <p className="text-sm text-gray-600">
          Offline-first POS system for micro-entrepreneurs
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="btn-secondary w-full text-red-600"
      >
        🚪 Logout
      </button>
    </div>
  );
}
