import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/sales', icon: '💰', label: 'Sales' },
    { path: '/inventory', icon: '📦', label: 'Stock' },
    { path: '/expenses', icon: '💸', label: 'Expenses' },
    { path: '/reports', icon: '📊', label: 'Reports' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Chikondi POS" className="w-8 h-8" />
            <h1 className="text-xl font-bold">Chikondi POS</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-2 py-1 rounded ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
              {isOnline ? '🌐 Online' : '📴 Offline'}
            </span>
            <Link to="/settings" className="text-2xl">⚙️</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                location.pathname === item.path
                  ? 'text-primary border-t-2 border-primary'
                  : 'text-gray-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
