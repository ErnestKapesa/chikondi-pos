// Unified Database Operations - Single source of truth for all database operations
import { openDB } from 'idb';

const DB_NAME = 'chikondi-pos';
const DB_VERSION = 4; // Fix version conflict - increment to latest

// Single database instance
let dbInstance = null;

// Initialize database with all stores
export async function initDB() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`🔄 Upgrading database from version ${oldVersion} to ${newVersion}`);
        
        try {
          // Create user store
          if (!db.objectStoreNames.contains('user')) {
            db.createObjectStore('user', { keyPath: 'id' });
            console.log('✅ Created user store');
          }

          // Create sales store
          if (!db.objectStoreNames.contains('sales')) {
            const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
            salesStore.createIndex('timestamp', 'timestamp');
            salesStore.createIndex('synced', 'synced');
            salesStore.createIndex('customerId', 'customerId');
            console.log('✅ Created sales store');
          }

          // Create inventory store
          if (!db.objectStoreNames.contains('inventory')) {
            const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
            inventoryStore.createIndex('name', 'name');
            inventoryStore.createIndex('synced', 'synced');
            inventoryStore.createIndex('category', 'category');
            console.log('✅ Created inventory store');
          }

          // Create expenses store
          if (!db.objectStoreNames.contains('expenses')) {
            const expensesStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
            expensesStore.createIndex('timestamp', 'timestamp');
            expensesStore.createIndex('synced', 'synced');
            expensesStore.createIndex('category', 'category');
            console.log('✅ Created expenses store');
          }

          // Create customers store
          if (!db.objectStoreNames.contains('customers')) {
            const customersStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
            customersStore.createIndex('name', 'name');
            customersStore.createIndex('phone', 'phone');
            customersStore.createIndex('email', 'email');
            customersStore.createIndex('createdAt', 'createdAt');
            customersStore.createIndex('lastVisit', 'lastVisit');
            customersStore.createIndex('totalPurchases', 'totalPurchases');
            customersStore.createIndex('synced', 'synced');
            console.log('✅ Created customers store');
          }

          console.log('✅ Database upgrade completed successfully');
        } catch (error) {
          console.error('❌ Database upgrade failed:', error);
          // Don't throw - let the app continue with existing stores
        }
      },
      
      blocked() {
        console.warn('⚠️ Database upgrade blocked by another connection');
      },
      
      blocking() {
        console.warn('⚠️ Database connection is blocking an upgrade');
        // Close the database to allow the upgrade
        if (dbInstance) {
          dbInstance.close();
          dbInstance = null;
        }
      }
    });

    console.log('✅ Database initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    dbInstance = null;
    throw new Error('Failed to initialize database. Please refresh the page.');
  }
}

// Generic database operations with error handling
export async function safeDBOperation(operation, storeName, operationType = 'read') {
  try {
    const db = await initDB();
    return await operation(db);
  } catch (error) {
    console.error(`❌ Database ${operationType} operation failed on ${storeName}:`, error);
    
    // If it's a database corruption issue, try to reset
    if (error.name === 'InvalidStateError' || error.name === 'VersionError') {
      console.log('🔄 Attempting database reset...');
      dbInstance = null;
      
      // Try once more
      try {
        const db = await initDB();
        return await operation(db);
      } catch (retryError) {
        console.error('❌ Database retry also failed:', retryError);
        throw new Error(`Database operation failed. Please refresh the page.`);
      }
    }
    
    throw error;
  }
}

// ===== USER OPERATIONS =====
export async function getUser() {
  return safeDBOperation(async (db) => {
    return db.get('user', 1);
  }, 'user', 'read');
}

export async function setUser(userData) {
  return safeDBOperation(async (db) => {
    return db.put('user', { id: 1, ...userData });
  }, 'user', 'write');
}

export async function clearUser() {
  return safeDBOperation(async (db) => {
    return db.delete('user', 1);
  }, 'user', 'delete');
}

// ===== CUSTOMER OPERATIONS =====
export async function addCustomer(customerData) {
  return safeDBOperation(async (db) => {
    // Validate required fields
    if (!customerData.name || customerData.name.trim() === '') {
      throw new Error('Customer name is required');
    }

    const customer = {
      ...customerData,
      name: customerData.name.trim(),
      phone: customerData.phone?.trim() || '',
      email: customerData.email?.trim() || '',
      address: customerData.address?.trim() || '',
      notes: customerData.notes?.trim() || '',
      tags: customerData.tags || [],
      createdAt: Date.now(),
      lastVisit: Date.now(),
      totalPurchases: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      loyaltyPoints: 0,
      creditBalance: 0,
      debtBalance: 0,
      synced: false
    };

    const result = await db.add('customers', customer);
    console.log('✅ Customer added successfully:', result);
    return result;
  }, 'customers', 'create');
}

export async function updateCustomer(id, updates) {
  return safeDBOperation(async (db) => {
    const customer = await db.get('customers', id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedCustomer = {
      ...customer,
      ...updates,
      updatedAt: Date.now(),
      synced: false
    };

    const result = await db.put('customers', updatedCustomer);
    console.log('✅ Customer updated successfully:', result);
    return result;
  }, 'customers', 'update');
}

export async function deleteCustomer(id) {
  return safeDBOperation(async (db) => {
    const result = await db.delete('customers', id);
    console.log('✅ Customer deleted successfully:', id);
    return result;
  }, 'customers', 'delete');
}

export async function getCustomerById(id) {
  return safeDBOperation(async (db) => {
    return db.get('customers', id);
  }, 'customers', 'read');
}

export async function getAllCustomers() {
  return safeDBOperation(async (db) => {
    const customers = await db.getAll('customers');
    console.log(`✅ Retrieved ${customers.length} customers`);
    return customers;
  }, 'customers', 'read');
}

export async function searchCustomers(query) {
  return safeDBOperation(async (db) => {
    const customers = await db.getAll('customers');
    
    if (!query) return customers;
    
    const searchTerm = query.toLowerCase();
    return customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchTerm) ||
      customer.phone?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }, 'customers', 'read');
}

export async function getCustomersBySegment(segment) {
  return safeDBOperation(async (db) => {
    const customers = await db.getAll('customers');
    
    switch (segment) {
      case 'vip':
        return customers.filter(c => (c.totalPurchases || 0) > 50000);
      case 'regular':
        return customers.filter(c => (c.totalTransactions || 0) >= 5 && (c.totalPurchases || 0) <= 50000);
      case 'new':
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return customers.filter(c => c.createdAt > thirtyDaysAgo);
      case 'inactive':
        const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
        return customers.filter(c => (c.lastVisit || 0) < sixtyDaysAgo);
      default:
        return customers;
    }
  }, 'customers', 'read');
}

export async function getCustomerStats() {
  return safeDBOperation(async (db) => {
    const customers = await db.getAll('customers');
    
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
    const totalTransactions = customers.reduce((sum, c) => sum + (c.totalTransactions || 0), 0);
    
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const activeCustomers = customers.filter(c => (c.lastVisit || 0) > thirtyDaysAgo).length;
    const newCustomers = customers.filter(c => c.createdAt > thirtyDaysAgo).length;
    
    return {
      totalCustomers,
      activeCustomers,
      newCustomers,
      totalRevenue,
      totalTransactions,
      averageCustomerValue: totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0,
      averageTransactionValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
      customerRetentionRate: totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0
    };
  }, 'customers', 'read');
}

// ===== SALES OPERATIONS =====
export async function addSale(sale) {
  return safeDBOperation(async (db) => {
    const saleData = {
      ...sale,
      timestamp: Date.now(),
      synced: false
    };
    
    const result = await db.add('sales', saleData);
    console.log('✅ Sale added successfully:', result);
    return result;
  }, 'sales', 'create');
}

export async function getAllSales() {
  return safeDBOperation(async (db) => {
    return db.getAllFromIndex('sales', 'timestamp');
  }, 'sales', 'read');
}

export async function getSalesByDateRange(startDate, endDate) {
  return safeDBOperation(async (db) => {
    const allSales = await db.getAllFromIndex('sales', 'timestamp');
    return allSales.filter(sale => 
      sale.timestamp >= startDate && sale.timestamp <= endDate
    );
  }, 'sales', 'read');
}

// ===== PRODUCT OPERATIONS =====
export async function addProduct(product) {
  return safeDBOperation(async (db) => {
    const productData = {
      ...product,
      createdAt: Date.now(),
      synced: false
    };
    
    const result = await db.add('inventory', productData);
    console.log('✅ Product added successfully:', result);
    return result;
  }, 'inventory', 'create');
}

export async function updateProduct(id, updates) {
  return safeDBOperation(async (db) => {
    const product = await db.get('inventory', id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: Date.now(),
      synced: false
    };
    
    const result = await db.put('inventory', updatedProduct);
    console.log('✅ Product updated successfully:', result);
    return result;
  }, 'inventory', 'update');
}

export async function deleteProduct(id) {
  return safeDBOperation(async (db) => {
    const result = await db.delete('inventory', id);
    console.log('✅ Product deleted successfully:', id);
    return result;
  }, 'inventory', 'delete');
}

export async function getAllProducts() {
  return safeDBOperation(async (db) => {
    const products = await db.getAll('inventory');
    console.log(`✅ Retrieved ${products.length} products`);
    return products;
  }, 'inventory', 'read');
}

export async function getProductById(id) {
  return safeDBOperation(async (db) => {
    return db.get('inventory', id);
  }, 'inventory', 'read');
}

// ===== EXPENSE OPERATIONS =====
export async function addExpense(expense) {
  return safeDBOperation(async (db) => {
    const expenseData = {
      ...expense,
      timestamp: Date.now(),
      synced: false
    };
    
    const result = await db.add('expenses', expenseData);
    console.log('✅ Expense added successfully:', result);
    return result;
  }, 'expenses', 'create');
}

export async function getAllExpenses() {
  return safeDBOperation(async (db) => {
    return db.getAllFromIndex('expenses', 'timestamp');
  }, 'expenses', 'read');
}

export async function getExpensesByDateRange(startDate, endDate) {
  return safeDBOperation(async (db) => {
    const allExpenses = await db.getAllFromIndex('expenses', 'timestamp');
    return allExpenses.filter(expense => 
      expense.timestamp >= startDate && expense.timestamp <= endDate
    );
  }, 'expenses', 'read');
}

// ===== SETUP OPERATIONS =====
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

// ===== SYNC OPERATIONS =====
export async function getUnsyncedData() {
  return safeDBOperation(async (db) => {
    const [sales, inventory, expenses, customers] = await Promise.all([
      db.getAllFromIndex('sales', 'synced'),
      db.getAllFromIndex('inventory', 'synced'),
      db.getAllFromIndex('expenses', 'synced'),
      db.getAllFromIndex('customers', 'synced')
    ]);
    
    return {
      sales: sales.filter(s => !s.synced),
      inventory: inventory.filter(i => !i.synced),
      expenses: expenses.filter(e => !e.synced),
      customers: customers.filter(c => !c.synced)
    };
  }, 'all', 'read');
}

export async function markAsSynced(store, id) {
  return safeDBOperation(async (db) => {
    const item = await db.get(store, id);
    if (item) {
      item.synced = true;
      await db.put(store, item);
    }
  }, store, 'update');
}

// ===== DATABASE HEALTH CHECK =====
export async function checkDBHealth() {
  try {
    const db = await initDB();
    
    // Test basic operations
    const testCustomer = { 
      name: 'Test Customer', 
      phone: '123456789',
      test: true 
    };
    
    // Try to create a test record
    const customerId = await db.add('customers', testCustomer);
    
    // Try to read it back
    const retrievedCustomer = await db.get('customers', customerId);
    
    if (retrievedCustomer && retrievedCustomer.test === true) {
      // Clean up test record
      await db.delete('customers', customerId);
      return { healthy: true, message: 'Database is working correctly' };
    } else {
      return { healthy: false, message: 'Database read operation failed' };
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, message: error.message };
  }
}

export default {
  initDB,
  safeDBOperation,
  checkDBHealth,
  // User operations
  getUser,
  setUser,
  clearUser,
  hasUserEverBeenSetup,
  markUserAsSetup,
  logoutUser,
  // Customer operations
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  getAllCustomers,
  searchCustomers,
  getCustomersBySegment,
  getCustomerStats,
  // Sales operations
  addSale,
  getAllSales,
  getSalesByDateRange,
  // Product operations
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  // Expense operations
  addExpense,
  getAllExpenses,
  getExpensesByDateRange,
  // Sync operations
  getUnsyncedData,
  markAsSynced
};