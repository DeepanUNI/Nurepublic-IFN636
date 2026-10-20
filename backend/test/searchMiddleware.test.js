const { expect } = require('chai');
const sinon = require('sinon');
const { validateSearch } = require('../middleware/searchmiddleware');

// small helper: run the middleware with a query and capture what happens
function run(query) {
  const req = { query };
  const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
  const next = sinon.spy();
  validateSearch(req, res, next);
  return { req, res, next };
}

describe('validateSearch middleware (FR03 search + FR04 filter)', () => {
  it('shows everything when no search or filters are given', () => {
    const { req, next } = run({});
    expect(next.calledOnce).to.equal(true);
    expect(req.searchFilter).to.eql({});
  });

  it('searches title, description and category (not case-sensitive)', () => {
    const { req } = run({ search: 'Buds' });
    expect(req.searchFilter.$or).to.have.length(3);
    expect(req.searchFilter.$or[0].title.test('PulseBuds Mini')).to.equal(true);
    expect(req.searchFilter.$or[0].title.flags).to.include('i');
  });

  it('treats special characters as plain text', () => {
    const { req } = run({ search: 'a.b' });
    expect(req.searchFilter.$or[0].title.test('axb')).to.equal(false);
  });

  it('rejects a search longer than 100 characters', () => {
    const { res, next } = run({ search: 'x'.repeat(101) });
    expect(res.status.calledWith(400)).to.equal(true);
    expect(next.called).to.equal(false);
  });

  it('filters by exact category', () => {
    const { req } = run({ category: 'earbuds' });
    expect(req.searchFilter.category.test('Earbuds')).to.equal(true);
    expect(req.searchFilter.category.test('Earbuds Pro')).to.equal(false);
  });

  it('filters by a price range', () => {
    const { req } = run({ minPrice: '50', maxPrice: '200' });
    expect(req.searchFilter.price).to.eql({ $gte: 50, $lte: 200 });
  });

  it('combines search, category and price', () => {
    const { req } = run({ search: 'pro', category: 'Over-ear', maxPrice: '400' });
    expect(req.searchFilter).to.have.keys('$or', 'category', 'price');
  });

  it('rejects a negative or non-numeric price', () => {
    expect(run({ minPrice: '-5' }).res.status.calledWith(400)).to.equal(true);
    expect(run({ maxPrice: 'abc' }).res.status.calledWith(400)).to.equal(true);
  });

  it('rejects a minimum price above the maximum', () => {
    const { res, next } = run({ minPrice: '300', maxPrice: '100' });
    expect(res.status.calledWith(400)).to.equal(true);
    expect(next.called).to.equal(false);
  });
});
