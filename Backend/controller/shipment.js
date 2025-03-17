const Shipment = require('../models/shipment');

// Add a new shipment
const addShipment = async (req, res) => {
  try {
    const shipmentData = {
      userID: req.params.userID,
      containerId: req.body.containerId,
      trackingUrl: req.body.trackingUrl,
      expectedDeliveryDate: req.body.expectedDeliveryDate,
      status: req.body.status || 'in-transit',
      description: req.body.description,
      items: req.body.items || []
    };

    const newShipment = new Shipment(shipmentData);
    const savedShipment = await newShipment.save();
    
    res.status(201).json(savedShipment);
  } catch (error) {
    if (error.code === 11000) { // Duplicate containerId
      res.status(400).json({ message: 'Container ID already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Get all shipments for a user
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({ userID: req.params.userID }).sort({ createdAt: -1 });
    res.status(200).json(shipments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single shipment by ID
const getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      userID: req.params.userID
    });
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a shipment
const updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      userID: req.params.userID
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const updates = {
      containerId: req.body.containerId,
      trackingUrl: req.body.trackingUrl,
      expectedDeliveryDate: req.body.expectedDeliveryDate,
      status: req.body.status,
      description: req.body.description,
      items: req.body.items
    };

    const updatedShipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedShipment);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Container ID already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Delete a shipment
const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOneAndDelete({
      _id: req.params.id,
      userID: req.params.userID
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    res.status(200).json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addShipment,
  getShipments,
  getShipmentById,
  updateShipment,
  deleteShipment
}; 