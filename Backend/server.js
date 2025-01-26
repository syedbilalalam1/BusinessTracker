const express = require("express");
const { main } = require("./models/index");
const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const stockRoute = require("./router/stock");
const cors = require("cors");
const User = require("./models/users");
const Product = require("./models/product");
const fs = require('fs');
const path = require('path');
const shipmentRouter = require('./routes/shipment');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 4000;

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
    console.log('Checking/initializing users...');
    const usersFile = fs.readFileSync(path.join(__dirname, 'config/users.json'));
    const predefinedUsers = JSON.parse(usersFile).users;
    
    // Check existing users
    const existingUsers = await User.find({});
    console.log('Existing users:', existingUsers.length);
    
    // Only add predefined users if they don't exist
    for (const user of predefinedUsers) {
      const exists = await User.findOne({ email: user.email });
      if (!exists) {
        console.log('Adding predefined user:', user.email);
        await User.create(user);
      } else {
        console.log('User already exists:', user.email);
      }
    }
    
    console.log('Users initialization complete');
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Initialize users when server starts
initializeUsers();

// Login routes
let userAuthCheck;
router.post("/login", async (req, res) => {
  try {
    console.log('Login attempt with:', {
      email: req.body.email,
      password: '***' // Don't log actual password
    });

    // First check if user exists
    const user = await User.findOne({ email: req.body.email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with this email');
      res.status(401).send("Invalid Credentials");
      userAuthCheck = null;
      return;
    }

    // Then check password
    if (user.password !== req.body.password) {
      console.log('Password mismatch');
      res.status(401).send("Invalid Credentials");
      userAuthCheck = null;
      return;
    }

    // Success case
    const userData = {
      ...user.toObject(),
      _id: user._id.toString()
    };
    console.log('Login successful for user:', userData.email);
    res.send(userData);
    userAuthCheck = userData;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send(error);
  }
});

router.get("/login", (req, res) => {
  res.send(userAuthCheck);
});

router.get("/testget", async (req,res)=>{
  const result = await Product.findOne({ _id: '6429979b2e5434138eda1564'})
  res.json(result)
});

// Routes
app.use("/api", router);
app.use("/api/store", storeRoute);
app.use("/api/product", productRoute);
app.use("/api/purchase", purchaseRoute);
app.use("/api/sales", salesRoute);
app.use("/api/stock", stockRoute);
app.use('/api/shipment', shipmentRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../Frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
  });
}

// Start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}

module.exports = app;
