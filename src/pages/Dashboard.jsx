import { useState, useEffect } from 'react';
import { getAllSales, getAllExpenses, getAllProducts } from '../utils/dbUnified';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useCurrency } from '../contexts/CurrencyContext';
import { Icon } from '../components/Icons';

export default function Dashboard() {
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayExpenses: 0,
    todayProfit: 0,
    lowStock: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const today = new Date();
    const startTime = startOfDay(today).getTime();
    const endTime = endOfDay(today).getTime();

    const allSales = await getAllSales();
    const todaySales = allSales.filter(s => s.timestamp >= startTime && s.timestamp <= endTime);
    const totalSales = todaySales.reduce((sum, sale) => sum + sale.amount, 0);

    const allExpenses = await getAllExpenses();
    const todayExpenses = allExpenses.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
    const totalExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const products = await getAllProducts();
    const lowStock = products.filter(p => p.quantity <= (p.lowStockAlert || 5)).length;

    setStats({
      todaySales: totalSales,
      todayExpenses: totalExpenses,
      todayProfit: totalSales - totalExpenses,
      lowStock
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Today's Overview</h2>
      <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Sales</p>
            <Icon name="profit" size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatAmount(stats.todaySales)}
          </p>
        </div>

        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Expenses</p>
            <Icon name="expenses" size={20} className="text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatAmount(stats.todayExpenses)}
          </p>
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Profit</p>
            <Icon name="money" size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatAmount(stats.todayProfit)}
          </p>
        </div>

        <div className="card bg-orange-50 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Low Stock</p>
            <Icon name="lowStock" size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {stats.lowStock} items
          </p>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
        <div className="space-y-3">
          <a href="/sales" className="btn-primary w-full flex items-center justify-center gap-3">
            <Icon name="sales" size={20} />
            Record Sale
          </a>
          <a href="/inventory" className="btn-secondary w-full flex items-center justify-center gap-3">
            <Icon name="inventory" size={20} />
            Manage Stock
          </a>
          <a href="/expenses" className="btn-secondary w-full flex items-center justify-center gap-3">
            <Icon name="expenses" size={20} />
            Add Expense
          </a>
        </div>
      </div>
    </div>
  );
}
