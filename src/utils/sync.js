import { getUnsyncedData, markAsSynced } from './dbUnified';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function syncData() {
  if (!navigator.onLine) {
    console.log('Offline - sync skipped');
    return { success: false, message: 'Offline' };
  }

  try {
    const unsyncedData = await getUnsyncedData();
    
    const response = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(unsyncedData)
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }

    const result = await response.json();
    
    // Mark items as synced
    for (const sale of unsyncedData.sales) {
      await markAsSynced('sales', sale.id);
    }
    for (const product of unsyncedData.inventory) {
      await markAsSynced('inventory', product.id);
    }
    for (const expense of unsyncedData.expenses) {
      await markAsSynced('expenses', expense.id);
    }

    return { success: true, message: 'Sync completed', result };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, message: error.message };
  }
}

// Auto-sync when online
export function setupAutoSync() {
  window.addEventListener('online', () => {
    console.log('Back online - syncing...');
    syncData();
  });

  // Periodic sync every 5 minutes if online
  setInterval(() => {
    if (navigator.onLine) {
      syncData();
    }
  }, 5 * 60 * 1000);
}
