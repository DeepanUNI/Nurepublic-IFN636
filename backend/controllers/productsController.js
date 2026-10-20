const Product = require('../models/Product');
const { SortFactory } = require('../patterns/SortFactory');
const { ValidationError } = require('../errors/AppError');


//view all products 
// uses the sort function
exports.getAllProducts = async (req, res) => {
  try {
    const sorter = SortFactory.getSort(req.query.sort || 'newest');   // Factory pattern

    const products = await Product.find(req.searchFilter || {}).sort(sorter.getSortOrder());
    res.status(200).json(products);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.message });  // e.g. unknown sort type
    }
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// FR04: list of categories for the filter dropdown
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json(categories.sort((a, b) => a.localeCompare(b)));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

//view a single product//

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch product',
      error: err.message
    });
  }
};
//add product listing (admin only)

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'title, description, price and category are required' });
    }
    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      createdBy: req.user.id,
    });
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

// update product listing (only admin can do this)//

exports.updateProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            runValidators: true,

        });
        if (!product) return res.status(404).json({ message : 'Product not found'});
        res.status(200).json({ message: 'Product updated', product });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update product', error: err.message });
    } 
 };

 //delete product listing (admin only)//

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete product',
      error: err.message
    });
  }
};

