const express = require("express");
const router = express.Router();
const store = require("../controller/store");

// Add Store 
router.post("/add", async (req, res, next) => {
    try {
        await store.addStore(req, res);
    } catch (error) {
        next(error);
    }
});

// Get All Store
router.get("/get/:userID", async (req, res, next) => {
    try {
        await store.getAllStores(req, res);
    } catch (error) {
        next(error);
    }
});

// Error handling middleware specific to store routes
router.use((err, req, res, next) => {
    console.error('Store Route Error:', err);
    res.status(400).json({
        error: err.message,
        details: err
    });
});

module.exports = router;
