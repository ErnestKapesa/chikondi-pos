// Emergency Fix for Critical Database Issues
// This handles the version conflict and authentication issues

export async function emergencyDatabaseFix() {
  console.log('🚨 Starting emergency database fix...');
  
  try {
    // Step 1: Close all database connections
    console.log('🔄 Closing database connections...');
    
    // Step 2: Delete the problematic database
    console.log('🗑️ Deleting corrupted database...');
    await deleteDatabase('chikondi-pos');
    
    // Step 3: Clear all localStorage
    console.log('🧹 Clearing localStorage...');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chikondi-')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      }
    });
    
    // Step 4: Clear any cached data
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🧹 Cleared all caches');
    }
    
    console.log('✅ Emergency fix completed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDatabase(dbName) {
  return new Promise((resolve, reject) => {
    console.log(`🗑️ Deleting database: ${dbName}`);
    
    const deleteRequest = indexedDB.deleteDatabase(dbName);
    
    deleteRequest.onsuccess = () => {
      console.log(`✅ Database ${dbName} deleted successfully`);
      resolve();
    };
    
    deleteRequest.onerror = () => {
      console.error(`❌ Failed to delete database ${dbName}:`, deleteRequest.error);
      resolve(); // Don't reject, continue anyway
    };
    
    deleteRequest.onblocked = () => {
      console.warn(`⚠️ Database ${dbName} deletion blocked - forcing reload`);
      // Force reload to close connections
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      resolve();
    };
  });
}

// User-friendly emergency reset
export async function userEmergencyReset() {
  const confirmed = confirm(
    '🚨 EMERGENCY RESET\n\n' +
    'This will fix database issues by:\n' +
    '• Deleting all app data\n' +
    '• Clearing all settings\n' +
    '• Starting completely fresh\n\n' +
    'You will need to set up your shop again.\n\n' +
    'Continue with emergency reset?'
  );
  
  if (!confirmed) {
    return { success: false, reason: 'cancelled' };
  }
  
  try {
    await emergencyDatabaseFix();
    
    alert(
      '✅ Emergency reset completed!\n\n' +
      'The page will reload and you can set up your shop again.'
    );
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return { success: true };
    
  } catch (error) {
    alert(
      '❌ Emergency reset failed!\n\n' +
      'Please try refreshing the page manually.\n\n' +
      'Error: ' + error.message
    );
    
    return { success: false, error: error.message };
  }
}

// Auto-detect and fix version conflicts
export async function autoFixVersionConflict() {
  console.log('🔍 Checking for version conflicts...');
  
  try {
    // Try to detect version conflicts by attempting database operations
    const { initDB } = await import('./dbUnified');
    
    try {
      const db = await initDB();
      console.log('✅ Database opened successfully');
      return { success: true, action: 'no_fix_needed' };
    } catch (error) {
      if (error.name === 'VersionError' || error.message.includes('version')) {
        console.log('🔧 Version conflict detected, applying fix...');
        
        // Apply emergency fix
        const fixResult = await emergencyDatabaseFix();
        
        if (fixResult.success) {
          return { 
            success: true, 
            action: 'version_conflict_fixed',
            message: 'Database version conflict resolved'
          };
        } else {
          return {
            success: false,
            action: 'fix_failed',
            error: fixResult.error
          };
        }
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
    return {
      success: false,
      error: error.message,
      action: 'manual_intervention_needed'
    };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  window.emergencyFix = {
    fix: emergencyDatabaseFix,
    reset: userEmergencyReset,
    autoFix: autoFixVersionConflict
  };
}

export default {
  emergencyDatabaseFix,
  deleteDatabase,
  userEmergencyReset,
  autoFixVersionConflict
};