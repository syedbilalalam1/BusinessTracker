import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../AuthContext';
import AddShipmentModal from '../components/AddShipmentModal';

function ShipmentTracker() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShipment, setNewShipment] = useState({
    containerId: '',
    trackingUrl: '',
    expectedDeliveryDate: '',
    status: 'in-transit',
    description: '',
    items: []
  });

  const authContext = useContext(AuthContext);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shipment/all/${authContext.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      const data = await response.json();
      setShipments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [authContext.user.id]);

  const handleAddShipment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/shipment/add/${authContext.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShipment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add shipment');
      }

      await fetchShipments();
      setNewShipment({
        containerId: '',
        trackingUrl: '',
        expectedDeliveryDate: '',
        status: 'in-transit',
        description: '',
        items: []
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShipment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/shipment/delete/${id}/${authContext.user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete shipment');
      }

      await fetchShipments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="col-span-12 lg:col-span-10 flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="col-span-12 lg:col-span-10 flex justify-center items-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    </div>
  );

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Shipment Tracker</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
              Add Shipment
            </button>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Container ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No shipments found
                    </td>
                  </tr>
                ) : (
                  shipments.map((shipment) => (
                    <tr key={shipment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer">
                          {shipment.containerId}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shipment.expectedDeliveryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {shipment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          View Details
                        </button>
                        <button 
                          onClick={() => handleDeleteShipment(shipment._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddShipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddShipment}
        shipment={newShipment}
        setShipment={setNewShipment}
      />
    </div>
  );
}

export default ShipmentTracker; 