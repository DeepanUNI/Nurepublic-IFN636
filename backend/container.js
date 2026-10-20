// COMPOSITION ROOT: the one place where the cart/checkout objects are created and
// connected. Node caches this module, so the whole app shares a single instance
// of each (SINGLETON).
const CartRepository = require('./repositories/cartRepository');
const ProductRepository = require('./repositories/productRepository');
const OrderRepository = require('./repositories/orderRepository');
const { StandardPricing } = require('./pricing/pricingStrategies');
const CartService = require('./services/cartService');
const CheckoutService = require('./services/checkoutService');
const CartController = require('./controllers/cartController');
const CheckoutController = require('./controllers/checkoutController');

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();
const pricingStrategy = new StandardPricing();

const cartService = new CartService({
  cartRepository,
  productRepository,
  orderRepository,
  pricingStrategy,
});

const checkoutService = new CheckoutService({
  cartRepository,
  orderRepository,
  pricingStrategy,
});

module.exports = {
  cartController: new CartController(cartService),
  checkoutController: new CheckoutController(checkoutService),
};
