const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const CheckoutService = require('../services/checkoutService');
const { StandardPricing } = require('../pricing/pricingStrategies');
const { ValidationError } = require('../errors/AppError');

const customer = {
  fullName: 'Sam Lee', email: 'sam@test.com', phone: '0412 345 678',
  street: '1 George St', city: 'Brisbane', state: 'QLD', postcode: '4000',
};

function setup({ products = [], ownedIds = [] } = {}) {
  const cart = { items: products.map((p) => ({ product: p })) };
  const cartRepository = {
    findByUserWithProducts: sinon.stub().resolves(products.length ? cart : null),
    save: sinon.stub().resolves(cart),
  };
  const orderRepository = {
    findOwnedProductIds: sinon.stub().resolves(new Set(ownedIds.map(String))),
    createMany: sinon.stub().callsFake(async (docs) => docs),
  };
  const service = new CheckoutService({ cartRepository, orderRepository, pricingStrategy: new StandardPricing() });
  return { service, cart, orderRepository };
}

describe('CheckoutService (FR02 checkout)', () => {
  it('creates one order per product with the delivery details, then empties the cart', async () => {
    const a = { _id: new mongoose.Types.ObjectId(), price: 100 };
    const b = { _id: new mongoose.Types.ObjectId(), price: 60 };
    const { service, cart, orderRepository } = setup({ products: [a, b] });

    const result = await service.checkout('user1', customer);

    expect(result.orders).to.have.length(2);
    expect(result.total).to.equal(160);
    expect(result.orders[0].customer.postcode).to.equal('4000');
    expect(String(result.orders[0].checkoutId)).to.equal(String(result.orders[1].checkoutId));
    expect(orderRepository.createMany.calledOnce).to.equal(true);
    expect(cart.items).to.have.length(0);
  });

  it('skips products the user already owns', async () => {
    const a = { _id: new mongoose.Types.ObjectId(), price: 100 };
    const b = { _id: new mongoose.Types.ObjectId(), price: 60 };
    const { service } = setup({ products: [a, b], ownedIds: [a._id] });
    const result = await service.checkout('user1', customer);
    expect(result.orders).to.have.length(1);
    expect(result.skipped).to.equal(1);
  });

  it('rejects an empty cart', async () => {
    const { service } = setup();
    await service.checkout('user1', customer).then(() => { throw new Error('should fail'); }, (err) => {
      expect(err).to.be.instanceOf(ValidationError);
      expect(err.message).to.equal('Your cart is empty');
    });
  });

  it('rejects bad delivery details before touching the cart', async () => {
    const { service, orderRepository } = setup({ products: [{ _id: new mongoose.Types.ObjectId(), price: 1 }] });
    await service.checkout('user1', { ...customer, postcode: 'abc' }).then(() => { throw new Error('should fail'); }, (err) => {
      expect(err).to.be.instanceOf(ValidationError);
    });
    expect(orderRepository.createMany.called).to.equal(false);
  });
});
