const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { purchaseProduct, getLibrary, getMyLibrary } = require('../controllers/orderController');

router.post('/purchase', requireAuth, purchaseProduct);
router.get('/my-library', requireAuth, getMyLibrary);

module.exports = router;