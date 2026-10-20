const BaseRepository = require('./baseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async userOwnsProduct(userId, productId) {
    const order = await this.findOne({ user: userId, product: productId });
    return Boolean(order);
  }

  // which of these products has the user already bought? (returned as a Set of id strings)
  async findOwnedProductIds(userId, productIds) {
    const owned = await this.find({ user: userId, product: { $in: productIds } });
    return new Set(owned.map((order) => order.product.toString()));
  }

  createMany(orders) {
    return this.model.insertMany(orders);
  }
}

module.exports = OrderRepository;
