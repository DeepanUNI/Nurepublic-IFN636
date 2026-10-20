const { ValidationError, NotFoundError, ConflictError } = require('../errors/AppError');

// SERVICE LAYER: the cart's business rules, with no Express (req/res) and no Mongoose here.
// DEPENDENCY INJECTION: the repositories and pricing strategy are passed in through the
// constructor (see container.js), so they can be swapped — e.g. for fakes in unit tests.
class CartService {
  #carts;
  #products;
  #orders;
  #pricing;

  constructor({ cartRepository, productRepository, orderRepository, pricingStrategy }) {
    this.#carts = cartRepository;
    this.#products = productRepository;
    this.#orders = orderRepository;
    this.#pricing = pricingStrategy;
  }

  async getCart(userId) {
    const cart = await this.#carts.findOrCreateByUser(userId);
    return this.#summarise(cart);
  }

  async addItem(userId, productId) {
    if (!productId) throw new ValidationError('productId is required');

    const product = await this.#products.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    if (await this.#orders.userOwnsProduct(userId, product._id)) {
      throw new ConflictError('You already own this product');
    }

    const cart = await this.#carts.findOrCreateByUser(userId);
    if (this.#contains(cart, product._id)) {
      throw new ConflictError('This product is already in your cart');
    }

    cart.items.push({ product: product._id });
    await this.#carts.save(cart);
    return this.#summarise(cart);
  }

  async removeItem(userId, productId) {
    const cart = await this.#carts.findOrCreateByUser(userId);
    if (!this.#contains(cart, productId)) {
      throw new NotFoundError('Product is not in your cart');
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== String(productId));
    await this.#carts.save(cart);
    return this.#summarise(cart);
  }

  async clear(userId) {
    const cart = await this.#carts.findOrCreateByUser(userId);
    cart.items = [];
    await this.#carts.save(cart);
    return this.#summarise(cart);
  }

  // ---- private helpers (ENCAPSULATION: only this class can call them) ----

  #contains(cart, productId) {
    return cart.items.some((item) => item.product.toString() === String(productId));
  }

  // the shape every cart endpoint returns: { items, total }
  async #summarise(cart) {
    await this.#carts.populateProducts(cart);
    const items = cart.items.filter((item) => item.product); // hide products an admin deleted
    const total = this.#pricing.calculateTotal(items.map((item) => item.product));
    return { items, total };
  }
}

module.exports = CartService;
