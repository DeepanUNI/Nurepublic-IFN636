const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const CartService = require('../services/cartService');
const { StandardPricing } = require('../pricing/pricingStrategies');
const { ValidationError, NotFoundError, ConflictError } = require('../errors/AppError');

const id = () => new mongoose.Types.ObjectId();

// builds a CartService with fake repositories (no database needed)
function setup({ product = null, owned = false, cartItems = [] } = {}) {
  const cart = { items: cartItems.map((p) => ({ product: p })) };
  const cartRepository = {
    findOrCreateByUser: sinon.stub().resolves(cart),
    save: sinon.stub().resolves(cart),
    populateProducts: sinon.stub().callsFake(async (c) => {
      c.items = c.items.map((i) => ({ product: { _id: i.product, price: 10, title: 'X' } }));
    }),
  };
  const productRepository = { findById: sinon.stub().resolves(product) };
  const orderRepository = { userOwnsProduct: sinon.stub().resolves(owned) };
  const service = new CartService({
    cartRepository, productRepository, orderRepository, pricingStrategy: new StandardPricing(),
  });
  return { service, cart, cartRepository };
}

describe('CartService (FR01 cart)', () => {
  it('adds a product to the cart and returns the total', async () => {
    const productId = id();
    const { service, cartRepository } = setup({ product: { _id: productId, price: 10 } });
    const result = await service.addItem('user1', productId.toString());
    expect(cartRepository.save.calledOnce).to.equal(true);
    expect(result.items).to.have.length(1);
    expect(result.total).to.equal(10);
  });

  it('requires a productId', async () => {
    const { service } = setup();
    await service.addItem('user1').then(() => { throw new Error('should fail'); }, (err) => {
      expect(err).to.be.instanceOf(ValidationError);
    });
  });

  it('rejects a product that does not exist', async () => {
    const { service } = setup({ product: null });
    await service.addItem('user1', id().toString()).then(() => { throw new Error('should fail'); }, (err) => {
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  it('rejects a product the user already owns', async () => {
    const productId = id();
    const { service } = setup({ product: { _id: productId, price: 10 }, owned: true });
    await service.addItem('user1', productId.toString()).then(() => { throw new Error('should fail'); }, (err) => {
      expect(err).to.be.instanceOf(ConflictError);
      expect(err.message).to.equal('You already own this product');
    });
  });

  it('rejects a duplicate in the cart', async () => {
    const productId = id();
    const { service } = setup({ product: { _id: productId, price: 10 }, cartItems: [productId] });
    await service.addItem('user1', productId.toString()).then(() => { throw new Error('should fail'); }, (err) => {
      expect(err).to.be.instanceOf(ConflictError);
    });
  });

  it('removes a product from the cart', async () => {
    const productId = id();
    const { service } = setup({ cartItems: [productId] });
    const result = await service.removeItem('user1', productId.toString());
    expect(result.items).to.have.length(0);
    expect(result.total).to.equal(0);
  });

  it('clears the cart', async () => {
    const { service } = setup({ cartItems: [id(), id()] });
    const result = await service.clear('user1');
    expect(result.items).to.have.length(0);
  });
});

describe('StandardPricing (Strategy pattern)', () => {
  it('adds prices and rounds to cents', () => {
    expect(new StandardPricing().calculateTotal([{ price: 0.1 }, { price: 0.2 }])).to.equal(0.3);
  });
});
