const express = require('express');
const router = express.Router();
const {requireAuth, requireRole} = require('../middleware/auth');
const {validateSearch} = require('../middleware/searchmiddleware')


const {
    getAllProducts,
    getCategories,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,

} = require('../controllers/productsController');

//browse products//
router.get('/', requireAuth, validateSearch, getAllProducts);
router.get('/categories', requireAuth, getCategories); // must stay above '/:id'
router.get('/:id' , requireAuth, getProductById);

//admin only//
router.post('/', requireAuth, requireRole('admin'), createProduct);
router.put('/:id', requireAuth, requireRole('admin'), updateProduct);
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct); 
module.exports= router;