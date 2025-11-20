const express = require('express');
const router = express.Router();
const skuController = require('../controllers/skuController');

router.get('/', skuController.getAllSKUs);
router.get('/:id', skuController.getSKUById);
router.post('/', skuController.createSKU);
router.put('/:id', skuController.updateSKU);
router.delete('/:id', skuController.deleteSKU);

module.exports = router;
