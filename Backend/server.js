const express = require("express");
const { main } = require("./models/index");
const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const stockRoute = require("./router/stock");
const cors = require("cors");
const User = require("./models/users");
const Product = require("./models/Product");
const fs = require('fs');
const path = require('path');
const shipmentRouter = require('./routes/shipment');

const app = express();
main();

// Middleware
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Initialize predefined users
const initializeUsers = async () => {
  try {
    const usersFile = fs.readFileSync(path.join(__dirname, 'config/users.json'));
    const predefinedUsers = JSON.parse(usersFile).users;
    
    // Clear existing users
    await User.deleteMany({});
    
    // Insert predefined users
    await User.insertMany(predefinedUsers);
    console.log('Predefined users initialized');
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Initialize users when server starts
initializeUsers();

// Routes
app.use("/store", storeRoute);
app.use("/product", productRoute);
app.use("/purchase", purchaseRoute);
app.use("/sales", salesRoute);
app.use("/stock", stockRoute);
app.use('/shipment', shipmentRouter);

// Login routes
let userAuthCheck;
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (user) {
      // Ensure consistent user ID format
      const userData = {
        ...user.toObject(),
        _id: user._id.toString() // Convert ObjectId to string consistently
      };
      res.send(userData);
      userAuthCheck = userData;
    } else {
      res.status(401).send("Invalid Credentials");
      userAuthCheck = null;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.get("/login", (req, res) => {
  res.send(userAuthCheck);
});

app.get("/testget", async (req,res)=>{
  const result = await Product.findOne({ _id: '6429979b2e5434138eda1564'})
  res.json(result)
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
