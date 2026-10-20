const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { cartController } = require('../container');

router.get('/', requireAuth, cartController.getCart);
router.post('/', requireAuth, cartController.addToCart);
router.delete('/', requireAuth, cartController.clearCart);
router.delete('/:productId', requireAuth, cartController.removeFromCart);

module.exports = router;
