const Sales = require("../models/sales");
const soldStock = require("../controller/soldStock");

// Add Sales
const addSales = (req, res) => {
  const addSale = new Sales({
    userID: req.body.userID,
    ProductID: req.body.productID,
    StoreID: req.body.storeID,
    StockSold: req.body.stockSold,
    SaleDate: req.body.saleDate,
    TotalSaleAmount: req.body.totalSaleAmount,
  });

  addSale
    .save()
    .then((result) => {
      soldStock(req.body.productID, req.body.stockSold);
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

// Get All Sales Data
const getSalesData = async (req, res) => {
  const findAllSalesData = await Sales.find()
    .sort({ _id: -1 })
    .populate("ProductID")
    .populate("StoreID"); // -1 for descending order
  res.json(findAllSalesData);
};

// Get total sales amount
const getTotalSalesAmount = async(req,res) => {
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
    
    const salesData = await Sales.find({
      SaleDate: {
        $gte: startDate,
        $lte: endDate + 'T23:59:59.999Z'
      }
    });
    
    let totalSaleAmount = 0;
    salesData.forEach((sale) => {
      totalSaleAmount += sale.TotalSaleAmount || 0;
    });
    
    res.json({ totalSaleAmount });
  } catch (error) {
    console.error('Error calculating total sales:', error);
    res.status(400).json({ error: error.message });
  }
}

const getMonthlySales = async (req, res) => {
  try {
    const sales = await Sales.find();

    // Initialize array with 12 zeros
    const salesAmount = [];
    salesAmount.length = 12;
    salesAmount.fill(0)

    sales.forEach((sale) => {
      const monthIndex = parseInt(sale.SaleDate.split("-")[1]) - 1;

      salesAmount[monthIndex] += sale.TotalSaleAmount;
    });

    res.status(200).json({ salesAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteSale = async (req, res) => {
  try {
    const result = await Sales.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: "Error deleting sale" });
  }
};

const updateSale = async (req, res) => {
  try {
    const updatedSale = await Sales.findByIdAndUpdate(
      req.params.id,
      {
        ProductID: req.body.productID,
        StoreID: req.body.storeID,
        StockSold: req.body.stockSold,
        SaleDate: req.body.saleDate,
        TotalSaleAmount: req.body.totalSaleAmount,
      },
      { new: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.status(200).json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: "Error updating sale" });
  }
};

module.exports = { addSales, getMonthlySales, getSalesData, getTotalSalesAmount, deleteSale, updateSale };
