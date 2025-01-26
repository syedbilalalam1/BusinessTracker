import React, { useState, useEffect, useContext } from "react";
import AddPurchaseDetails from "../components/AddPurchaseDetails";
import AuthContext from "../AuthContext";
import config from '../config';

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [purchase, setAllPurchaseData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchPurchaseData();
    fetchProductsData();
  }, [updatePage]);

  // Fetching Data of All Purchase items
  const fetchPurchaseData = () => {
    fetch(`${config.apiUrl}/purchase/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllPurchaseData(data);
      })
      .catch((err) => console.error('Error fetching purchases:', err));
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`${config.apiUrl}/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.error('Error fetching products:', err));
  };

  // Delete purchase
  const deletePurchase = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const response = await fetch(`${config.apiUrl}/purchase/delete/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Purchase deleted successfully');
          setUpdatePage(!updatePage);
        } else {
          alert('Failed to delete purchase');
        }
      } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Error deleting purchase');
      }
    }
  };

  // Edit purchase
  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setShowEditModal(true);
  };

  // Modal for Purchase Add
  const addPurchaseModalSetting = () => {
    setPurchaseModal(!showPurchaseModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={addPurchaseModalSetting}
            products={products}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showEditModal && (
          <AddPurchaseDetails
            addSaleModalSetting={() => setShowEditModal(false)}
            products={products}
            handlePageUpdate={handlePageUpdate}
            editMode={true}
            purchaseData={selectedPurchase}
          />
        )}
        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center">
              <span className="font-bold">Purchase Details</span>
              <div className="text-gray-600">
                Total Purchases: {purchase.length}
              </div>
              <div className="text-gray-600">
                Total Amount: PKR {purchase.reduce((sum, item) => sum + Number(item.TotalPurchaseAmount), 0).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={addPurchaseModalSetting}
              >
                Add Purchase
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
                  Quantity Purchased
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Purchase Date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Total Purchase Amount
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 sticky right-0 bg-white shadow-l">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {purchase.map((element, index) => {
                return (
                  <tr key={element._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {element.ProductID?.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.QuantityPurchased}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {new Date(element.PurchaseDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      PKR {Number(element.TotalPurchaseAmount).toLocaleString()}
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
                          onClick={() => deletePurchase(element._id)}
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

export default PurchaseDetails;
