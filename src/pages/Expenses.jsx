import { useState, useEffect } from 'react';
import { addExpense, getAllExpenses } from '../utils/db';
import { format } from 'date-fns';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'stock'
  });

  const categories = [
    { value: 'stock', label: 'Stock Purchase' },
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'transport', label: 'Transport' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const allExpenses = await getAllExpenses();
    setExpenses(allExpenses.reverse());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await addExpense({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category
    });

    setFormData({ description: '', amount: '', category: 'stock' });
    setShowForm(false);
    loadExpenses();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          {showForm ? '✕ Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h3 className="font-bold">New Expense</h3>
          
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            required
          />
          
          <input
            type="number"
            step="0.01"
            placeholder="Amount (MWK)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="input-field"
            required
          />
          
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-field"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          <button type="submit" className="btn-primary w-full">
            Add Expense
          </button>
        </form>
      )}

      <div className="space-y-3">
        {expenses.map(expense => (
          <div key={expense.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{expense.description}</h3>
                <p className="text-sm text-gray-600">
                  {categories.find(c => c.value === expense.category)?.label}
                </p>
                <p className="text-xs text-gray-500">
                  {format(expense.timestamp, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <p className="text-lg font-bold text-red-600">
                -MWK {expense.amount.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        
        {expenses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No expenses recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
