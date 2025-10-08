// Production-safe logging utility
const isDevelopment = import.meta.env.DEV;

export const logger = {
  // Only log in development
  log: isDevelopment ? console.log : () => {},
  warn: isDevelopment ? console.warn : () => {},
  
  // Always log errors (but sanitize sensitive data)
  error: (message, ...args) => {
    // Sanitize sensitive data from error logs
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        const sanitized = { ...arg };
        // Remove sensitive fields
        delete sanitized.pin;
        delete sanitized.password;
        delete sanitized.securityAnswer;
        return sanitized;
      }
      return arg;
    });
    
    console.error(message, ...sanitizedArgs);
  },
  
  // Development-only debug logging
  debug: isDevelopment ? console.debug : () => {},
  
  // User-facing error logging (for analytics)
  userError: (error, context = {}) => {
    // Log to analytics service
    if (window.analytics) {
      window.analytics.track('error_occurred', {
        error: error.message,
        stack: error.stack,
        context: context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
    
    // Still log to console in development
    if (isDevelopment) {
      console.error('User Error:', error, context);
    }
  }
};

// Performance logging
export const perfLogger = {
  start: (label) => {
    if (isDevelopment) {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label) => {
    if (isDevelopment) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  }
};

export default logger;