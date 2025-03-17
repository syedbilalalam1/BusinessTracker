const mongoose = require("mongoose");
const uri = "YOUR MONGO URI HERE";

async function main() {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
            maxPoolSize: 50,
            retryWrites: true,
        });
        console.log("Successfully connected to MongoDB Atlas");
        
        // Test the connection
        await mongoose.connection.db.admin().ping();
        console.log("Database connection is healthy");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        // If connection fails, retry after 5 seconds
        console.log("Retrying connection in 5 seconds...");
        setTimeout(main, 5000);
    }

    // Handle connection events
    mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(main, 5000);
    });
}

module.exports = { main };