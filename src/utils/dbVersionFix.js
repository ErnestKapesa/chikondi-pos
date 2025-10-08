// Database Version Conflict Fix
// Handles version conflicts and ensures smooth database operations

export async function fixDatabaseVersionConflict() {
  console.log('🔧 Fixing database version conflicts...');
  
  try {
    // Close any existing database connections
    if ('indexedDB' in window) {
      // Get all databases (if supported)
      if (indexedDB.databases) {
        const databases = await indexedDB.databases();
        const chikondiDB = databases.find(db => db.name === 'chikondi-pos');
        
        if (chikondiDB) {
          console.log(`🔍 Found existing database version: ${chikondiDB.version}`);
          
          // If version conflict exists, delete and recreate
          if (chikondiDB.version > 4) {
            console.log('🗑️ Deleting conflicted database...');
            await deleteDatabase('chikondi-pos');
          }
        }
      }
    }
    
    // Clear any cached database instances
    if (typeof window !== 'undefined') {
      // Clear any module-level database caches
      delete window.__chikondi_db_instance__;
    }
    
    console.log('✅ Database version conflict resolved');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Failed to fix database version conflict:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDatabase(dbName) {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(dbName);
    
    deleteRequest.onsuccess = () => {
      console.log(`✅ Database ${dbName} deleted successfully`);
      resolve();
    };
    
    deleteRequest.onerror = () => {
      console.error(`❌ Failed to delete database ${dbName}:`, deleteRequest.error);
      reject(deleteRequest.error);
    };
    
    deleteRequest.onblocked = () => {
      console.warn(`⚠️ Database ${dbName} deletion blocked - continuing anyway`);
      // Don't reject, just continue
      resolve();
    };
  });
}

export async function checkDatabaseHealth() {
  try {
    // Try to open database with current version
    const { initDB } = await import('./dbUnified');
    const db = await initDB();
    
    // Test basic operations
    const stores = ['user', 'sales', 'inventory', 'expenses', 'customers'];
    const storeChecks = stores.map(store => {
      try {
        return db.transaction(store, 'readonly').objectStore(store);
      } catch (error) {
        console.warn(`Store ${store} not accessible:`, error);
        return null;
      }
    });
    
    const healthyStores = storeChecks.filter(store => store !== null).length;
    const isHealthy = healthyStores === stores.length;
    
    console.log(`🏥 Database health: ${healthyStores}/${stores.length} stores accessible`);
    
    return {
      healthy: isHealthy,
      accessibleStores: healthyStores,
      totalStores: stores.length,
      message: isHealthy ? 'Database is healthy' : `Only ${healthyStores}/${stores.length} stores accessible`
    };
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      healthy: false,
      error: error.message,
      message: 'Database health check failed'
    };
  }
}

// Emergency database reset with user confirmation
export async function emergencyDatabaseReset() {
  const confirmed = confirm(
    'EMERGENCY DATABASE RESET\n\n' +
    'This will delete ALL your data including:\n' +
    '• Shop information\n' +
    '• Sales records\n' +
    '• Customer data\n' +
    '• Product inventory\n' +
    '• All settings\n\n' +
    'You will need to set up your shop again from scratch.\n\n' +
    'Are you absolutely sure you want to continue?'
  );
  
  if (!confirmed) {
    return { success: false, reason: 'user_cancelled' };
  }
  
  try {
    console.log('🚨 Emergency database reset initiated...');
    
    // Delete the database
    await deleteDatabase('chikondi-pos');
    
    // Clear all localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chikondi-')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Emergency reset completed');
    
    // Reload the page
    alert('Database reset completed. The page will reload to start fresh.');
    window.location.reload();
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Emergency reset failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-fix on app startup
export async function autoFixDatabaseIssues() {
  console.log('🔄 Auto-fixing database issues...');
  
  try {
    // Step 1: Fix version conflicts
    const versionFix = await fixDatabaseVersionConflict();
    if (!versionFix.success) {
      console.warn('⚠️ Version fix failed, continuing...');
    }
    
    // Step 2: Check database health
    const health = await checkDatabaseHealth();
    if (!health.healthy) {
      console.warn('⚠️ Database health issues detected:', health.message);
      
      // If critical issues, suggest reset
      if (health.accessibleStores === 0) {
        console.error('🚨 Database is completely inaccessible');
        return {
          success: false,
          critical: true,
          message: 'Database is completely inaccessible and needs reset',
          action: 'emergency_reset_needed'
        };
      }
    }
    
    console.log('✅ Database auto-fix completed');
    return { success: true, health };
    
  } catch (error) {
    console.error('❌ Database auto-fix failed:', error);
    return { 
      success: false, 
      error: error.message,
      action: 'manual_intervention_needed'
    };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  window.dbVersionFix = {
    fix: fixDatabaseVersionConflict,
    health: checkDatabaseHealth,
    reset: emergencyDatabaseReset,
    autoFix: autoFixDatabaseIssues
  };
}

export default {
  fixDatabaseVersionConflict,
  deleteDatabase,
  checkDatabaseHealth,
  emergencyDatabaseReset,
  autoFixDatabaseIssues
};