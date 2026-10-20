const { expect } = require('chai');
const CustomerDetails = require('../domain/customerDetails');
const { ValidationError } = require('../errors/AppError');

const valid = {
  fullName: 'Sam Lee', email: 'sam@test.com', phone: '0412 345 678',
  street: '1 George St', city: 'Brisbane', state: 'QLD', postcode: '4000',
};

describe('CustomerDetails (checkout delivery details)', () => {
  it('accepts valid details and trims them', () => {
    const c = new CustomerDetails({ ...valid, street: '  1 George St  ' }).toObject();
    expect(c.street).to.equal('1 George St');
  });

  it('ignores extra fields', () => {
    const c = new CustomerDetails({ ...valid, pricePaid: 0 }).toObject();
    expect(c).to.not.have.property('pricePaid');
  });

  it('requires delivery details', () => {
    expect(() => new CustomerDetails()).to.throw(ValidationError, 'Delivery details are required');
  });

  it('requires every field', () => {
    expect(() => new CustomerDetails({ ...valid, phone: '' })).to.throw(ValidationError, 'Phone is required');
  });

  it('checks email, phone and postcode formats', () => {
    expect(() => new CustomerDetails({ ...valid, email: 'nope' })).to.throw(ValidationError);
    expect(() => new CustomerDetails({ ...valid, phone: '12' })).to.throw(ValidationError);
    expect(() => new CustomerDetails({ ...valid, postcode: '400' })).to.throw(ValidationError, 'Postcode must be 4 digits');
  });
});
