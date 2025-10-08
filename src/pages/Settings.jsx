import { useState, useEffect } from 'react';
import { getUser, logoutUser, setUser } from '../utils/dbUnified';
import { syncData } from '../utils/sync';
import { format } from 'date-fns';
import { Icon } from '../components/Icons';
import { TutorialTrigger } from '../components/Tutorial';
import { UpdateSettings } from '../components/UpdateNotification';
import SecuritySettings from '../components/SecuritySettings';
import { analytics } from '../utils/analytics';
import { CURRENT_VERSION } from '../utils/appUpdates';
import { safeLogout, debugAuthState } from '../utils/authFix';
import { CURRENCIES, POPULAR_CURRENCIES, DEFAULT_CURRENCY } from '../utils/currencies';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  requestNotificationPermission,
  getNotificationSettings,
  setNotificationSettings,
  isPushNotificationSupported
} from '../utils/pushNotifications';
import { 
  downloadDataAsJSON, 
  exportAsCSV, 
  generateBusinessSummary, 
  shareData 
} from '../utils/dataExport';

export default function Settings({ onLogout }) {
  const [user, setUserState] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [changingCurrency, setChangingCurrency] = useState(false);
  const [showCurrencyForm, setShowCurrencyForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);
  const [notificationSettings, setNotificationSettingsState] = useState({
    enabled: false,
    updateNotifications: true,
    featureAnnouncements: true
  });
  
  const { formatAmount, symbol, currencyData } = useCurrency();

  useEffect(() => {
    loadUser();
    loadNotificationSettings();
    analytics.pageViewed('settings');
  }, []);

  const loadNotificationSettings = () => {
    const settings = getNotificationSettings();
    setNotificationSettingsState(settings);
  };

  const loadUser = async () => {
    try {
      const userData = await getUser();
      setUserState(userData);
      if (userData?.currency) {
        setSelectedCurrency(userData.currency);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
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
      if (success) {
        analytics.dataExported('json', 'full_backup');
      }
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
      if (success) {
        analytics.dataExported('csv', dataType);
      }
      setExportMessage(success ? `${dataType} exported successfully!` : 'Export failed');
    } catch (error) {
      setExportMessage('Export failed: ' + error.message);
    }
    setExporting(false);
  };

  const handleShareSummary = async () => {
    try {
      const success = await shareData('summary');
      analytics.businessSummaryShared();
      if (!success) {
        // Fallback: generate and show summary
        const summary = await generateBusinessSummary();
        alert(`Business Summary\n\nRevenue: ${summary.financial.totalRevenue.toLocaleString()}\nProfit: ${summary.financial.netProfit.toLocaleString()}\nTransactions: ${summary.sales.totalTransactions}`);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleEnableNotifications = async () => {
    if (!isPushNotificationSupported()) {
      alert('Push notifications are not supported on this device/browser.');
      return;
    }

    const result = await requestNotificationPermission();
    if (result.success) {
      const newSettings = { ...notificationSettings, enabled: true };
      setNotificationSettings(newSettings);
      setNotificationSettingsState(newSettings);
      alert('Notifications enabled! You\'ll be notified about app updates and new features.');
    } else {
      alert('Failed to enable notifications. Please check your browser settings.');
    }
  };

  const handleNotificationSettingChange = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    setNotificationSettingsState(newSettings);
  };

  const handleCurrencyChange = async (newCurrency) => {
    if (!user) return;
    
    setChangingCurrency(true);
    try {
      // Update user data with new currency
      const updatedUser = {
        ...user,
        currency: newCurrency,
        updatedAt: Date.now()
      };
      
      await setUser(updatedUser);
      setUserState(updatedUser);
      setSelectedCurrency(newCurrency);
      setShowCurrencyForm(false);
      
      // Reload the page to update currency context
      alert('Currency updated successfully! The page will reload to apply changes.');
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating currency:', error);
      alert('Failed to update currency. Please try again.');
    } finally {
      setChangingCurrency(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      console.log('🚪 User confirmed logout');
      
      // Debug state before logout
      await debugAuthState();
      
      // Use safe logout
      const result = await safeLogout();
      
      if (result.success) {
        console.log('✅ Safe logout completed');
        onLogout();
      } else {
        console.error('❌ Safe logout failed:', result.error);
        // Fallback to regular logout
        await logoutUser();
        onLogout();
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Settings</h2>

      {user && (
        <div className="card">
          <h3 className="font-bold text-lg mb-3">Shop Information</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Shop Name: <span className="font-semibold">{user.shopName}</span></p>
            <p className="text-gray-600">
              Currency: <span className="font-semibold">{currencyData.name} ({symbol})</span>
            </p>
            <p className="text-sm text-gray-500">
              Created: {format(user.createdAt, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      )}

      {user && (
        <div className="card">
          <h3 className="font-bold text-lg mb-3">Currency Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Current Currency</h4>
                <p className="text-sm text-gray-600">{currencyData.name} ({currencyData.code})</p>
                <p className="text-xs text-gray-500">Symbol: {symbol}</p>
              </div>
              <button
                onClick={() => setShowCurrencyForm(true)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Change Currency
              </button>
            </div>
            
            {showCurrencyForm && (
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h4 className="font-medium mb-3">Select New Currency</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Choose Currency</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="input-field"
                      disabled={changingCurrency}
                    >
                      <optgroup label="Popular Currencies">
                        {POPULAR_CURRENCIES.map(code => {
                          const curr = CURRENCIES.find(c => c.code === code);
                          return (
                            <option key={code} value={code}>
                              {curr.symbol} - {curr.name} ({code})
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="All Currencies">
                        {CURRENCIES.filter(c => !POPULAR_CURRENCIES.includes(c.code)).map(curr => (
                          <option key={curr.code} value={curr.code}>
                            {curr.symbol} - {curr.name} ({curr.code})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Icon name="warning" size={16} className="text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Important Notice</p>
                        <p>Changing currency will not convert existing prices or amounts. You may need to update your product prices manually.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCurrencyForm(false);
                        setSelectedCurrency(user.currency || DEFAULT_CURRENCY);
                      }}
                      className="btn-secondary flex-1"
                      disabled={changingCurrency}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCurrencyChange(selectedCurrency)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      disabled={changingCurrency || selectedCurrency === user.currency}
                    >
                      {changingCurrency ? (
                        <>
                          <Icon name="sync" size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Currency'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
        <UpdateSettings />
      </div>

      <SecuritySettings />

      <div className="card">
        <h3 className="font-bold text-lg mb-3">Push Notifications</h3>
        <div className="space-y-4">
          {!notificationSettings.enabled ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="notification" size={20} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">Stay Updated</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Get notified about new features, updates, and important announcements.
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="success" size={16} />
                <span className="text-sm font-medium">Notifications Enabled</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">App Updates</h4>
                    <p className="text-sm text-gray-600">Get notified about new features and improvements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.updateNotifications}
                      onChange={(e) => handleNotificationSettingChange('updateNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Feature Announcements</h4>
                    <p className="text-sm text-gray-600">Learn about new capabilities as they're released</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.featureAnnouncements}
                      onChange={(e) => handleNotificationSettingChange('featureAnnouncements', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-3">Debug & Troubleshooting</h3>
        <div className="space-y-3">
          <button
            onClick={async () => {
              const state = await debugAuthState();
              alert(`Auth State Debug:\n\nHas User: ${state?.hasUser ? 'YES' : 'NO'}\nEver Setup: ${state?.everSetup ? 'YES' : 'NO'}\nShould Show: ${state?.shouldShowLogin ? 'LOGIN' : state?.shouldShowSetup ? 'SETUP' : 'UNKNOWN'}`);
            }}
            className="btn-secondary w-full text-sm py-2 px-4"
          >
            🔍 Debug Auth State
          </button>
          
          <button
            onClick={() => {
              if (confirm('This will clear all localStorage flags and force a fresh start. Continue?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="btn-secondary w-full text-sm py-2 px-4 text-red-600"
          >
            🚨 Emergency Reset
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-3">About</h3>
        <p className="text-sm text-gray-600 mb-2">Chikondi POS v{CURRENT_VERSION}</p>
        <p className="text-sm text-gray-600 mb-2">
          Offline-first POS system for micro-entrepreneurs
        </p>
        <div className="text-xs text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Build: Production</p>
        </div>
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
