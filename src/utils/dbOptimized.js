// Optimized database utility with connection pooling and error handling
import { openDB } from 'idb';
import { logger, perfLogger } from './logger';

const DB_NAME = 'chikondi-pos';
const DB_VERSION = 2;

// Single database instance (connection pooling)
let dbInstance = null;
let dbPromise = null;

// Database schema configuration
const STORES_CONFIG = {
  user: {
    keyPath: 'id',
    indexes: []
  },
  sales: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'timestamp', keyPath: 'timestamp' },
      { name: 'synced', keyPath: 'synced' },
      { name: 'customerId', keyPath: 'customerId' }
    ]
  },
  inventory: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'name', keyPath: 'name' },
      { name: 'synced', keyPath: 'synced' },
      { name: 'category', keyPath: 'category' }
    ]
  },
  expenses: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'timestamp', keyPath: 'timestamp' },
      { name: 'synced', keyPath: 'synced' },
      { name: 'category', keyPath: 'category' }
    ]
  },
  customers: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'name', keyPath: 'name' },
      { name: 'phone', keyPath: 'phone' },
      { name: 'email', keyPath: 'email' },
      { name: 'createdAt', keyPath: 'createdAt' },
      { name: 'lastVisit', keyPath: 'lastVisit' },
      { name: 'totalPurchases', keyPath: 'totalPurchases' },
      { name: 'synced', keyPath: 'synced' }
    ]
  }
};

// Initialize database with proper error handling
export async function initDB() {
  if (dbInstance) {
    return dbInstance;
  }
  
  if (dbPromise) {
    return dbPromise;
  }
  
  perfLogger.start('db-init');
  
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      logger.log(`🔄 Upgrading database from version ${oldVersion} to ${newVersion}`);
      
      try {
        // Create stores based on configuration
        Object.entries(STORES_CONFIG).forEach(([storeName, config]) => {
          let store;
          
          if (!db.objectStoreNames.contains(storeName)) {
            // Create new store
            const storeOptions = {
              keyPath: config.keyPath
            };
            
            if (config.autoIncrement) {
              storeOptions.autoIncrement = true;
            }
            
            store = db.createObjectStore(storeName, storeOptions);
            logger.log(`✅ Created store: ${storeName}`);
          } else {
            // Get existing store
            store = transaction.objectStore(storeName);
          }
          
          // Create indexes
          config.indexes?.forEach(indexConfig => {
            if (!store.indexNames.contains(indexConfig.name)) {
              store.createIndex(indexConfig.name, indexConfig.keyPath);
              logger.log(`✅ Created index: ${indexConfig.name} on ${storeName}`);
            }
          });
        });
        
        logger.log('✅ Database upgrade completed successfully');
      } catch (error) {
        logger.error('❌ Database upgrade failed:', error);
        throw error;
      }
    },
    
    blocked() {
      logger.warn('⚠️ Database upgrade blocked by another connection');
    },
    
    blocking() {
      logger.warn('⚠️ Database connection is blocking an upgrade');
    }
  }).then(db => {
    dbInstance = db;
    perfLogger.end('db-init');
    logger.log('✅ Database initialized successfully');
    return db;
  }).catch(error => {
    logger.error('❌ Database initialization failed:', error);
    dbPromise = null; // Reset promise so we can retry
    throw error;
  });
  
  return dbPromise;
}

// Get database instance with retry logic
export async function getDB() {
  try {
    return await initDB();
  } catch (error) {
    logger.error('Failed to get database instance:', error);
    
    // Reset instance and try once more
    dbInstance = null;
    dbPromise = null;
    
    try {
      return await initDB();
    } catch (retryError) {
      logger.error('Database retry also failed:', retryError);
      throw new Error('Database is unavailable. Please refresh the page.');
    }
  }
}

// Optimized database operations with error handling
export class DBOperations {
  // Generic CRUD operations
  static async create(storeName, data) {
    perfLogger.start(`db-create-${storeName}`);
    
    try {
      const db = await getDB();
      const enrichedData = {
        ...data,
        createdAt: data.createdAt || Date.now(),
        synced: false
      };
      
      const result = await db.add(storeName, enrichedData);
      perfLogger.end(`db-create-${storeName}`);
      
      logger.log(`✅ Created ${storeName} record:`, result);
      return result;
    } catch (error) {
      perfLogger.end(`db-create-${storeName}`);
      logger.error(`❌ Failed to create ${storeName} record:`, error);
      throw new Error(`Failed to save ${storeName}. Please try again.`);
    }
  }
  
  static async read(storeName, id) {
    perfLogger.start(`db-read-${storeName}`);
    
    try {
      const db = await getDB();
      const result = await db.get(storeName, id);
      perfLogger.end(`db-read-${storeName}`);
      
      return result;
    } catch (error) {
      perfLogger.end(`db-read-${storeName}`);
      logger.error(`❌ Failed to read ${storeName} record:`, error);
      throw new Error(`Failed to load ${storeName}. Please try again.`);
    }
  }
  
  static async update(storeName, id, updates) {
    perfLogger.start(`db-update-${storeName}`);
    
    try {
      const db = await getDB();
      const existing = await db.get(storeName, id);
      
      if (!existing) {
        throw new Error(`${storeName} record not found`);
      }
      
      const updatedData = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
        synced: false
      };
      
      const result = await db.put(storeName, updatedData);
      perfLogger.end(`db-update-${storeName}`);
      
      logger.log(`✅ Updated ${storeName} record:`, result);
      return result;
    } catch (error) {
      perfLogger.end(`db-update-${storeName}`);
      logger.error(`❌ Failed to update ${storeName} record:`, error);
      throw new Error(`Failed to update ${storeName}. Please try again.`);
    }
  }
  
  static async delete(storeName, id) {
    perfLogger.start(`db-delete-${storeName}`);
    
    try {
      const db = await getDB();
      const result = await db.delete(storeName, id);
      perfLogger.end(`db-delete-${storeName}`);
      
      logger.log(`✅ Deleted ${storeName} record:`, id);
      return result;
    } catch (error) {
      perfLogger.end(`db-delete-${storeName}`);
      logger.error(`❌ Failed to delete ${storeName} record:`, error);
      throw new Error(`Failed to delete ${storeName}. Please try again.`);
    }
  }
  
  static async getAll(storeName, indexName = null) {
    perfLogger.start(`db-getall-${storeName}`);
    
    try {
      const db = await getDB();
      let result;
      
      if (indexName) {
        result = await db.getAllFromIndex(storeName, indexName);
      } else {
        result = await db.getAll(storeName);
      }
      
      perfLogger.end(`db-getall-${storeName}`);
      return result;
    } catch (error) {
      perfLogger.end(`db-getall-${storeName}`);
      logger.error(`❌ Failed to get all ${storeName} records:`, error);
      throw new Error(`Failed to load ${storeName} data. Please try again.`);
    }
  }
  
  // Batch operations for better performance
  static async batchCreate(storeName, dataArray) {
    perfLogger.start(`db-batch-create-${storeName}`);
    
    try {
      const db = await getDB();
      const tx = db.transaction(storeName, 'readwrite');
      
      const promises = dataArray.map(data => {
        const enrichedData = {
          ...data,
          createdAt: data.createdAt || Date.now(),
          synced: false
        };
        return tx.store.add(enrichedData);
      });
      
      const results = await Promise.all(promises);
      await tx.done;
      
      perfLogger.end(`db-batch-create-${storeName}`);
      logger.log(`✅ Batch created ${results.length} ${storeName} records`);
      
      return results;
    } catch (error) {
      perfLogger.end(`db-batch-create-${storeName}`);
      logger.error(`❌ Failed to batch create ${storeName} records:`, error);
      throw new Error(`Failed to save multiple ${storeName} records. Please try again.`);
    }
  }
  
  static async batchUpdate(storeName, updates) {
    perfLogger.start(`db-batch-update-${storeName}`);
    
    try {
      const db = await getDB();
      const tx = db.transaction(storeName, 'readwrite');
      
      const promises = updates.map(({ id, data }) => {
        return tx.store.get(id).then(existing => {
          if (existing) {
            const updatedData = {
              ...existing,
              ...data,
              updatedAt: Date.now(),
              synced: false
            };
            return tx.store.put(updatedData);
          }
        });
      });
      
      const results = await Promise.all(promises);
      await tx.done;
      
      perfLogger.end(`db-batch-update-${storeName}`);
      logger.log(`✅ Batch updated ${results.length} ${storeName} records`);
      
      return results;
    } catch (error) {
      perfLogger.end(`db-batch-update-${storeName}`);
      logger.error(`❌ Failed to batch update ${storeName} records:`, error);
      throw new Error(`Failed to update multiple ${storeName} records. Please try again.`);
    }
  }
}

// Database health check
export async function checkDBHealth() {
  try {
    const db = await getDB();
    
    // Test basic operations
    const testData = { test: true, timestamp: Date.now() };
    
    // Try to create a test record
    await db.add('sales', testData);
    
    // Try to read it back
    const allSales = await db.getAll('sales');
    const testRecord = allSales.find(s => s.test === true);
    
    if (testRecord) {
      // Clean up test record
      await db.delete('sales', testRecord.id);
      return { healthy: true, message: 'Database is working correctly' };
    } else {
      return { healthy: false, message: 'Database read operation failed' };
    }
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { healthy: false, message: error.message };
  }
}

// Export legacy functions for backward compatibility
export async function addSale(sale) {
  return DBOperations.create('sales', sale);
}

export async function getAllSales() {
  return DBOperations.getAll('sales', 'timestamp');
}

export async function getSalesByDateRange(startDate, endDate) {
  const allSales = await getAllSales();
  return allSales.filter(sale => 
    sale.timestamp >= startDate && sale.timestamp <= endDate
  );
}

export async function addProduct(product) {
  return DBOperations.create('inventory', product);
}

export async function updateProduct(id, updates) {
  return DBOperations.update('inventory', id, updates);
}

export async function deleteProduct(id) {
  return DBOperations.delete('inventory', id);
}

export async function getAllProducts() {
  return DBOperations.getAll('inventory');
}

export async function getUser() {
  return DBOperations.read('user', 1);
}

export async function setUser(userData) {
  try {
    // Try to update existing user first
    const existing = await DBOperations.read('user', 1);
    if (existing) {
      return DBOperations.update('user', 1, userData);
    } else {
      // Create new user
      return DBOperations.create('user', { id: 1, ...userData });
    }
  } catch (error) {
    // If read fails, try to create
    return DBOperations.create('user', { id: 1, ...userData });
  }
}

export async function clearUser() {
  return DBOperations.delete('user', 1);
}

// Setup flag management (localStorage)
export async function hasUserEverBeenSetup() {
  const setupFlag = localStorage.getItem('chikondi-ever-setup');
  return setupFlag === 'true';
}

export async function markUserAsSetup() {
  localStorage.setItem('chikondi-ever-setup', 'true');
}

export async function logoutUser() {
  await clearUser();
  // Keep setup flag - user should go to login, not setup
}

export default {
  initDB,
  getDB,
  DBOperations,
  checkDBHealth,
  // Legacy exports
  addSale,
  getAllSales,
  getSalesByDateRange,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getUser,
  setUser,
  clearUser,
  hasUserEverBeenSetup,
  markUserAsSetup,
  logoutUser
};