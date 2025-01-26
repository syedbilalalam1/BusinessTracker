const Product = require("../models/Product");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");

// Add Post
const addProduct = (req, res) => {
  console.log("req: ", req.body.userId);
  const addProduct = new Product({
    userID: req.body.userId,
    name: req.body.name,
    manufacturer: req.body.manufacturer,
    stock: 0,
    price: req.body.price || 0,
    description: req.body.description,
  });

  addProduct
    .save()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const findAllProducts = await Product.find({ userID: req.params.userId }).sort({ _id: -1 }); // -1 for descending
    res.json(findAllProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(400).json({ error: error.message });
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
