import { useState, useEffect } from 'react';
import { getUser, clearUser } from '../utils/db';
import { syncData } from '../utils/sync';
import { format } from 'date-fns';
import { Icon } from '../components/Icons';
import { TutorialTrigger } from '../components/Tutorial';
import { 
  downloadDataAsJSON, 
  exportAsCSV, 
  generateBusinessSummary, 
  shareData 
} from '../utils/dataExport';

export default function Settings({ onLogout }) {
  const [user, setUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

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

  const handleExportJSON = async () => {
    setExporting(true);
    setExportMessage('');
    try {
      const success = await downloadDataAsJSON();
      setExportMessage(success ? 'Data exported successfully!' : 'Export failed');
    } catch (error) {
      setExportMessage('Export failed: ' + error.message);
    }
    setExporting(false);
  };

  const handleExportCSV = async (dataType) => {
    setExporting(true);
    setExportMessage('');
    try {
      const success = await exportAsCSV(dataType);
      setExportMessage(success ? `${dataType} exported successfully!` : 'Export failed');
    } catch (error) {
      setExportMessage('Export failed: ' + error.message);
    }
    setExporting(false);
  };

  const handleShareSummary = async () => {
    try {
      const success = await shareData('summary');
      if (!success) {
        // Fallback: generate and show summary
        const summary = await generateBusinessSummary();
        alert(`Business Summary\n\nRevenue: ${summary.financial.totalRevenue.toLocaleString()}\nProfit: ${summary.financial.netProfit.toLocaleString()}\nTransactions: ${summary.sales.totalTransactions}`);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
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
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Icon 
            name="sync" 
            size={20} 
            className={syncing ? 'animate-spin' : ''} 
          />
          {syncing ? 'Syncing...' : 'Sync Now'}
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
        <h3 className="font-bold text-lg mb-3">Data Export & Backup</h3>
        <div className="space-y-3">
          <button
            onClick={handleExportJSON}
            disabled={exporting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Icon name="download" size={20} />
            {exporting ? 'Exporting...' : 'Export All Data (JSON)'}
          </button>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleExportCSV('sales')}
              disabled={exporting}
              className="btn-secondary text-sm py-2 px-3 flex items-center justify-center gap-1"
            >
              <Icon name="receipt" size={16} />
              Sales CSV
            </button>
            <button
              onClick={() => handleExportCSV('inventory')}
              disabled={exporting}
              className="btn-secondary text-sm py-2 px-3 flex items-center justify-center gap-1"
            >
              <Icon name="inventory" size={16} />
              Stock CSV
            </button>
            <button
              onClick={() => handleExportCSV('expenses')}
              disabled={exporting}
              className="btn-secondary text-sm py-2 px-3 flex items-center justify-center gap-1"
            >
              <Icon name="expenses" size={16} />
              Expenses CSV
            </button>
          </div>

          <button
            onClick={handleShareSummary}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Icon name="share" size={20} />
            Share Business Summary
          </button>

          {exportMessage && (
            <p className={`text-sm ${
              exportMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}>
              {exportMessage}
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-3">Help & Tutorial</h3>
        <div className="space-y-3">
          <TutorialTrigger />
          <p className="text-sm text-gray-600">
            New to Chikondi POS? Take the interactive tutorial to learn all the features.
          </p>
        </div>
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
        className="btn-secondary w-full text-red-600 flex items-center justify-center gap-2 hover:bg-red-50"
      >
        <Icon name="unlock" size={20} />
        Logout
      </button>
    </div>
  );
}
