const Purchase = require("../models/purchase");
const Product = require("../models/product");

const purchaseStock = async (productID, purchaseStockData) => {
  // Updating Purchase stock
  try {
    const myProductData = await Product.findOne({ _id: productID });
    if (!myProductData) {
      console.error("Product not found");
      return;
    }

    // Convert both values to numbers and add them
    const currentStock = Number(myProductData.stock) || 0;
    const addStock = Number(purchaseStockData) || 0;
    const myUpdatedStock = currentStock + addStock;

    const PurchaseStock = await Product.findByIdAndUpdate(
      { _id: productID },
      {
        stock: myUpdatedStock,
      },
      { new: true }
    );
    console.log("Updated stock:", PurchaseStock);
  } catch (error) {
    console.error("Error updating Purchase stock:", error);
  }
};

module.exports = purchaseStock;
