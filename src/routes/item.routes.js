const express = require('express');
const router = express.Router();
const { getAllItems, createItem } = require('../controllers/itemController');

// เส้นทางสำหรับสินค้า
router.get('/', getAllItems);    // GET: /api/items
router.post('/', createItem);   // POST: /api/items

module.exports = router;
