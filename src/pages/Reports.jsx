import { useState, useEffect } from 'react';
import { getSalesByDateRange, getExpensesByDateRange, getAllProducts } from '../utils/db';
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { useCurrency } from '../contexts/CurrencyContext';
import { Icon } from '../components/Icons';

export default function Reports() {
  const { formatAmount } = useCurrency();
  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    salesCount: 0,
    topProducts: []
  });

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    let startTime, endTime;
    const now = new Date();

    switch (period) {
      case 'today':
        startTime = startOfDay(now).getTime();
        endTime = endOfDay(now).getTime();
        break;
      case 'week':
        startTime = startOfWeek(now).getTime();
        endTime = endOfDay(now).getTime();
        break;
      case 'month':
        startTime = startOfMonth(now).getTime();
        endTime = endOfDay(now).getTime();
        break;
      default:
        startTime = startOfDay(now).getTime();
        endTime = endOfDay(now).getTime();
    }

    const sales = await getSalesByDateRange(startTime, endTime);
    const expenses = await getExpensesByDateRange(startTime, endTime);

    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate top products
    const productSales = {};
    sales.forEach(sale => {
      if (!productSales[sale.productName]) {
        productSales[sale.productName] = { name: sale.productName, quantity: 0, revenue: 0 };
      }
      productSales[sale.productName].quantity += sale.quantity;
      productSales[sale.productName].revenue += sale.amount;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setStats({
      totalSales,
      totalExpenses,
      profit: totalSales - totalExpenses,
      salesCount: sales.length,
      topProducts
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reports</h2>

      <div className="flex gap-2">
        {['today', 'week', 'month'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-3 rounded-lg font-semibold ${
              period === p
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Sales</p>
            <Icon name="profit" size={20} className="text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-600">
            {formatAmount(stats.totalSales)}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Icon name="sales" size={12} />
            {stats.salesCount} transactions
          </p>
        </div>

        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <Icon name="expenses" size={20} className="text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-600">
            {formatAmount(stats.totalExpenses)}
          </p>
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Net Profit</p>
            <Icon name="money" size={24} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatAmount(stats.profit)}
          </p>
        </div>
      </div>

      {stats.topProducts.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-lg mb-3">Top Selling Products</h3>
          <div className="space-y-2">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.quantity} sold</p>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="star" size={16} className="text-primary" />
                  <p className="font-bold text-primary">
                    {formatAmount(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
