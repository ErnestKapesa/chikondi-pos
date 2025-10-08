import { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { PageHeader } from '../components/Typography';
import { analytics } from '../utils/analytics';
import { getAllSales } from '../utils/db';
import { getAllCustomers } from '../utils/customerDb';
import { 
  generateInvoicePDF, 
  createInvoiceFromSale, 
  downloadInvoice, 
  shareInvoice, 
  printInvoice,
  INVOICE_TEMPLATES 
} from '../utils/invoiceGenerator';
import { printHTMLInvoice, shareInvoiceText } from '../utils/simpleInvoice';

export default function Invoices() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [businessInfo, setBusinessInfo] = useState({
    phone: '+265 123 456 789',
    email: 'business@example.com',
    address: 'Your Business Address'
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
    analytics.pageViewed('invoices');
  }, []);

  const loadData = async () => {
    try {
      const [salesData, customersData] = await Promise.all([
        getAllSales(),
        getAllCustomers()
      ]);
      
      setSales(salesData.reverse()); // Most recent first
      setCustomers(customersData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleGenerateInvoice = (sale) => {
    setSelectedSale(sale);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = async () => {
    if (!selectedSale) return;
    
    setGenerating(true);
    try {
      const customer = customers.find(c => c.id === selectedSale.customerId);
      const invoiceData = createInvoiceFromSale(selectedSale, customer, businessInfo);
      
      const success = await downloadInvoice(invoiceData, selectedTemplate);
      if (success) {
        analytics.dataExported('pdf', 'invoice');
        alert('Invoice downloaded successfully!');
      } else {
        alert('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    }
    setGenerating(false);
    setShowInvoiceModal(false);
  };

  const handleShareInvoice = async () => {
    if (!selectedSale) return;
    
    setGenerating(true);
    try {
      const customer = customers.find(c => c.id === selectedSale.customerId);
      const invoiceData = createInvoiceFromSale(selectedSale, customer, businessInfo);
      
      const success = await shareInvoice(invoiceData, selectedTemplate);
      if (success) {
        analytics.dataExported('pdf', 'invoice_shared');
      } else {
        // Fallback to download
        await handleDownloadInvoice();
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
      await handleDownloadInvoice();
    }
    setGenerating(false);
    setShowInvoiceModal(false);
  };

  const handlePrintInvoice = async () => {
    if (!selectedSale) return;
    
    setGenerating(true);
    try {
      const customer = customers.find(c => c.id === selectedSale.customerId);
      const invoiceData = createInvoiceFromSale(selectedSale, customer, businessInfo);
      
      const success = await printInvoice(invoiceData, selectedTemplate);
      if (success) {
        analytics.dataExported('pdf', 'invoice_printed');
      } else {
        alert('Failed to print invoice');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice');
    }
    setGenerating(false);
    setShowInvoiceModal(false);
  };

  const handleSimpleInvoice = async () => {
    if (!selectedSale) return;
    
    setGenerating(true);
    try {
      const customer = customers.find(c => c.id === selectedSale.customerId);
      const invoiceData = createInvoiceFromSale(selectedSale, customer, businessInfo);
      
      const success = printHTMLInvoice(invoiceData, customer);
      if (success) {
        analytics.dataExported('html', 'invoice_simple');
      } else {
        // Fallback to text sharing
        const textSuccess = await shareInvoiceText(invoiceData, customer);
        if (textSuccess) {
          analytics.dataExported('text', 'invoice_text');
        } else {
          alert('Failed to generate invoice');
        }
      }
    } catch (error) {
      console.error('Error generating simple invoice:', error);
      alert('Failed to generate invoice');
    }
    setGenerating(false);
    setShowInvoiceModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat().format(amount || 0);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Walk-in Customer';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Smart Invoices" 
        subtitle="Generate professional PDF invoices for your sales"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary">{sales.length}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {sales.filter(s => s.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
          </div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(sales.reduce((sum, s) => sum + (s.total || 0), 0))}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">PDF</div>
          <div className="text-sm text-gray-600">Offline Ready</div>
        </div>
      </div>

      {/* Business Info Settings */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={businessInfo.phone}
              onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
              className="input-field"
              placeholder="+265 123 456 789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={businessInfo.email}
              onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
              className="input-field"
              placeholder="business@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={businessInfo.address}
              onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
              className="input-field"
              placeholder="Your Business Address"
            />
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Sales</h3>
        
        {sales.length === 0 ? (
          <div className="card text-center py-8">
            <Icon name="receipt" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No sales found</h3>
            <p className="text-gray-500 mb-4">
              Make some sales first to generate invoices
            </p>
          </div>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">Sale #{sale.id}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {sale.paymentMethod || 'Cash'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon name="calendar" size={16} />
                      {formatDate(sale.timestamp)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="customer" size={16} />
                      {getCustomerName(sale.customerId)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="money" size={16} />
                      {formatCurrency(sale.total)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="inventory" size={16} />
                      {sale.items?.length || 0} items
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateInvoice(sale)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Icon name="receipt" size={20} />
                  Generate Invoice
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invoice Generation Modal */}
      {showInvoiceModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Invoice</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Sale Details */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Sale Details</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                  <span>Sale ID:</span>
                  <span>#{selectedSale.id}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Date:</span>
                  <span>{formatDate(selectedSale.timestamp)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Customer:</span>
                  <span>{getCustomerName(selectedSale.customerId)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Invoice Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="input-field"
              >
                {Object.entries(INVOICE_TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadInvoice}
                disabled={generating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Icon name="download" size={20} />
                {generating ? 'Generating...' : 'Generate PDF Invoice'}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShareInvoice}
                  disabled={generating}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Icon name="share" size={20} />
                  Share
                </button>
                <button
                  onClick={handlePrintInvoice}
                  disabled={generating}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Icon name="print" size={20} />
                  Print
                </button>
              </div>

              <button
                onClick={handleSimpleInvoice}
                disabled={generating}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Icon name="receipt" size={20} />
                Simple Invoice (Fallback)
              </button>
            </div>

            {/* Template Preview Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="info" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Professional PDF Invoice</p>
                  <p>Includes your business info, customer details, itemized list, and totals. Works completely offline!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}