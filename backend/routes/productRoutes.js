const express = require('express');
const router = express.Router();
const {requireAuth, requireRole} = require('../middleware/auth');

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,

} = require('../controllers/productsController');

//browse products//
router.get('/', requireAuth, getAllProducts);
router.get('/:id' , requireAuth, getProductById);

//admin only//
router.post('/', requireAuth, requireRole('admin'), createProduct);
router.post('/:id', requireAuth, requireRole('admin'), updateProduct);
router.post('/:id', requireAuth, requireRole('admin'), deleteProduct); 
module.exports= router;