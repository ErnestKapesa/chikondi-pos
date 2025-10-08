import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Icon, AppIcons } from './Icons';
import { BrandLogo } from './Typography';

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
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/sales', icon: 'sales', label: 'Sales' },
    { path: '/customers', icon: 'customers', label: 'Customers' },
    { path: '/invoices', icon: 'receipt', label: 'Invoices' },
    { path: '/reports', icon: 'reports', label: 'Reports' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <BrandLogo size="md" variant="light" />
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${
              isOnline ? 'bg-green-600' : 'bg-red-600'
            }`}>
              <Icon 
                name={isOnline ? 'online' : 'offline'} 
                size={16} 
                color="white" 
              />
              <span className="text-white font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </span>
            <Link to="/settings" className="p-2 hover:bg-green-700 rounded-lg transition-colors">
              <Icon name="settings" size={20} color="white" />
            </Link>
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
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                location.pathname === item.path
                  ? 'text-primary border-t-2 border-primary bg-green-50'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Icon 
                name={item.icon} 
                size={24} 
                className={location.pathname === item.path ? 'text-primary' : 'text-gray-600'}
              />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
