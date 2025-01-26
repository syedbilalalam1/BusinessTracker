const StockHistory = require("../models/stockHistory");
const Product = require("../models/Product");

// Adjust stock levels
const adjustStock = async (req, res) => {
  try {
    const { productId, type, quantity, reason, notes, userId } = req.body;

    // Validate the adjustment
    if (!productId || !type || !quantity || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate new quantity
    let newQuantity;
    if (type === 'add') {
      newQuantity = (product.stock || 0) + parseInt(quantity);
    } else if (type === 'remove') {
      if ((product.stock || 0) < quantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }
      newQuantity = product.stock - parseInt(quantity);
    }

    // Update product quantity
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      { stock: newQuantity },
      { new: true }
    );

    // Create stock history record
    const stockHistory = new StockHistory({
      productId,
      userId,
      type,
      quantity: parseInt(quantity),
      reason,
      notes
    });

    await stockHistory.save();

    res.status(200).json({
      message: "Stock adjusted successfully",
      product: updatedProduct,
      stockHistory
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get stock history for a product
const getStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const history = await StockHistory.find({ productId })
      .populate('productId', 'name manufacturer')  // Populate product details
      .sort({ date: -1 })
      .limit(50); // Limit to last 50 entries

    res.json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const threshold = req.query.threshold || 10; // Default threshold of 10

    const lowStockProducts = await Product.find({
      userID: userId,
      quantity: { $lte: threshold }
    });

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  adjustStock,
  getStockHistory,
  getLowStockAlerts
}; 