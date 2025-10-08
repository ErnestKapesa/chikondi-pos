// Error Boundary components for better error handling
import React from 'react';
import { Icon } from './Icons';
import { BrandLogo } from './Typography';
import { logger } from '../utils/logger';

// Main Error Boundary
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    logger.error('Error Boundary caught an error:', error);
    logger.userError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
      retryCount: this.state.retryCount
    });

    this.setState({
      error,
      errorInfo,
      hasError: true
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

// Default Error Fallback Component
export function ErrorFallback({ error, onRetry, onReload, retryCount = 0 }) {
  const isNetworkError = error?.message?.includes('fetch') || 
                         error?.message?.includes('network') ||
                         error?.message?.includes('offline');
  
  const isDatabaseError = error?.message?.includes('database') ||
                          error?.message?.includes('IndexedDB') ||
                          error?.message?.includes('IDB');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <BrandLogo size="lg" variant="default" />
        </div>
        
        <div className="mb-6">
          <Icon name="error" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          
          {isNetworkError ? (
            <p className="text-gray-600">
              It looks like you're offline or having connection issues. 
              Please check your internet connection and try again.
            </p>
          ) : isDatabaseError ? (
            <p className="text-gray-600">
              There was a problem with the app's storage. 
              This usually fixes itself when you reload the page.
            </p>
          ) : (
            <p className="text-gray-600">
              Don't worry, your data is safe. This is usually a temporary issue.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {retryCount < 3 && (
            <button
              onClick={onRetry}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Icon name="refresh" size={20} />
              Try Again {retryCount > 0 && `(${retryCount + 1}/3)`}
            </button>
          )}
          
          <button
            onClick={onReload}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Icon name="refresh" size={20} />
            Reload App
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="text-primary hover:underline text-sm"
          >
            Go to Home
          </button>
        </div>

        {/* Error details for development */}
        {import.meta.env.DEV && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Specific Error Boundaries for different parts of the app
export function PageErrorBoundary({ children, pageName }) {
  return (
    <ErrorBoundary 
      name={`Page-${pageName}`}
      fallback={(error, retry) => (
        <div className="p-8 text-center">
          <Icon name="error" size={32} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Page Error
          </h3>
          <p className="text-gray-600 mb-4">
            There was a problem loading this page.
          </p>
          <button onClick={retry} className="btn-primary">
            Try Again
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children, componentName }) {
  return (
    <ErrorBoundary 
      name={`Component-${componentName}`}
      fallback={(error, retry) => (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="error" size={20} className="text-red-500" />
            <span className="font-medium text-red-800">Component Error</span>
          </div>
          <p className="text-red-600 text-sm mb-3">
            This component failed to load properly.
          </p>
          <button onClick={retry} className="btn-secondary text-sm">
            Retry
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for handling async errors in components
export function useErrorHandler() {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    logger.error('Async error caught:', error);
    logger.userError(error, { source: 'useErrorHandler' });
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by Error Boundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;