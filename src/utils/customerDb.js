// Customer Management Database Operations
import { openDB } from 'idb';

const DB_NAME = 'chikondi-pos';
const DB_VERSION = 2; // Increment version to add customers store

export async function initCustomerDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create existing stores if they don't exist (for version 1)
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('user')) {
          db.createObjectStore('user', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
          salesStore.createIndex('timestamp', 'timestamp');
          salesStore.createIndex('synced', 'synced');
        }
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
          inventoryStore.createIndex('name', 'name');
          inventoryStore.createIndex('synced', 'synced');
        }
        if (!db.objectStoreNames.contains('expenses')) {
          const expensesStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
          expensesStore.createIndex('timestamp', 'timestamp');
          expensesStore.createIndex('synced', 'synced');
        }
      }

      // Add customers store in version 2
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('customers')) {
          const customersStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
          customersStore.createIndex('name', 'name');
          customersStore.createIndex('phone', 'phone');
          customersStore.createIndex('email', 'email');
          customersStore.createIndex('createdAt', 'createdAt');
          customersStore.createIndex('lastVisit', 'lastVisit');
          customersStore.createIndex('totalPurchases', 'totalPurchases');
          customersStore.createIndex('synced', 'synced');
        }
      }
    }
  });
}

// Customer CRUD Operations
export async function addCustomer(customerData) {
  const db = await initCustomerDB();
  const customer = {
    ...customerData,
    id: undefined, // Let IndexedDB auto-generate
    createdAt: Date.now(),
    lastVisit: Date.now(),
    totalPurchases: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    loyaltyPoints: 0,
    creditBalance: 0,
    debtBalance: 0,
    notes: customerData.notes || '',
    tags: customerData.tags || [],
    synced: false
  };
  
  return db.add('customers', customer);
}

export async function updateCustomer(id, updates) {
  const db = await initCustomerDB();
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
  
  return db.put('customers', updatedCustomer);
}

export async function deleteCustomer(id) {
  const db = await initCustomerDB();
  return db.delete('customers', id);
}

export async function getCustomerById(id) {
  const db = await initCustomerDB();
  return db.get('customers', id);
}

export async function getAllCustomers() {
  const db = await initCustomerDB();
  return db.getAll('customers');
}

export async function searchCustomers(query) {
  const db = await initCustomerDB();
  const customers = await db.getAll('customers');
  
  if (!query) return customers;
  
  const searchTerm = query.toLowerCase();
  return customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm) ||
    customer.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

// Customer Analytics & Business Logic
export async function updateCustomerPurchaseHistory(customerId, saleData) {
  const db = await initCustomerDB();
  const customer = await db.get('customers', customerId);
  
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  const saleAmount = saleData.total || 0;
  const loyaltyPointsEarned = Math.floor(saleAmount / 100); // 1 point per 100 currency units
  
  const updatedCustomer = {
    ...customer,
    lastVisit: Date.now(),
    totalPurchases: (customer.totalPurchases || 0) + saleAmount,
    totalTransactions: (customer.totalTransactions || 0) + 1,
    loyaltyPoints: (customer.loyaltyPoints || 0) + loyaltyPointsEarned,
    synced: false
  };
  
  // Calculate average transaction
  updatedCustomer.averageTransaction = Math.round(
    updatedCustomer.totalPurchases / updatedCustomer.totalTransactions
  );
  
  return db.put('customers', updatedCustomer);
}

export async function getCustomerPurchaseHistory(customerId) {
  // This would typically fetch from a sales table with customer references
  // For now, we'll return a placeholder structure
  return {
    customerId,
    purchases: [],
    totalSpent: 0,
    averageOrderValue: 0,
    lastPurchase: null,
    favoriteProducts: []
  };
}

export async function getTopCustomers(limit = 10) {
  const db = await initCustomerDB();
  const customers = await db.getAll('customers');
  
  return customers
    .sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0))
    .slice(0, limit);
}

export async function getCustomersBySegment(segment) {
  const db = await initCustomerDB();
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
}

// Loyalty & Credit Management
export async function addLoyaltyPoints(customerId, points) {
  const customer = await getCustomerById(customerId);
  if (!customer) throw new Error('Customer not found');
  
  return updateCustomer(customerId, {
    loyaltyPoints: (customer.loyaltyPoints || 0) + points
  });
}

export async function redeemLoyaltyPoints(customerId, points) {
  const customer = await getCustomerById(customerId);
  if (!customer) throw new Error('Customer not found');
  
  if ((customer.loyaltyPoints || 0) < points) {
    throw new Error('Insufficient loyalty points');
  }
  
  return updateCustomer(customerId, {
    loyaltyPoints: (customer.loyaltyPoints || 0) - points
  });
}

export async function updateCustomerCredit(customerId, amount, type = 'credit') {
  const customer = await getCustomerById(customerId);
  if (!customer) throw new Error('Customer not found');
  
  const updates = {};
  if (type === 'credit') {
    updates.creditBalance = (customer.creditBalance || 0) + amount;
  } else if (type === 'debt') {
    updates.debtBalance = (customer.debtBalance || 0) + amount;
  }
  
  return updateCustomer(customerId, updates);
}

// Customer Statistics
export async function getCustomerStats() {
  const db = await initCustomerDB();
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
}

export default {
  initCustomerDB,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  getAllCustomers,
  searchCustomers,
  updateCustomerPurchaseHistory,
  getTopCustomers,
  getCustomersBySegment,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  updateCustomerCredit,
  getCustomerStats
};