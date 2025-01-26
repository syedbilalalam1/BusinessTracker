const express = require("express");
const router = express.Router();
const stock = require("../controller/stock");

// Stock adjustment routes
router.post("/adjust", stock.adjustStock);
router.get("/history/:productId", stock.getStockHistory);
router.get("/low-stock/:userId", stock.getLowStockAlerts);

module.exports = router; 