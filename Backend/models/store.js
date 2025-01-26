const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      alias: 'userId'
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
      default: ""
    },
  },
  { 
    timestamps: true,
    strict: true 
  }
);

const Store = mongoose.model("store", StoreSchema);
module.exports = Store;
