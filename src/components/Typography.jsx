// Typography System for Chikondi POS
import React from 'react';

// Brand Typography Component - Typography as Logo
export function BrandLogo({ size = 'md', variant = 'default', className = '' }) {
  const sizes = {
    xs: { main: 'text-lg', sub: 'text-base' },
    sm: { main: 'text-xl', sub: 'text-lg' }, 
    md: { main: 'text-2xl', sub: 'text-xl' },
    lg: { main: 'text-3xl', sub: 'text-2xl' },
    xl: { main: 'text-4xl', sub: 'text-3xl' },
    xxl: { main: 'text-5xl', sub: 'text-4xl' },
    hero: { main: 'text-6xl', sub: 'text-5xl' }
  };

  const variants = {
    default: {
      main: 'text-primary font-black',
      sub: 'text-gray-400 font-light'
    },
    light: {
      main: 'text-white font-extrabold',
      sub: 'text-green-100 font-light'
    },
    dark: {
      main: 'text-gray-900 font-black',
      sub: 'text-gray-500 font-light'
    },
    minimal: {
      main: 'text-gray-800 font-bold',
      sub: 'text-gray-400 font-normal'
    }
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div className={`tracking-tight leading-none ${className}`}>
      <span className={`${currentSize.main} ${currentVariant.main}`}>
        Chikondi
      </span>
      <span className={`${currentSize.sub} ${currentVariant.sub} ml-3`}>
        POS
      </span>
    </div>
  );
}

// Page Headers
export function PageHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
      {subtitle && <p className="text-gray-600 font-medium">{subtitle}</p>}
    </div>
  );
}

// Section Headers
export function SectionHeader({ title, action, className = '' }) {
  return (
    <div className={`flex justify-between items-center mb-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action && action}
    </div>
  );
}

// Card Headers
export function CardHeader({ title, subtitle, icon, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
  );
}

// Stat Display
export function StatDisplay({ label, value, icon, trend, className = '' }) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
    </div>
  );
}

// Typography utilities
export const Typography = {
  // Headings
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-bold text-gray-900', 
  h3: 'text-xl font-semibold text-gray-900',
  h4: 'text-lg font-semibold text-gray-900',
  h5: 'text-base font-semibold text-gray-900',
  
  // Body text
  body: 'text-base text-gray-700',
  bodySmall: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  
  // Special text
  brand: 'font-bold tracking-tight',
  number: 'font-mono font-semibold',
  currency: 'font-bold text-lg',
  
  // Interactive text
  link: 'text-primary hover:text-green-700 font-medium',
  button: 'font-semibold',
  
  // Status text
  success: 'text-green-600 font-medium',
  error: 'text-red-600 font-medium',
  warning: 'text-orange-600 font-medium',
  info: 'text-blue-600 font-medium'
};

export default BrandLogo;