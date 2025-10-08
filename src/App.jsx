import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Layout from './components/Layout';
import Tutorial from './components/Tutorial';
import UpdateNotification from './components/UpdateNotification';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { getUser } from './utils/dbUnified';
import { ErrorBoundary, PageErrorBoundary } from './components/ErrorBoundary';
import { PageLoading, LoadingSpinner } from './components/Loading';
import { logger } from './utils/logger';
import { autoMigrate } from './utils/dbMigration';

// Lazy load heavy components for better performance
const Inventory = lazy(() => import('./pages/Inventory'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Customers = lazy(() => import('./pages/Customers'));
const Invoices = lazy(() => import('./pages/Invoices'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First, ensure database is ready
      const migrationResult = await autoMigrate();
      if (!migrationResult.success) {
        throw new Error(`Database initialization failed: ${migrationResult.message}`);
      }
      
      // Then check authentication
      const user = await getUser();
      setIsAuthenticated(!!user);
      logger.log('Authentication check completed:', { hasUser: !!user });
    } catch (error) {
      logger.error('Authentication check failed:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading message="Starting Chikondi POS..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Failed to Start App
          </h2>
          <p className="text-gray-600 mb-6">
            There was a problem starting Chikondi POS. This is usually a temporary issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary name="App">
      <CurrencyProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoading message="Loading page..." />}>
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" />
                  ) : (
                    <PageErrorBoundary pageName="Login">
                      <Login onLogin={() => setIsAuthenticated(true)} />
                    </PageErrorBoundary>
                  )
                }
              />
              <Route
                path="/"
                element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
              >
                <Route 
                  index 
                  element={
                    <PageErrorBoundary pageName="Dashboard">
                      <Dashboard />
                    </PageErrorBoundary>
                  } 
                />
                <Route 
                  path="sales" 
                  element={
                    <PageErrorBoundary pageName="Sales">
                      <Sales />
                    </PageErrorBoundary>
                  } 
                />
                <Route 
                  path="inventory" 
                  element={
                    <PageErrorBoundary pageName="Inventory">
                      <Suspense fallback={<LoadingSpinner message="Loading inventory..." />}>
                        <Inventory />
                      </Suspense>
                    </PageErrorBoundary>
                  } 
                />
                <Route 
                  path="customers" 
                  element={
                    <PageErrorBoundary pageName="Customers">
                      <Suspense fallback={<LoadingSpinner message="Loading customers..." />}>
                        <Customers />
                      </Suspense>
                    </PageErrorBoundary>
                  } 
                />
                <Route 
                  path="invoices" 
                  element={
                    <PageErrorBoundary pageName="Invoices">
                      <Suspense fallback={<LoadingSpinner message="Loading invoices..." />}>
                        <Invoices />
                      </Suspense>
                    </PageErrorBoundary>
                  } 
                />
                <Route 
                  path="reports" 
                  element={
                    <PageErrorBoundary pageName="Reports">
                      <Suspense fallback={<LoadingSpinner message="Loading reports..." />}>
                        <Reports />
                      </Suspense>
                    </PageErrorBoundary>
                  } 
                />
                <Route 
                  path="settings" 
                  element={
                    <PageErrorBoundary pageName="Settings">
                      <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
                        <Settings onLogout={() => setIsAuthenticated(false)} />
                      </Suspense>
                    </PageErrorBoundary>
                  } 
                />
              </Route>
            </Routes>
          </Suspense>

          {/* Tutorial - shows automatically for new users */}
          {isAuthenticated && (
            <ErrorBoundary name="Tutorial">
              <Tutorial />
            </ErrorBoundary>
          )}

          {/* Update Notification - shows for existing users with new features */}
          {isAuthenticated && (
            <ErrorBoundary name="UpdateNotification">
              <UpdateNotification />
            </ErrorBoundary>
          )}

          {/* Vercel Analytics */}
          <Analytics />
        </BrowserRouter>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}

export default App;
