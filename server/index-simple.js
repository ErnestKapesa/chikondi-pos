const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Simple file-based storage (works on any platform)
const dataDir = './data';
const salesFile = path.join(dataDir, 'sales.json');
const inventoryFile = path.join(dataDir, 'inventory.json');
const expensesFile = path.join(dataDir, 'expenses.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    // Directory already exists, that's fine
  }
}

// Read data from file
async function readData(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

// Write data to file
async function writeData(filename, data) {
  await ensureDataDir();
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
}

// Sync endpoint - main functionality
app.post('/api/sync', async (req, res) => {
  try {
    console.log('Sync request received:', {
      sales: req.body.sales?.length || 0,
      inventory: req.body.inventory?.length || 0,
      expenses: req.body.expenses?.length || 0
    });

    const { sales, inventory, expenses } = req.body;
    let syncedCount = { sales: 0, inventory: 0, expenses: 0 };
    
    // Sync sales data
    if (sales && sales.length > 0) {
      const existingSales = await readData(salesFile);
      existingSales.push(...sales);
      await writeData(salesFile, existingSales);
      syncedCount.sales = sales.length;
      console.log(`Synced ${sales.length} sales records`);
    }
    
    // Sync inventory data
    if (inventory && inventory.length > 0) {
      const existingInventory = await readData(inventoryFile);
      existingInventory.push(...inventory);
      await writeData(inventoryFile, existingInventory);
      syncedCount.inventory = inventory.length;
      console.log(`Synced ${inventory.length} inventory records`);
    }
    
    // Sync expenses data
    if (expenses && expenses.length > 0) {
      const existingExpenses = await readData(expensesFile);
      existingExpenses.push(...expenses);
      await writeData(expensesFile, existingExpenses);
      syncedCount.expenses = expenses.length;
      console.log(`Synced ${expenses.length} expense records`);
    }
    
    res.json({
      success: true,
      message: 'Sync completed successfully',
      synced: syncedCount,
      timestamp: new Date().toISOString()
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Chikondi POS Backend is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '1.0.0'
  });
});

// Get data endpoints (for debugging and verification)
app.get('/api/data/sales', async (req, res) => {
  try {
    const sales = await readData(salesFile);
    res.json({ 
      success: true, 
      data: sales,
      count: sales.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/data/inventory', async (req, res) => {
  try {
    const inventory = await readData(inventoryFile);
    res.json({ 
      success: true, 
      data: inventory,
      count: inventory.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/data/expenses', async (req, res) => {
  try {
    const expenses = await readData(expensesFile);
    res.json({ 
      success: true, 
      data: expenses,
      count: expenses.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all data summary
app.get('/api/data/summary', async (req, res) => {
  try {
    const sales = await readData(salesFile);
    const inventory = await readData(inventoryFile);
    const expenses = await readData(expensesFile);
    
    res.json({
      success: true,
      summary: {
        sales: sales.length,
        inventory: inventory.length,
        expenses: expenses.length,
        totalRecords: sales.length + inventory.length + expenses.length
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Chikondi POS Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sync: 'POST /api/sync',
      data: '/api/data/{sales|inventory|expenses|summary}'
    },
    status: 'running'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 Chikondi POS Backend Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API docs: http://localhost:${PORT}/`);
  console.log('✅ Ready to sync data!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Server shutting down gracefully');
  process.exit(0);
});