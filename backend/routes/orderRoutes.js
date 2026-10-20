const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { purchaseProduct, getMyLibrary, getAllOrders } = require('../controllers/orderController');
const { checkoutController } = require('../container');


router.post('/purchase', requireAuth, purchaseProduct);
router.get('/my-library', requireAuth, getMyLibrary);
router.post('/checkout', requireAuth, checkoutController.checkout);

//admin only//
router.get('/all', requireAuth, requireRole('admin'), getAllOrders);

module.exports = router;
