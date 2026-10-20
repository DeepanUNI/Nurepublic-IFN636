const mongoose = require('mongoose');
const CustomerDetails = require('../domain/customerDetails');
const { ValidationError } = require('../errors/AppError');

// Turns the user's cart into orders. Same DEPENDENCY INJECTION approach as CartService.
class CheckoutService {
  #carts;
  #orders;
  #pricing;

  constructor({ cartRepository, orderRepository, pricingStrategy }) {
    this.#carts = cartRepository;
    this.#orders = orderRepository;
    this.#pricing = pricingStrategy;
  }

  async checkout(userId, customerInput) {
    // throws a ValidationError straight away if the delivery details are wrong
    const customer = new CustomerDetails(customerInput);

    const cart = await this.#carts.findByUserWithProducts(userId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Your cart is empty');
    }

    // keep only products that still exist, then skip any the user already owns
    const products = cart.items.map((item) => item.product).filter(Boolean);
    const ownedIds = await this.#orders.findOwnedProductIds(
      userId,
      products.map((product) => product._id)
    );
    const toBuy = products.filter((product) => !ownedIds.has(product._id.toString()));

    if (toBuy.length === 0) {
      await this.#emptyCart(cart);
      throw new ValidationError('Nothing to buy — you already own everything in your cart');
    }

    // one id shared by every order in this checkout, so the admin page can group them
    const checkoutId = new mongoose.Types.ObjectId();
    const orders = await this.#orders.createMany(
      toBuy.map((product) => ({
        user: userId,
        product: product._id,
        pricePaid: product.price,
        checkoutId,
        customer: customer.toObject(),
      }))
    );

    await this.#emptyCart(cart);

    return {
      orders,
      total: this.#pricing.calculateTotal(toBuy),
      customer: customer.toObject(),
      skipped: products.length - toBuy.length,
    };
  }

  async #emptyCart(cart) {
    cart.items = [];
    await this.#carts.save(cart);
  }
}

module.exports = CheckoutService;
