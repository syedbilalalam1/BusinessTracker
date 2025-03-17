const Purchase = require("../models/purchase");
const purchaseStock = require("./purchaseStock");

// Add Purchase Details
const addPurchase = (req, res) => {
  const addPurchaseDetails = new Purchase({
    userID: req.body.userID,
    ProductID: req.body.productID,
    QuantityPurchased: req.body.quantityPurchased,
    PurchaseDate: req.body.purchaseDate,
    TotalPurchaseAmount: req.body.totalPurchaseAmount,
  });

  addPurchaseDetails
    .save()
    .then((result) => {
      purchaseStock(req.body.productID, req.body.quantityPurchased);
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

// Get All Purchase Data
const getPurchaseData = async (req, res) => {
  const findAllPurchaseData = await Purchase.find()
    .sort({ _id: -1 })
    .populate("ProductID"); // -1 for descending order
  res.json(findAllPurchaseData);
};

// Get total purchase amount
const getTotalPurchaseAmount = async (req, res) => {
  try {
    const period = req.query.period || 'month';
    
    let startDate = new Date();
    let endDate = new Date();
    
    // Set time range based on period
    switch(period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1); // Start of current month
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0); // End of current month
        break;
      case 'year':
        startDate = new Date(startDate.getFullYear(), 0, 1); // Start of current year
        endDate = new Date(endDate.getFullYear(), 11, 31); // End of current year
        break;
      default:
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1); // Default to current month
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    }

    // Convert dates to ISO string format for MongoDB query
    startDate = startDate.toISOString().split('T')[0];
    endDate = endDate.toISOString().split('T')[0];
    
    const purchaseData = await Purchase.find({
      PurchaseDate: {
        $gte: startDate,
        $lte: endDate + 'T23:59:59.999Z'
      }
    });
    
    let totalPurchaseAmount = 0;
    purchaseData.forEach((purchase) => {
      totalPurchaseAmount += purchase.TotalPurchaseAmount || 0;
    });
    
    res.json({ totalPurchaseAmount });
  } catch (error) {
    console.error('Error calculating total purchases:', error);
    res.status(400).json({ error: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const result = await Purchase.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ error: "Error deleting purchase" });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        ProductID: req.body.productID,
        QuantityPurchased: req.body.quantityPurchased,
        PurchaseDate: req.body.purchaseDate,
        TotalPurchaseAmount: req.body.totalPurchaseAmount,
      },
      { new: true }
    );

    if (!updatedPurchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ error: "Error updating purchase" });
  }
};

module.exports = { addPurchase, getPurchaseData, getTotalPurchaseAmount, deletePurchase, updatePurchase };
