import { useState, useEffect } from 'react';
import { addSale, getAllProducts, updateProduct } from '../utils/db';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Sales() {
  const { formatAmount, symbol } = useCurrency();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customAmount, setCustomAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const allProducts = await getAllProducts();
    setProducts(allProducts.filter(p => p.quantity > 0));
  };

  const handleSale = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    const amount = customAmount ? parseFloat(customAmount) : selectedProduct.price * quantity;

    await addSale({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      amount,
      paymentMethod
    });

    // Update stock
    await updateProduct(selectedProduct.id, {
      quantity: selectedProduct.quantity - quantity
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    // Reset form
    setSelectedProduct(null);
    setQuantity(1);
    setCustomAmount('');
    loadProducts();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Record Sale</h2>

      {showSuccess && (
        <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-lg">
          ✅ Sale recorded successfully!
        </div>
      )}

      <form onSubmit={handleSale} className="space-y-4">
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
                  className={`py-4 rounded-lg font-semibold ${
                    paymentMethod === 'cash'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`py-4 rounded-lg font-semibold ${
                    paymentMethod === 'mobile_money'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  📱 Mobile Money
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Record Sale - {formatAmount(customAmount || selectedProduct.price * quantity)}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
