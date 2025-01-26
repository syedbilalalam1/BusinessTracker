const express = require('express');
const router = express.Router();
const shipmentController = require('../controller/shipment');

// Add a new shipment
router.post('/add/:userID', shipmentController.addShipment);

// Get all shipments for a user
router.get('/all/:userID', shipmentController.getShipments);

// Get a single shipment by ID
router.get('/:id/:userID', shipmentController.getShipmentById);

// Update a shipment
router.put('/update/:id/:userID', shipmentController.updateShipment);

// Delete a shipment
router.delete('/delete/:id/:userID', shipmentController.deleteShipment);

module.exports = router; 