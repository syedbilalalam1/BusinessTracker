const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  containerId: {
    type: String,
    required: true,
    unique: true
  },
  trackingUrl: {
    type: String,
    required: true
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['in-transit', 'delivered', 'delayed'],
    default: 'in-transit'
  },
  description: {
    type: String,
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
shipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema); 