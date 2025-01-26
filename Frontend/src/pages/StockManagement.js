import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../AuthContext';

function StockManagement() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'add',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const authContext = useContext(AuthContext);

  // Fetch all products with their current stock levels
  useEffect(() => {
    fetchProducts();
  }, [authContext.user]); // Add dependency on user

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:4000/api/product/get/${authContext.user}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stock history when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      fetchStockHistory(selectedProduct._id);
    }
  }, [selectedProduct]);

  const fetchStockHistory = async (productId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/stock/history/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock history');
      }
      const data = await response.json();
      setStockHistory(data);
    } catch (error) {
      console.error('Error fetching stock history:', error);
      setError('Failed to load stock history. Please try again.');
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/stock/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          type: stockAdjustment.type,
          quantity: parseInt(stockAdjustment.quantity),
          reason: stockAdjustment.reason,
          notes: stockAdjustment.notes,
          userId: authContext.user
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adjust stock');
      }

      // Refresh product data and stock history
      await fetchProducts();
      if (selectedProduct) {
        await fetchStockHistory(selectedProduct._id);
      }
      
      // Reset form
      setStockAdjustment({
        type: 'add',
        quantity: 0,
        reason: '',
        notes: ''
      });

      // Show success message (you could add a toast notification here)
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setError(error.message || 'Failed to adjust stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        <h1 className="text-2xl font-semibold text-gray-800">Stock Management</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product List */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Products</h2>
            {loading && !products.length ? (
              <div className="text-center py-4">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No products found. Please add some products first.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map(product => (
                      <tr 
                        key={product._id}
                        className={`hover:bg-gray-50 ${selectedProduct?._id === product._id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full ${
                            product.quantity <= 10 ? 'bg-red-100 text-red-800' : 
                            product.quantity <= 20 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {product.quantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Manage Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stock Adjustment Form */}
          {selectedProduct && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  Adjust Stock for {selectedProduct.name}
                </h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  × Close
                </button>
              </div>
              
              <form onSubmit={handleStockAdjustment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
                  <select
                    value={stockAdjustment.type}
                    onChange={(e) => setStockAdjustment({...stockAdjustment, type: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={stockAdjustment.quantity}
                    onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <select
                    value={stockAdjustment.reason}
                    onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={loading}
                  >
                    <option value="">Select a reason</option>
                    <option value="purchase">New Purchase</option>
                    <option value="return">Customer Return</option>
                    <option value="damage">Damaged Goods</option>
                    <option value="correction">Stock Correction</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={stockAdjustment.notes}
                    onChange={(e) => setStockAdjustment({...stockAdjustment, notes: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                    placeholder="Add any additional notes here..."
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Adjust Stock'}
                </button>
              </form>

              {/* Stock History */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Stock History</h3>
                <div className="overflow-x-auto">
                  {stockHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No history available</p>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stockHistory.map(history => (
                          <tr key={history._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(history.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                history.type === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {history.type === 'add' ? 'Added' : 'Removed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{history.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{history.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockManagement; 