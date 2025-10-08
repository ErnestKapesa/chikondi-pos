import { useState, useEffect } from 'react';
import { addSale, getAllProducts, updateProduct } from '../utils/db';
import { getAllCustomers } from '../utils/customerDb';
import { useCurrency } from '../contexts/CurrencyContext';
import { Icon } from '../components/Icons';
import { analytics } from '../utils/analytics';
import { createInvoiceFromSale, downloadInvoice } from '../utils/invoiceGenerator';

export default function Sales() {
  const { formatAmount, symbol } = useCurrency();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customAmount, setCustomAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useEffect(() => {
    loadData();
    analytics.pageViewed('sales');
  }, []);

  const loadData = async () => {
    const [allProducts, allCustomers] = await Promise.all([
      getAllProducts(),
      getAllCustomers()
    ]);
    setProducts(allProducts.filter(p => p.quantity > 0));
    setCustomers(allCustomers);
  };

  const handleSale = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    const amount = customAmount ? parseFloat(customAmount) : selectedProduct.price * quantity;

    const saleData = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      customerId: selectedCustomer?.id,
      quantity,
      amount,
      paymentMethod,
      items: [{
        name: selectedProduct.name,
        quantity: quantity,
        price: selectedProduct.price,
        total: amount
      }],
      total: amount,
      timestamp: Date.now()
    };

    const saleId = await addSale(saleData);

    // Update stock
    await updateProduct(selectedProduct.id, {
      quantity: selectedProduct.quantity - quantity
    });

    // Track analytics
    analytics.saleCompleted(amount, paymentMethod, 1);

    // Store last sale for invoice generation
    setLastSale({ ...saleData, id: saleId });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    
    // Reset form
    setSelectedProduct(null);
    setSelectedCustomer(null);
    setQuantity(1);
    setCustomAmount('');
    loadData();
  };

  const handleGenerateInvoice = async () => {
    if (!lastSale) return;
    
    setGeneratingInvoice(true);
    try {
      const invoiceData = createInvoiceFromSale(lastSale, selectedCustomer);
      const success = await downloadInvoice(invoiceData, 'professional');
      
      if (success) {
        analytics.dataExported('pdf', 'invoice_quick');
        alert('Invoice generated successfully!');
      } else {
        alert('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    }
    setGeneratingInvoice(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Record Sale</h2>

      {showSuccess && (
        <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="success" size={24} className="text-green-600" />
            <span className="font-semibold">Sale recorded successfully!</span>
          </div>
          {lastSale && (
            <div className="flex gap-2">
              <button
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              >
                <Icon name="receipt" size={16} />
                {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSale} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Customer (Optional)</label>
          <select
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find(c => c.id === parseInt(e.target.value));
              setSelectedCustomer(customer);
            }}
            className="input-field"
          >
            <option value="">Walk-in Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Product</label>
          <select
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const product = products.find(p => p.id === parseInt(e.target.value));
              setSelectedProduct(product);
            }}
            className="input-field"
            required
          >
            <option value="">Choose a product...</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatAmount(product.price)} ({product.quantity} in stock)
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedProduct.quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (Leave blank for {formatAmount(selectedProduct.price * quantity)})
              </label>
              <input
                type="number"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="input-field"
                placeholder={formatAmount(selectedProduct.price * quantity)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'cash'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <Icon name="cash" size={20} />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'mobile_money'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <Icon name="mobilePayment" size={20} />
                  Mobile Money
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-3">
              <Icon name="sales" size={20} />
              Record Sale - {formatAmount(customAmount || selectedProduct.price * quantity)}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
