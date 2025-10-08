// Data Export & Backup Utilities for Chikondi POS
import { getUser, getAllSales, getAllProducts, getAllExpenses, getAllCustomers } from './dbUnified';

// Export all data as JSON
export async function exportAllData() {
  try {
    const [user, sales, inventory, expenses] = await Promise.all([
      getUser(),
      getAllSales(),
      getAllProducts(),
      getAllExpenses()
    ]);

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        appName: "Chikondi POS",
        dataTypes: ["user", "sales", "inventory", "expenses"]
      },
      user: user || null,
      sales: sales || [],
      inventory: inventory || [],
      expenses: expenses || [],
      summary: {
        totalSales: sales?.length || 0,
        totalProducts: inventory?.length || 0,
        totalExpenses: expenses?.length || 0,
        totalRevenue: sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0,
        totalExpenseAmount: expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0
      }
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

// Download data as JSON file
export async function downloadDataAsJSON() {
  try {
    const data = await exportAllData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chikondi-pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error downloading data:', error);
    return false;
  }
}

// Export data as CSV for specific data type
export async function exportAsCSV(dataType) {
  try {
    let data = [];
    let headers = [];
    let filename = '';

    switch (dataType) {
      case 'sales':
        data = await getAllSales();
        headers = ['ID', 'Date', 'Time', 'Items', 'Total', 'Payment Method', 'Customer'];
        filename = 'sales-report';
        data = data.map(sale => [
          sale.id,
          new Date(sale.timestamp).toLocaleDateString(),
          new Date(sale.timestamp).toLocaleTimeString(),
          sale.items?.map(item => `${item.name} (${item.quantity})`).join('; ') || '',
          sale.total || 0,
          sale.paymentMethod || 'Cash',
          sale.customer?.name || 'Walk-in Customer'
        ]);
        break;

      case 'inventory':
        data = await getAllProducts();
        headers = ['ID', 'Name', 'Price', 'Stock', 'Category', 'Created Date'];
        filename = 'inventory-report';
        data = data.map(product => [
          product.id,
          product.name || '',
          product.price || 0,
          product.stock || 0,
          product.category || 'General',
          new Date(product.createdAt).toLocaleDateString()
        ]);
        break;

      case 'expenses':
        data = await getAllExpenses();
        headers = ['ID', 'Date', 'Description', 'Amount', 'Category'];
        filename = 'expenses-report';
        data = data.map(expense => [
          expense.id,
          new Date(expense.timestamp).toLocaleDateString(),
          expense.description || '',
          expense.amount || 0,
          expense.category || 'General'
        ]);
        break;

      default:
        throw new Error('Invalid data type for CSV export');
    }

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
}

// Generate business summary report
export async function generateBusinessSummary() {
  try {
    const [sales, inventory, expenses] = await Promise.all([
      getAllSales(),
      getAllProducts(),
      getAllExpenses()
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Filter recent data
    const recentSales = sales.filter(sale => new Date(sale.timestamp) >= thirtyDaysAgo);
    const weekSales = sales.filter(sale => new Date(sale.timestamp) >= sevenDaysAgo);
    const recentExpenses = expenses.filter(expense => new Date(expense.timestamp) >= thirtyDaysAgo);

    // Calculate metrics
    const totalRevenue = recentSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalExpenses = recentExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const weekRevenue = weekSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const avgDailyRevenue = weekRevenue / 7;

    // Product analysis
    const lowStockProducts = inventory.filter(product => (product.stock || 0) < 10);
    const outOfStockProducts = inventory.filter(product => (product.stock || 0) === 0);

    // Top selling products (from recent sales)
    const productSales = {};
    recentSales.forEach(sale => {
      sale.items?.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + (item.quantity || 0);
      });
    });
    
    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    return {
      period: "Last 30 Days",
      generatedAt: now.toISOString(),
      
      // Financial Summary
      financial: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0,
        avgDailyRevenue: avgDailyRevenue.toFixed(0)
      },

      // Sales Summary
      sales: {
        totalTransactions: recentSales.length,
        weekTransactions: weekSales.length,
        avgTransactionValue: recentSales.length > 0 ? (totalRevenue / recentSales.length).toFixed(0) : 0
      },

      // Inventory Insights
      inventory: {
        totalProducts: inventory.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockProducts: lowStockProducts.map(p => ({ name: p.name, stock: p.stock })),
        topSellingProducts: topProducts
      },

      // Recommendations
      recommendations: [
        ...(lowStockProducts.length > 0 ? [`Restock ${lowStockProducts.length} low-stock products`] : []),
        ...(outOfStockProducts.length > 0 ? [`${outOfStockProducts.length} products are out of stock`] : []),
        ...(netProfit < 0 ? ["Review expenses - currently operating at a loss"] : []),
        ...(recentSales.length < 10 ? ["Consider marketing to increase sales volume"] : [])
      ]
    };
  } catch (error) {
    console.error('Error generating business summary:', error);
    throw new Error('Failed to generate business summary');
  }
}

// Share data via Web Share API (mobile-friendly)
export async function shareData(dataType = 'summary') {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    let shareData = {};

    if (dataType === 'summary') {
      const summary = await generateBusinessSummary();
      shareData = {
        title: 'Chikondi POS - Business Summary',
        text: `Business Summary (${summary.period})\n\n` +
              `💰 Revenue: ${summary.financial.totalRevenue.toLocaleString()}\n` +
              `💸 Expenses: ${summary.financial.totalExpenses.toLocaleString()}\n` +
              `📈 Net Profit: ${summary.financial.netProfit.toLocaleString()}\n` +
              `🛒 Transactions: ${summary.sales.totalTransactions}\n\n` +
              `Generated by Chikondi POS`
      };
    } else {
      const data = await exportAllData();
      shareData = {
        title: 'Chikondi POS - Data Backup',
        text: `Data backup from ${data.metadata.exportDate}\n\n` +
              `📊 ${data.summary.totalSales} sales\n` +
              `📦 ${data.summary.totalProducts} products\n` +
              `💸 ${data.summary.totalExpenses} expenses\n\n` +
              `Total Revenue: ${data.summary.totalRevenue.toLocaleString()}`
      };
    }

    await navigator.share(shareData);
    return true;
  } catch (error) {
    console.error('Error sharing data:', error);
    return false;
  }
}

export default {
  exportAllData,
  downloadDataAsJSON,
  exportAsCSV,
  generateBusinessSummary,
  shareData
};