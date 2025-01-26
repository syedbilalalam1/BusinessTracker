const mongoose = require("mongoose");
const uri = "YOUR MONGODB ATLAS URI";

function main() {
    mongoose.connect(uri).then(() => {
        console.log("Successfully connected to MongoDB Atlas")
    }).catch((err) => {
        console.log("Error connecting to MongoDB Atlas:", err)
    })
}

module.exports = { main };