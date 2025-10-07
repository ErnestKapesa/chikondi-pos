# Offline-First Architecture - Chikondi POS

## Core Principles

1. **Local-First**: All operations happen locally first
2. **Sync When Possible**: Cloud sync is a background enhancement
3. **Conflict Resolution**: Last-write-wins with timestamp-based resolution
4. **Progressive Enhancement**: Works offline, better when online

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│                    (React Components)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Logic                       │
│              (React Hooks & Context)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   IndexedDB Layer                        │
│         (idb library - Local Data Storage)              │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Sales   │  │Inventory │  │ Expenses │             │
│  │  Store   │  │  Store   │  │  Store   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Service Worker                          │
│         (Workbox - Asset Caching & Offline)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ (when online)
┌─────────────────────────────────────────────────────────┐
│                   Sync Manager                           │
│            (Background Sync Handler)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│              (Node.js + Express)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   CouchDB                                │
│              (Cloud Data Storage)                        │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Write Operations (Create/Update/Delete)

```
User Action
    ↓
Write to IndexedDB (immediate)
    ↓
Update UI (instant feedback)
    ↓
Mark as unsynced
    ↓
[If Online] → Queue for sync
    ↓
Background sync to cloud
    ↓
Mark as synced
```

### 2. Read Operations

```
User Request
    ↓
Read from IndexedDB
    ↓
Return data (instant)
    ↓
[If Online] → Check for updates
    ↓
Merge remote changes
    ↓
Update local cache
```

## IndexedDB Schema

### Database: `chikondi-pos`

#### Object Store: `user`
```javascript
{
  id: 1,                    // Primary key
  pin: "1234",              // User PIN
  shopName: "My Shop",      // Shop name
  createdAt: 1234567890     // Timestamp
}
```

#### Object Store: `sales`
```javascript
{
  id: 1,                    // Auto-increment primary key
  productId: 5,             // Reference to product
  productName: "Item A",    // Denormalized for offline
  quantity: 2,              // Quantity sold
  amount: 1000,             // Total amount
  paymentMethod: "cash",    // cash | mobile_money
  timestamp: 1234567890,    // Sale timestamp
  synced: false             // Sync status
}
```
Indexes: `timestamp`, `synced`

#### Object Store: `inventory`
```javascript
{
  id: 1,                    // Auto-increment primary key
  name: "Product Name",     // Product name
  price: 500,               // Unit price
  quantity: 50,             // Stock quantity
  lowStockAlert: 5,         // Alert threshold
  createdAt: 1234567890,    // Creation timestamp
  updatedAt: 1234567890,    // Last update
  synced: false             // Sync status
}
```
Indexes: `name`, `synced`

#### Object Store: `expenses`
```javascript
{
  id: 1,                    // Auto-increment primary key
  description: "Rent",      // Expense description
  amount: 5000,             // Expense amount
  category: "rent",         // Category
  timestamp: 1234567890,    // Expense timestamp
  synced: false             // Sync status
}
```
Indexes: `timestamp`, `synced`

## Service Worker Strategy

### Cache-First Strategy
```javascript
// For app shell (HTML, CSS, JS)
workbox.routing.registerRoute(
  ({request}) => request.destination === 'document' ||
                 request.destination === 'script' ||
                 request.destination === 'style',
  new workbox.strategies.CacheFirst({
    cacheName: 'app-shell',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);
```

### Network-First Strategy
```javascript
// For API calls (when online)
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);
```

## Sync Strategy

### Automatic Sync Triggers

1. **Online Event**: When device reconnects
```javascript
window.addEventListener('online', () => {
  syncData();
});
```

2. **Periodic Sync**: Every 5 minutes (if online)
```javascript
setInterval(() => {
  if (navigator.onLine) {
    syncData();
  }
}, 5 * 60 * 1000);
```

3. **Manual Sync**: User-initiated from settings

### Sync Process

```javascript
async function syncData() {
  // 1. Get unsynced data
  const unsynced = await getUnsyncedData();
  
  // 2. Send to server
  const response = await fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(unsynced)
  });
  
  // 3. Mark as synced
  if (response.ok) {
    await markAsSynced(unsynced);
  }
}
```

### Conflict Resolution

**Strategy**: Last-Write-Wins (LWW)

```javascript
// Compare timestamps
if (localTimestamp > remoteTimestamp) {
  // Keep local version
  uploadToServer(localData);
} else {
  // Use remote version
  updateLocal(remoteData);
}
```

## Offline Detection

### Network Status Monitoring
```javascript
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
```

### Visual Indicators
- Online: Green badge "🌐 Online"
- Offline: Red badge "📴 Offline"
- Syncing: Yellow badge "⏳ Syncing..."

## Performance Optimizations

### 1. Lazy Loading
```javascript
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
```

### 2. Virtual Scrolling
For large lists (1000+ items):
```javascript
import { FixedSizeList } from 'react-window';
```

### 3. Debounced Search
```javascript
const debouncedSearch = useMemo(
  () => debounce((query) => searchProducts(query), 300),
  []
);
```

### 4. Indexed Queries
Use IndexedDB indexes for fast lookups:
```javascript
// Fast: Uses index
const sales = await db.getAllFromIndex('sales', 'timestamp');

// Slow: Full scan
const sales = await db.getAll('sales');
```

## Error Handling

### Network Errors
```javascript
try {
  await syncData();
} catch (error) {
  if (error.name === 'NetworkError') {
    // Queue for retry
    queueForRetry();
  } else {
    // Log error
    console.error(error);
  }
}
```

### Storage Quota
```javascript
if (navigator.storage && navigator.storage.estimate) {
  const {usage, quota} = await navigator.storage.estimate();
  const percentUsed = (usage / quota) * 100;
  
  if (percentUsed > 80) {
    // Warn user
    showStorageWarning();
  }
}
```

## Testing Offline Functionality

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Test all features

### Lighthouse PWA Audit
```bash
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

### Manual Testing Checklist
- [ ] Record sale offline
- [ ] Add product offline
- [ ] Add expense offline
- [ ] View reports offline
- [ ] Sync when back online
- [ ] Handle sync conflicts
- [ ] Install as PWA
- [ ] Receive push notifications

## Security Considerations

### Local Data Encryption
For production, consider encrypting sensitive data:
```javascript
import { encrypt, decrypt } from 'crypto-js';

// Before storing
const encrypted = encrypt(JSON.stringify(data), userPin);
await db.put('user', { id: 1, data: encrypted });

// After retrieving
const decrypted = decrypt(stored.data, userPin);
const data = JSON.parse(decrypted);
```

### PIN Security
- Hash PIN before storage
- Implement lockout after failed attempts
- Add biometric authentication option

## Monitoring & Analytics

### Offline Usage Tracking
```javascript
// Track offline operations
if (!navigator.onLine) {
  analytics.track('offline_sale_recorded', {
    amount: sale.amount,
    timestamp: Date.now()
  });
}
```

### Sync Performance
```javascript
const syncStart = Date.now();
await syncData();
const syncDuration = Date.now() - syncStart;

analytics.track('sync_completed', {
  duration: syncDuration,
  itemsSynced: unsynced.length
});
```

## Best Practices

1. **Always write locally first** - Never wait for network
2. **Show immediate feedback** - Update UI instantly
3. **Queue operations** - Don't block on network calls
4. **Handle failures gracefully** - Retry with exponential backoff
5. **Denormalize data** - Store what you need to display
6. **Use timestamps** - For conflict resolution
7. **Test offline** - Make it a first-class experience
8. **Monitor storage** - Warn before quota exceeded
9. **Optimize queries** - Use indexes effectively
10. **Cache aggressively** - Assume offline is the default

## Future Enhancements

### Background Sync API
```javascript
// Register background sync
await registration.sync.register('sync-data');

// Handle in service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
```

### Periodic Background Sync
```javascript
// Request permission
const status = await navigator.permissions.query({
  name: 'periodic-background-sync'
});

if (status.state === 'granted') {
  await registration.periodicSync.register('sync-data', {
    minInterval: 24 * 60 * 60 * 1000 // 24 hours
  });
}
```

### Web Push Notifications
```javascript
// Request permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicKey
  });
}
```
