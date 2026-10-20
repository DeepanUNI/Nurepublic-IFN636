const { expect } = require('chai');
const { SortFactory, ProductSort, NewestSort } = require('../patterns/SortFactory');
const { ValidationError } = require('../errors/AppError');

describe('SortFactory (Factory pattern)', () => {
  it('creates the right sort for each option', () => {
    expect(SortFactory.getSort('newest').getSortOrder()).to.eql({ createdAt: -1 });
    expect(SortFactory.getSort('price_asc').getSortOrder()).to.eql({ price: 1 });
    expect(SortFactory.getSort('price_desc').getSortOrder()).to.eql({ price: -1 });
    expect(SortFactory.getSort('title_asc').getSortOrder()).to.eql({ title: 1 });
  });

  it('returns subclasses of ProductSort', () => {
    expect(SortFactory.getSort('newest')).to.be.instanceOf(NewestSort).and.instanceOf(ProductSort);
  });

  it('rejects an unknown sort type with a clear message', () => {
    expect(() => SortFactory.getSort('cheapest')).to.throw(ValidationError, 'Unknown sort type: cheapest');
  });

  it('cannot create the abstract ProductSort directly', () => {
    expect(() => new ProductSort('x')).to.throw();
  });
});
