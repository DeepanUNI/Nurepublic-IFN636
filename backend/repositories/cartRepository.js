const BaseRepository = require('./baseRepository');
const Cart = require('../models/Cart');

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  // every user has exactly one cart; make an empty one the first time it's needed
  async findOrCreateByUser(userId) {
    const cart = await this.findOne({ user: userId });
    return cart || this.create({ user: userId, items: [] });
  }

  findByUserWithProducts(userId) {
    return this.findOne({ user: userId }).populate('items.product');
  }

  // swap each stored product id for the full product document
  populateProducts(cart) {
    return cart.populate('items.product');
  }
}

module.exports = CartRepository;
