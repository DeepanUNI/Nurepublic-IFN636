const BaseController = require('./baseController');

class CheckoutController extends BaseController {
  #checkoutService;

  constructor(checkoutService) {
    super();
    this.#checkoutService = checkoutService;
  }

  // POST /api/orders/checkout — buy everything in my cart   body: { customer: {...} }
  checkout = this.handle(async (req, res) => {
    const result = await this.#checkoutService.checkout(req.user.id, req.body?.customer);
    res.status(201).json({ message: 'Checkout successful', ...result });
  }, 'Checkout failed');
}

module.exports = CheckoutController;
