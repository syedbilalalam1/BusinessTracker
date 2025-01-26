import React, { useState, useEffect, useContext } from "react";
import AddSale from "../components/AddSale";
import AuthContext from "../AuthContext";

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sales, setAllSalesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [stores, setAllStores] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSalesData();
    fetchProductsData();
    fetchStoresData();
  }, [updatePage]);

  // Fetching Data of All Sales
  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/sales/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllSalesData(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of All Stores
  const fetchStoresData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Delete sale
  const deleteSale = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/sales/delete/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Sale deleted successfully');
          setUpdatePage(!updatePage);
        } else {
          alert('Failed to delete sale');
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale');
      }
    }
  };

  // Edit sale
  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setShowEditModal(true);
  };

  // Modal for Sale Add
  const addSaleModalSetting = () => {
    setShowSaleModal(!showSaleModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showSaleModal && (
          <AddSale
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            stores={stores}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
          />
        )}
        {showEditModal && (
          <AddSale
            addSaleModalSetting={() => setShowEditModal(false)}
            products={products}
            stores={stores}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
            editMode={true}
            saleData={selectedSale}
          />
        )}
        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center">
              <span className="font-bold">Sales</span>
              <div className="text-gray-600">
                Total Sales: {sales.length}
              </div>
              <div className="text-gray-600">
                Total Amount: PKR {sales.reduce((sum, sale) => sum + Number(sale.TotalSaleAmount), 0).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={addSaleModalSetting}
              >
                Add Sale
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Product Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Store Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Stock Sold
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Sales Date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Total Sale Amount
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 sticky right-0 bg-white shadow-l">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sales.map((element, index) => {
                return (
                  <tr key={element._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {element.ProductID?.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.StoreID?.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.StockSold}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {new Date(element.SaleDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      PKR {Number(element.TotalSaleAmount).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 sticky right-0 bg-white shadow-l">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(element)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSale(element._id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
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
  );
}

export default Sales;
