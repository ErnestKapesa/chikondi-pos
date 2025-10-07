const express = require('express');
const cors = require('cors');
const nano = require('nano');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// CouchDB connection
const couchUrl = process.env.COUCHDB_URL || 'http://admin:password@localhost:5984';
const couch = nano(couchUrl);

// Database names
const DB_SALES = 'chikondi_sales';
const DB_INVENTORY = 'chikondi_inventory';
const DB_EXPENSES = 'chikondi_expenses';

// Initialize databases
async function initDatabases() {
  const databases = [DB_SALES, DB_INVENTORY, DB_EXPENSES];
  
  for (const dbName of databases) {
    try {
      await couch.db.create(dbName);
      console.log(`Database ${dbName} created`);
    } catch (err) {
      if (err.statusCode === 412) {
        console.log(`Database ${dbName} already exists`);
      } else {
        console.error(`Error creating ${dbName}:`, err);
      }
    }
  }
}

initDatabases();

// Sync endpoint
app.post('/api/sync', async (req, res) => {
  try {
    const { sales, inventory, expenses } = req.body;
    const results = { sales: [], inventory: [], expenses: [] };

    // Sync sales
    if (sales && sales.length > 0) {
      const salesDb = couch.use(DB_SALES);
      for (const sale of sales) {
        try {
          const doc = { ...sale, _id: `sale_${sale.id}_${Date.now()}` };
          const response = await salesDb.insert(doc);
          results.sales.push(response);
        } catch (err) {
          console.error('Error syncing sale:', err);
        }
      }
    }

    // Sync inventory
    if (inventory && inventory.length > 0) {
      const inventoryDb = couch.use(DB_INVENTORY);
      for (const product of inventory) {
        try {
          const doc = { ...product, _id: `product_${product.id}_${Date.now()}` };
          const response = await inventoryDb.insert(doc);
          results.inventory.push(response);
        } catch (err) {
          console.error('Error syncing inventory:', err);
        }
      }
    }

    // Sync expenses
    if (expenses && expenses.length > 0) {
      const expensesDb = couch.use(DB_EXPENSES);
      for (const expense of expenses) {
        try {
          const doc = { ...expense, _id: `expense_${expense.id}_${Date.now()}` };
          const response = await expensesDb.insert(doc);
          results.expenses.push(response);
        } catch (err) {
          console.error('Error syncing expense:', err);
        }
      }
    }

    res.json({
      success: true,
      message: 'Sync completed',
      results
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all data (for backup/restore)
app.get('/api/data/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let dbName;
    
    switch (type) {
      case 'sales':
        dbName = DB_SALES;
        break;
      case 'inventory':
        dbName = DB_INVENTORY;
        break;
      case 'expenses':
        dbName = DB_EXPENSES;
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    const db = couch.use(dbName);
    const result = await db.list({ include_docs: true });
    const docs = result.rows.map(row => row.doc);
    
    res.json({ success: true, data: docs });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Chikondi POS Server running on port ${PORT}`);
  console.log(`CouchDB URL: ${couchUrl}`);
});
