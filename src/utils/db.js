import { openDB } from 'idb';

const DB_NAME = 'chikondi-pos';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
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
  });
}

// User operations
export async function getUser() {
  const db = await initDB();
  return db.get('user', 1);
}

export async function setUser(userData) {
  const db = await initDB();
  return db.put('user', { id: 1, ...userData });
}

export async function clearUser() {
  const db = await initDB();
  return db.delete('user', 1);
}

// Sales operations
export async function addSale(sale) {
  const db = await initDB();
  return db.add('sales', {
    ...sale,
    timestamp: Date.now(),
    synced: false
  });
}

export async function getAllSales() {
  const db = await initDB();
  return db.getAllFromIndex('sales', 'timestamp');
}

export async function getSalesByDateRange(startDate, endDate) {
  const db = await initDB();
  const allSales = await db.getAllFromIndex('sales', 'timestamp');
  return allSales.filter(sale => 
    sale.timestamp >= startDate && sale.timestamp <= endDate
  );
}

// Inventory operations
export async function addProduct(product) {
  const db = await initDB();
  return db.add('inventory', {
    ...product,
    createdAt: Date.now(),
    synced: false
  });
}

export async function updateProduct(id, updates) {
  const db = await initDB();
  const product = await db.get('inventory', id);
  return db.put('inventory', {
    ...product,
    ...updates,
    updatedAt: Date.now(),
    synced: false
  });
}

export async function deleteProduct(id) {
  const db = await initDB();
  return db.delete('inventory', id);
}

export async function getAllProducts() {
  const db = await initDB();
  return db.getAll('inventory');
}

export async function getProductById(id) {
  const db = await initDB();
  return db.get('inventory', id);
}

// Expense operations
export async function addExpense(expense) {
  const db = await initDB();
  return db.add('expenses', {
    ...expense,
    timestamp: Date.now(),
    synced: false
  });
}

export async function getAllExpenses() {
  const db = await initDB();
  return db.getAllFromIndex('expenses', 'timestamp');
}

export async function getExpensesByDateRange(startDate, endDate) {
  const db = await initDB();
  const allExpenses = await db.getAllFromIndex('expenses', 'timestamp');
  return allExpenses.filter(expense => 
    expense.timestamp >= startDate && expense.timestamp <= endDate
  );
}

// Sync operations
export async function getUnsyncedData() {
  const db = await initDB();
  const sales = await db.getAllFromIndex('sales', 'synced');
  const inventory = await db.getAllFromIndex('inventory', 'synced');
  const expenses = await db.getAllFromIndex('expenses', 'synced');
  
  return {
    sales: sales.filter(s => !s.synced),
    inventory: inventory.filter(i => !i.synced),
    expenses: expenses.filter(e => !e.synced)
  };
}

export async function markAsSynced(store, id) {
  const db = await initDB();
  const item = await db.get(store, id);
  if (item) {
    item.synced = true;
    await db.put(store, item);
  }
}
