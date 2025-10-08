// Loading components for better user experience
import React from 'react';
import { Icon } from './Icons';
import { BrandLogo } from './Typography';

// Main loading spinner
export function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  color = 'primary',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-4 ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-3 text-gray-600 text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );
}

// Full page loading screen
export function PageLoading({ message = 'Loading...', showLogo = true }) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <BrandLogo size="xxl" variant="light" />
          </div>
        )}
        <LoadingSpinner size="lg" color="white" message={message} />
      </div>
    </div>
  );
}

// Inline loading for components
export function InlineLoading({ message = 'Loading...', size = 'sm' }) {
  return (
    <div className="flex items-center justify-center gap-3 p-4">
      <LoadingSpinner size={size} message="" />
      <span className="text-gray-600 text-sm">{message}</span>
    </div>
  );
}

// Loading overlay for forms and modals
export function LoadingOverlay({ 
  isVisible, 
  message = 'Processing...', 
  children,
  blur = true 
}) {
  if (!isVisible) {
    return children;
  }

  return (
    <div className="relative">
      {/* Content with optional blur */}
      <div className={blur ? 'filter blur-sm pointer-events-none' : 'pointer-events-none opacity-50'}>
        {children}
      </div>
      
      {/* Loading overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <LoadingSpinner size="md" message={message} />
        </div>
      </div>
    </div>
  );
}

// Skeleton loading for lists and cards
export function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className="animate-pulse">
      {type === 'card' && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      )}
      
      {type === 'list' && (
        <div className="flex items-center gap-3 p-3 border-b">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
      )}
      
      {type === 'text' && (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      )}
    </div>
  ));

  return <div className="space-y-4">{skeletons}</div>;
}

// Button loading state
export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  disabled,
  ...props 
}) {
  return (
    <button
      className={`${className} ${isLoading ? 'cursor-not-allowed' : ''}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" message="" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Progress bar for long operations
export function ProgressBar({ 
  progress = 0, 
  message = '', 
  showPercentage = true,
  color = 'primary' 
}) {
  const colorClasses = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="w-full">
      {message && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{message}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-800">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Loading states for different data types
export function DataLoading({ type = 'general', message }) {
  const messages = {
    sales: 'Loading sales data...',
    customers: 'Loading customers...',
    products: 'Loading inventory...',
    reports: 'Generating reports...',
    sync: 'Syncing data...',
    general: 'Loading...'
  };

  const icons = {
    sales: 'sales',
    customers: 'customers',
    products: 'inventory',
    reports: 'reports',
    sync: 'sync',
    general: 'loading'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <Icon 
          name={icons[type]} 
          size={32} 
          className="text-primary animate-pulse" 
        />
      </div>
      <LoadingSpinner 
        size="md" 
        message={message || messages[type]} 
      />
    </div>
  );
}

// Hook for managing loading states
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingMessage, setLoadingMessage] = React.useState('');

  const startLoading = React.useCallback((message = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  const withLoading = React.useCallback(async (asyncFn, message = 'Loading...') => {
    startLoading(message);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading
  };
}

export default {
  LoadingSpinner,
  PageLoading,
  InlineLoading,
  LoadingOverlay,
  SkeletonLoader,
  LoadingButton,
  ProgressBar,
  DataLoading,
  useLoading
};