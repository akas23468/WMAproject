const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public or read routes
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);

// Protected routes requiring authentication
router.post('/', verifyToken, itemController.createItem);
router.put('/:id', verifyToken, itemController.updateItem);
router.delete('/:id', verifyToken, itemController.deleteItem);

module.exports = router;
