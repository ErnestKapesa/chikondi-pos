// Database Migration Utility
// Helps migrate from old database structure to unified database

import { initDB, checkDBHealth } from './dbUnified';

export async function migrateDatabase() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Check if migration is needed
    const health = await checkDBHealth();
    
    if (health.healthy) {
      console.log('✅ Database is healthy, no migration needed');
      return { success: true, message: 'Database is already up to date' };
    }
    
    console.log('🔧 Database needs migration, initializing...');
    
    // Force database reinitialization
    const db = await initDB();
    
    // Verify migration success
    const postMigrationHealth = await checkDBHealth();
    
    if (postMigrationHealth.healthy) {
      console.log('✅ Database migration completed successfully');
      return { success: true, message: 'Database migrated successfully' };
    } else {
      throw new Error('Migration verification failed');
    }
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    return { 
      success: false, 
      message: `Migration failed: ${error.message}`,
      error: error
    };
  }
}

// Clear corrupted database and start fresh
export async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  try {
    // Clear IndexedDB
    if ('indexedDB' in window) {
      const deleteRequest = indexedDB.deleteDatabase('chikondi-pos');
      
      await new Promise((resolve, reject) => {
        deleteRequest.onsuccess = () => {
          console.log('✅ Old database deleted');
          resolve();
        };
        deleteRequest.onerror = () => {
          console.warn('⚠️ Could not delete old database, continuing...');
          resolve(); // Continue anyway
        };
        deleteRequest.onblocked = () => {
          console.warn('⚠️ Database deletion blocked, continuing...');
          resolve(); // Continue anyway
        };
      });
    }
    
    // Initialize fresh database
    const db = await initDB();
    
    // Verify reset success
    const health = await checkDBHealth();
    
    if (health.healthy) {
      console.log('✅ Database reset completed successfully');
      return { success: true, message: 'Database reset successfully' };
    } else {
      throw new Error('Reset verification failed');
    }
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return { 
      success: false, 
      message: `Reset failed: ${error.message}`,
      error: error
    };
  }
}

// Auto-migration on app startup
export async function autoMigrate() {
  try {
    console.log('🔍 Checking database status...');
    
    // Try to initialize database
    await initDB();
    
    // Check health
    const health = await checkDBHealth();
    
    if (health.healthy) {
      console.log('✅ Database is ready');
      return { success: true, message: 'Database is ready' };
    } else {
      console.log('🔧 Database needs repair, attempting migration...');
      return await migrateDatabase();
    }
    
  } catch (error) {
    console.error('❌ Auto-migration failed:', error);
    
    // Last resort: reset database
    console.log('🚨 Attempting database reset as last resort...');
    return await resetDatabase();
  }
}

export default {
  migrateDatabase,
  resetDatabase,
  autoMigrate
};