import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";

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

  const authContext = useContext(AuthContext);
  console.log('====================================');
  console.log(authContext);
  console.log('====================================');

  useEffect(() => {
    fetchProductsData();
    fetchSalesData();
  }, [updatePage]);

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
        // Calculate low stock and out of stock counts
        const lowStock = data.filter(product => product.stock > 0 && product.stock <= 10).length;
        const outOfStock = data.filter(product => product.stock === 0).length;
        setLowStockCount(lowStock);
        setOutOfStockCount(outOfStock);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of Search Products
  const fetchSearchData = () => {
    fetch(`http://localhost:4000/api/product/search?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching all stores data
  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
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
    console.log(`http://localhost:4000/api/product/delete/${id}`);
    fetch(`http://localhost:4000/api/product/delete/${id}`)
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
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-full px-4 lg:w-11/12">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <span className="font-semibold text-lg md:text-xl px-2">Overall Inventory</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
                  Total Items
                </span>
              </div>
            </div>

            {/* Stock Overview Card */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <span className="font-semibold text-yellow-600 text-sm md:text-base">
                Stock Overview
              </span>
              <div className="mt-2">
                <span className="font-semibold text-gray-800 text-xl md:text-2xl">
                  {products.reduce((total, product) => total + (product.stock || 0), 0)}
                </span>
                <span className="block text-gray-500 text-xs mt-1">
                  Total Stock
                </span>
              </div>
            </div>

            {/* Stock Status Card */}
            <div className="bg-purple-50 rounded-lg p-4">
              <span className="font-semibold text-purple-600 text-sm md:text-base">
                Stock Status
              </span>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="font-semibold text-orange-500 text-xl md:text-2xl">
                    {lowStockCount}
                  </span>
                  <span className="block text-gray-500 text-xs mt-1">
                    Low Stock
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-red-500 text-xl md:text-2xl">
                    {outOfStockCount}
                  </span>
                  <span className="block text-gray-500 text-xs mt-1">
                    Out of Stock
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs space-y-1 overflow-auto max-h-20">
                {lowStockCount > 0 && (
                  <div className="text-orange-500">
                    Low Stock: {products.filter(p => p.stock > 0 && p.stock <= 10).map(p => p.name).join(', ')}
                  </div>
                )}
                {outOfStockCount > 0 && (
                  <div className="text-red-500">
                    Out of Stock: {products.filter(p => p.stock === 0).map(p => p.name).join(', ')}
                  </div>
                )}
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
        </div>

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

        {/* Table section */}
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
      </div>
    </div>
  );
}

export default Inventory;
