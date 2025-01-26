const Product = require("../models/product");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");
const mongoose = require("mongoose");

// Add Post
const addProduct = (req, res) => {
  try {
    console.log('========== ADD PRODUCT ==========');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('userID type:', typeof req.body.userID);
    console.log('userID from request:', req.body.userID);
    
    // Convert string userID to ObjectId
    const userID = new mongoose.Types.ObjectId(req.body.userID);
    console.log('Converted userID:', userID);
    console.log('Converted userID type:', typeof userID);
    console.log('Is ObjectId?', userID instanceof mongoose.Types.ObjectId);

    const addProduct = new Product({
      userID: userID,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      stock: req.body.stock || 0,
      price: req.body.price || 0,
      description: req.body.description,
    });

    console.log('Product to be saved:', JSON.stringify(addProduct.toObject(), null, 2));

    addProduct
      .save()
      .then((result) => {
        console.log('Product saved successfully. ID:', result._id);
        console.log('Saved product details:', JSON.stringify(result.toObject(), null, 2));
        console.log('====================================');
        res.status(200).send(result);
      })
      .catch((err) => {
        console.error('Error saving product:', err);
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        console.log('====================================');
        res.status(400).send(err);
      });
  } catch (error) {
    console.error('Error in addProduct:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    console.log('========== GET ALL PRODUCTS ==========');
    console.log('Request params:', JSON.stringify(req.params, null, 2));
    
    if (!req.params.userID) {
      console.log('No userID provided in request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Try both string and ObjectId versions of userID
    const userIDString = req.params.userID;
    const userIDObject = new mongoose.Types.ObjectId(req.params.userID);
    
    console.log('userID string:', userIDString);
    console.log('userID object:', userIDObject);

    const query = {
      $or: [
        { userID: userIDString },  // Try matching string version
        { userID: userIDObject }   // Try matching ObjectId version
      ]
    };
    console.log('Query:', JSON.stringify(query, null, 2));

    // First check if any products exist at all
    const totalProducts = await Product.countDocuments();
    console.log('Total products in database:', totalProducts);

    const findAllProducts = await Product.find(query)
      .sort({ _id: -1 })
      .lean(); // Use lean() for better performance
    
    console.log('Query result:', JSON.stringify(findAllProducts, null, 2));
    console.log('Number of products found:', findAllProducts.length);
    if (findAllProducts.length > 0) {
      console.log('First product:', JSON.stringify(findAllProducts[0], null, 2));
      console.log('First product userID:', findAllProducts[0].userID);
      console.log('First product userID type:', typeof findAllProducts[0].userID);
    }
    console.log('====================================');
    
    res.json(findAllProducts);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  const deleteProduct = await Product.deleteOne(
    { _id: req.params.id }
  );
  const deletePurchaseProduct = await Purchase.deleteOne(
    { ProductID: req.params.id }
  );

  const deleteSaleProduct = await Sales.deleteOne(
    { ProductID: req.params.id }
  );
  res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
};

// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      { _id: req.body.productID },
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
        price: req.body.price || 0,
      },
      { new: true }
    );
    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error");
  }
};

// Search Products
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await Product.find({
    name: { $regex: searchTerm, $options: "i" },
  });
  res.json(products);
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};
