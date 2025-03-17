import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";
import config from '../config';

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const authContext = useContext(AuthContext);
  console.log('====================================');
  console.log(authContext);
  console.log('====================================');

  useEffect(() => {
    if (authContext.user) {
      fetchProductsData();
      fetchSalesData();
    }
  }, [updatePage, authContext.user]);

  // Fetching Data of All Products with retry mechanism
  const fetchProductsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!authContext.user) {
        throw new Error('User ID is not available');
      }

      console.log('Fetching products for user:', authContext.user);
      const response = await fetch(`${config.apiUrl}/product/get/${authContext.user}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Products data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch products: ${response.statusText}`);
      }
      
      // Validate data
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
      
      setAllProducts(data);
      
      // Calculate low stock and out of stock counts
      const lowStock = data.filter(product => product.stock > 0 && product.stock <= 10).length;
      const outOfStock = data.filter(product => product.stock === 0).length;
      setLowStockCount(lowStock);
      setOutOfStockCount(outOfStock);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products. Please try again.');
      
      // Implement retry logic
      if (retryCount < 3) {
        console.log(`Retrying... Attempt ${retryCount + 1}/3`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchProductsData();
        }, 1000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetching Data of Search Products
  const fetchSearchData = () => {
    fetch(`${config.apiUrl}/product/search?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching all stores data
  const fetchSalesData = () => {
    fetch(`${config.apiUrl}/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Modal for Product ADD
  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  // Modal for Product UPDATE
  const updateProductModalSetting = (selectedProductData) => {
    console.log("Clicked: edit");
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };


  // Delete item
  const deleteItem = (id) => {
    console.log("Product ID: ", id);
    console.log(`${config.apiUrl}/product/delete/${id}`);
    fetch(`${config.apiUrl}/product/delete/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUpdatePage(!updatePage);
      });
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  // Handle Search Term
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
    fetchSearchData();
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {/* Header Section */}
        <div className="flex justify-between">
          <span className="font-bold">Inventory Management</span>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
            onClick={addProductModalSetting}
          >
            Add Product
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => {
                setError(null);
                setRetryCount(0);
                fetchProductsData();
              }}
            >
              <span className="text-red-500 hover:text-red-700">Retry</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Products Card */}
            <div className="bg-blue-50 rounded-lg p-4">
              <span className="font-semibold text-blue-600 text-sm md:text-base">
                Total Products
              </span>
              <div className="mt-2">
                <span className="font-semibold text-gray-800 text-xl md:text-2xl">
                  {products.length}
                </span>
                <span className="block text-gray-500 text-xs mt-1">
                  Items in inventory
                </span>
              </div>
            </div>

            {/* Low Stock Card */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <span className="font-semibold text-yellow-600 text-sm md:text-base">
                Low Stock
              </span>
              <div className="mt-2">
                <span className="font-semibold text-gray-800 text-xl md:text-2xl">
                  {lowStockCount}
                </span>
                <span className="block text-gray-500 text-xs mt-1">
                  Products below threshold
                </span>
              </div>
            </div>

            {/* Out of Stock Card */}
            <div className="bg-red-50 rounded-lg p-4">
              <span className="font-semibold text-red-600 text-sm md:text-base">
                Out of Stock
              </span>
              <div className="mt-2">
                <span className="font-semibold text-gray-800 text-xl md:text-2xl">
                  {outOfStockCount}
                </span>
                <span className="block text-gray-500 text-xs mt-1">
                  Products need restock
                </span>
              </div>
            </div>

            {/* Stock Value Card */}
            <div className="bg-green-50 rounded-lg p-4">
              <span className="font-semibold text-green-600 text-sm md:text-base">
                Stock Value
              </span>
              <div className="mt-2">
                <span className="font-semibold text-gray-800 text-xl md:text-2xl">
                  PKR {products.reduce((total, product) => total + ((product.stock || 0) * (product.price || 0)), 0).toLocaleString()}
                </span>
                <span className="block text-gray-500 text-xs mt-1">
                  Total Value
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Product Table */}
        {!loading && !error && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between p-4 gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <span className="font-bold text-lg">Products</span>
                <div className="flex items-center px-3 py-2 border rounded-lg w-full sm:w-auto">
                  <img
                    alt="search-icon"
                    className="w-5 h-5 mr-2"
                    src={require("../assets/search-icon.png")}
                  />
                  <input
                    className="outline-none text-sm w-full"
                    type="text"
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={handleSearchTerm}
                  />
                </div>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm w-full sm:w-auto"
                onClick={addProductModalSetting}
              >
                Add Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manufacturer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((element) => {
                    const stockStatus = element.stock === 0 ? 'Out of Stock' : 
                                      element.stock <= 10 ? 'Low Stock' : 'In Stock';
                    const statusColor = element.stock === 0 ? 'text-red-500' : 
                                      element.stock <= 10 ? 'text-orange-500' : 'text-green-500';
                    
                    return (
                      <tr key={element._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {element.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {element.manufacturer}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {element.stock}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          PKR {Number(element.price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          PKR {Number(element.stock * element.price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {element.description}
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium ${statusColor}`}>
                          {stockStatus}
                        </td>
                        <td className="px-4 py-3 text-sm sticky right-0 bg-white">
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
                              onClick={() => updateProductModalSetting(element)}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                              onClick={() => deleteItem(element._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showProductModal && (
          <AddProduct
            addProductModalSetting={addProductModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showUpdateModal && (
          <UpdateProduct
            updateProductData={updateProduct}
            updateModalSetting={updateProductModalSetting}
          />
        )}
      </div>
    </div>
  );
}

export default Inventory;
