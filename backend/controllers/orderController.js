const Order = require('../models/Order');
const Product = require('../models/Product');

exports.purchaseProduct = async (req, res) => {
    try{
    const {productId} = req.body;
    if (!productId) {
        return res.status(400).json({ message: 'productId is required' });


    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyOwned = await Order.findOne({ user: req.user.id, product: productId }); //to prevent duplicate purchase of the product
    if (alreadyOwned) {
      return res.status(409).json({ message: 'You already own this product' });
    }

    const order = await Order.create({
      user: req.user.id,
      product: productId,
      pricePaid: product.price,
    });

    res.status(201).json({ message: 'Order Purchased successfully ', order });
  } catch (err) {
    res.status(500).json({ message: 'Purchase failed', error: err.message });
  }
};

exports.getMyLibrary = async(req,res) => {
    try{
        const orders = await Order.find({ user: req.user.id})
        .populate('product')
        .sort({ purchasedAt: -1 });
        res.status(200).json(orders);
      } catch (err) {
    res.status(500).json({ message: 'Failed to fetch library', error: err.message });
      }
    };
