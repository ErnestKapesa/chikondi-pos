import { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { PageHeader } from '../components/Typography';
import { 
  getAllCustomers, 
  searchCustomers, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerStats,
  getCustomersBySegment 
} from '../utils/customerDb';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    tags: []
  });

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, selectedSegment]);

  const loadCustomers = async () => {
    try {
      const customerData = await getAllCustomers();
      setCustomers(customerData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading customers:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getCustomerStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterCustomers = async () => {
    try {
      let filtered = customers;

      // Apply segment filter
      if (selectedSegment !== 'all') {
        filtered = await getCustomersBySegment(selectedSegment);
      }

      // Apply search filter
      if (searchQuery) {
        filtered = await searchCustomers(searchQuery);
        if (selectedSegment !== 'all') {
          const segmentCustomers = await getCustomersBySegment(selectedSegment);
          const segmentIds = new Set(segmentCustomers.map(c => c.id));
          filtered = filtered.filter(c => segmentIds.has(c.id));
        }
      }

      setFilteredCustomers(filtered);
    } catch (error) {
      console.error('Error filtering customers:', error);
      setFilteredCustomers(customers);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await addCustomer(formData);
      setShowAddForm(false);
      resetForm();
      loadCustomers();
      loadStats();
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Failed to add customer');
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      await updateCustomer(editingCustomer.id, formData);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
      loadStats();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        await deleteCustomer(customer.id);
        loadCustomers();
        loadStats();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
      }
    }
  };

  const startEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
      tags: customer.tags || []
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      tags: []
    });
    setEditingCustomer(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat().format(amount || 0);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getCustomerSegmentBadge = (customer) => {
    const totalPurchases = customer.totalPurchases || 0;
    const totalTransactions = customer.totalTransactions || 0;
    
    if (totalPurchases > 50000) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">VIP</span>;
    } else if (totalTransactions >= 5) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Regular</span>;
    } else {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">New</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customer Management" 
        subtitle="Manage your customer relationships and loyalty"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalCustomers}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
            <div className="text-sm text-gray-600">Active (30 days)</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageCustomerValue)}</div>
            <div className="text-sm text-gray-600">Avg Customer Value</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.customerRetentionRate}%</div>
            <div className="text-sm text-gray-600">Retention Rate</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="input-field"
            >
              <option value="all">All Customers</option>
              <option value="vip">VIP Customers</option>
              <option value="regular">Regular Customers</option>
              <option value="new">New Customers</option>
              <option value="inactive">Inactive Customers</option>
            </select>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Icon name="addCustomer" size={20} />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="card text-center py-8">
            <Icon name="customers" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedSegment !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start building your customer base by adding your first customer'
              }
            </p>
            {!searchQuery && selectedSegment === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Customer
              </button>
            )}
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    {getCustomerSegmentBadge(customer)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon name="phone" size={16} />
                      {customer.phone || 'No phone'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="money" size={16} />
                      Total: {formatCurrency(customer.totalPurchases)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="calendar" size={16} />
                      Last visit: {customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'}
                    </div>
                  </div>

                  {customer.loyaltyPoints > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        <Icon name="star" size={12} />
                        {customer.loyaltyPoints} loyalty points
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Icon name="edit" size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Icon name="delete" size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                  placeholder="+265 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field"
                  placeholder="Customer address"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                  placeholder="Additional notes about the customer"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}