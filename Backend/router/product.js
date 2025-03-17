const express = require("express");
const app = express();
const product = require("../controller/product");

// Add Product
app.post("/add", product.addProduct);

// Get All Products
app.get("/get/:userID", product.getAllProducts);

// Debug route - get all products
app.get("/debug/all", async (req, res) => {
  try {
    const allProducts = await require("../models/product").find().lean();
    res.json({
      count: allProducts.length,
      products: allProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Selected Product Item
app.get("/delete/:id", product.deleteSelectedProduct);

// Update Selected Product
app.post("/update", product.updateSelectedProduct);

// Search Product
app.get("/search", product.searchProduct);

// http://localhost:4000/api/product/search?searchTerm=fa

module.exports = app;
