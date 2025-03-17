const Store = require("../models/store");
const mongoose = require("mongoose");

// Add Store
const addStore = async (req, res) => {
    try {
        console.log("Received store data:", req.body);
        
        // Create store with default empty image if not provided
        const storeData = {
            userID: req.body.userId,
            name: req.body.name,
            category: req.body.category,
            address: req.body.address,
            city: req.body.city,
            image: req.body.image || ""
        };

        const store = new Store(storeData);
        const savedStore = await store.save();
        
        console.log("Store saved successfully:", savedStore);
        res.status(200).json(savedStore);
    } catch (err) {
        console.error("Error saving store:", err);
        // Always use 400 for validation errors, not 402
        res.status(400).json({ 
            error: err.message,
            details: err
        });
    }
};

// Get All Stores
const getAllStores = async (req, res) => {
    try {
        const findAllStores = await Store.find().sort({ _id: -1 });
        res.json(findAllStores);
    } catch (err) {
        console.error("Error getting stores:", err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = { addStore, getAllStores };
