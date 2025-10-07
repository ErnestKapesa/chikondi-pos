import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { getUser } from './utils/db';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getUser();
    setIsAuthenticated(!!user);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <div className="text-white text-2xl font-bold">Chikondi POS</div>
      </div>
    );
  }

  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={() => setIsAuthenticated(true)} />} 
          />
          <Route
            path="/"
            element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings onLogout={() => setIsAuthenticated(false)} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  );
}

export default App;
