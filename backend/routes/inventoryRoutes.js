const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Inventory routes
router.get('/', inventoryController.getAllInventory);
router.get('/:sku_id', inventoryController.getInventoryBySKU);
router.put('/:sku_id', inventoryController.updateInventory);

// Stock movements
router.post('/movements', inventoryController.addStockMovement);
router.get('/movements/list', inventoryController.getStockMovements);

// Batches
router.get('/batches/list', inventoryController.getBatches);
router.post('/batches', inventoryController.createBatch);

// Stock alerts
router.get('/alerts/list', inventoryController.getStockAlerts);
router.put('/alerts/:id/resolve', inventoryController.resolveStockAlert);

module.exports = router;
