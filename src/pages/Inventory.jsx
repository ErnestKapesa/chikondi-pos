import { useState, useEffect } from 'react';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../utils/db';
import { useCurrency } from '../contexts/CurrencyContext';
import { Icon } from '../components/Icons';

export default function Inventory() {
  const { formatAmount, symbol } = useCurrency();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    lowStockAlert: 5
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const allProducts = await getAllProducts();
    setProducts(allProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      lowStockAlert: parseInt(formData.lowStockAlert)
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', quantity: '', lowStockAlert: 5 });
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      lowStockAlert: product.lowStockAlert || 5
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Icon name={showForm ? 'close' : 'add'} size={16} />
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h3 className="font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
          
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            required
          />
          
          <input
            type="number"
            step="0.01"
            placeholder={`Price (${symbol})`}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="input-field"
            required
          />
          
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="input-field"
            required
          />
          
          <input
            type="number"
            placeholder="Low Stock Alert (default: 5)"
            value={formData.lowStockAlert}
            onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
            className="input-field"
          />
          
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Icon name={editingProduct ? 'save' : 'add'} size={20} />
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {products.map(product => (
          <div key={product.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-gray-600">{formatAmount(product.price)}</p>
                <div className={`flex items-center gap-2 font-semibold ${
                  product.quantity <= (product.lowStockAlert || 5)
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  <Icon 
                    name={product.quantity <= (product.lowStockAlert || 5) ? 'lowStock' : 'inStock'} 
                    size={16} 
                  />
                  <span>
                    Stock: {product.quantity}
                    {product.quantity <= (product.lowStockAlert || 5) && ' - Low Stock'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Product"
                >
                  <Icon name="edit" size={20} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Product"
                >
                  <Icon name="delete" size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {products.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No products yet. Add your first product!
          </div>
        )}
      </div>
    </div>
  );
}
