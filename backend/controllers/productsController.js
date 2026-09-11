const Product = require('../models/Product');

//view all products 
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

//view a single product//

exports.getProductById = async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product) return res.ststus(404).json({ message: 'Product not found' });
        res.status(200).json(product);

    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch product', error: err.message });
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
        if (!product) return res.ststus(404).json({ message : 'Product not found'});
        res.status(200).json({ message: 'Product updated', product });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update product', error: err.message });
    } 
 };

 //delete product listing (admin only)//

 exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: ' Product not found'});
        res.status(500).json({ message: 'Failed to update product', error: err.message});

    } catch (err) {
        res.ststus(500).json({ message: 'failed to delet product', errpr:err.message});

    }

 };

