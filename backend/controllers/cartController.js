const BaseController = require('./baseController');

// HTTP layer for the cart: reads the request, calls CartService, sends the response.
// No business rules live here — they're all in CartService.
class CartController extends BaseController {
  #cartService;

  constructor(cartService) {
    super();
    this.#cartService = cartService;
  }

  // GET /api/cart — view my cart
  getCart = this.handle(async (req, res) => {
    const cart = await this.#cartService.getCart(req.user.id);
    res.status(200).json(cart);
  }, 'Failed to load cart');

  // POST /api/cart — add a product   body: { productId }
  addToCart = this.handle(async (req, res) => {
    const cart = await this.#cartService.addItem(req.user.id, req.body?.productId);
    res.status(201).json({ message: 'Added to cart', ...cart });
  }, 'Failed to add to cart');

  // DELETE /api/cart/:productId — remove one product
  removeFromCart = this.handle(async (req, res) => {
    const cart = await this.#cartService.removeItem(req.user.id, req.params.productId);
    res.status(200).json({ message: 'Removed from cart', ...cart });
  }, 'Failed to remove from cart');

  // DELETE /api/cart — empty my cart
  clearCart = this.handle(async (req, res) => {
    const cart = await this.#cartService.clear(req.user.id);
    res.status(200).json({ message: 'Cart cleared', ...cart });
  }, 'Failed to clear cart');
}

module.exports = CartController;
