// STRATEGY PATTERN: the rule for working out a total lives in its own class.
// To add GST, a discount or a sale, write a new subclass and pass it in container.js —
// CartService and CheckoutService don't change.
class PricingStrategy {
  // abstract method: subclasses must provide their own version
  calculateTotal(products) {
    throw new Error(`${this.constructor.name} must implement calculateTotal()`);
  }
}

class StandardPricing extends PricingStrategy {
  calculateTotal(products) {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    return Math.round(total * 100) / 100; // round to cents (avoids 0.1 + 0.2 = 0.30000000000000004)
  }
}

module.exports = { PricingStrategy, StandardPricing };
