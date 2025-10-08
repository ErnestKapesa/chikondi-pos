#!/usr/bin/env node

// Bundle optimization script
const fs = require('fs');
const path = require('path');

// Update vite.config.js for better optimization
const viteConfigPath = path.join(__dirname, '../vite.config.js');

const optimizedViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/fonts\\.googleapis\\.com\\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Chikondi POS - Business Management',
        short_name: 'Chikondi POS',
        description: 'Offline-first POS system with customer management, invoicing, and analytics',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['date-fns'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'db-vendor': ['idb'],
          // App chunks
          'pages': [
            './src/pages/Reports.jsx',
            './src/pages/Invoices.jsx',
            './src/pages/Customers.jsx',
            './src/pages/Inventory.jsx',
            './src/pages/Expenses.jsx'
          ],
          'utils': [
            './src/utils/invoiceGenerator.js',
            './src/utils/simpleInvoice.js',
            './src/utils/analytics.js'
          ]
        }
      }
    },
    // Optimize assets
    assetsInlineLimit: 4096, // 4kb
    cssCodeSplit: true,
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    }
  },
  // Development optimizations
  server: {
    hmr: {
      overlay: false // Disable error overlay for better development experience
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'date-fns',
      'idb'
    ],
    exclude: [
      'jspdf',
      'html2canvas'
    ]
  }
});
`;

// Update package.json scripts
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add optimization scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'analyze': 'npm run build && npx vite-bundle-analyzer dist',
  'build:analyze': 'npm run build -- --analyze',
  'optimize': 'node scripts/optimize-bundle.js && node scripts/cleanup-console-logs.js',
  'lint': 'eslint src --ext .js,.jsx --fix',
  'type-check': 'tsc --noEmit',
  'test': 'vitest run',
  'test:watch': 'vitest',
  'preview': 'vite preview'
};

// Add development dependencies for optimization
const newDevDeps = {
  'vite-bundle-analyzer': '^0.7.0',
  'eslint': '^8.57.0',
  'eslint-plugin-react': '^7.34.0',
  'eslint-plugin-react-hooks': '^4.6.0',
  '@typescript-eslint/eslint-plugin': '^7.0.0',
  'prettier': '^3.2.0',
  'vitest': '^1.4.0'
};

packageJson.devDependencies = {
  ...packageJson.devDependencies,
  ...newDevDeps
};

console.log('🚀 Optimizing bundle configuration...\n');

// Write optimized vite config
fs.writeFileSync(viteConfigPath, optimizedViteConfig);
console.log('✅ Updated vite.config.js with optimization settings');

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with optimization scripts');

// Create ESLint config
const eslintConfig = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "no-unused-vars": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};

fs.writeFileSync(path.join(__dirname, '../.eslintrc.json'), JSON.stringify(eslintConfig, null, 2));
console.log('✅ Created .eslintrc.json for code quality');

// Create Prettier config
const prettierConfig = {
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
};

fs.writeFileSync(path.join(__dirname, '../.prettierrc.json'), JSON.stringify(prettierConfig, null, 2));
console.log('✅ Created .prettierrc.json for code formatting');

console.log('\n🎉 Bundle optimization completed!');
console.log('\n📋 Next steps:');
console.log('1. Install new dependencies: npm install');
console.log('2. Run optimization: npm run optimize');
console.log('3. Build and analyze: npm run build && npm run analyze');
console.log('4. Test the optimized build: npm run preview');
console.log('\n📊 Expected improvements:');
console.log('• Bundle size: 729KB → <500KB (30% reduction)');
console.log('• Load time: Faster initial load with code splitting');
console.log('• Performance: Better caching and optimization');
console.log('• Code quality: ESLint and Prettier integration');