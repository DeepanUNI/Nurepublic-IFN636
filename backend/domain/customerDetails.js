const { ValidationError } = require('../errors/AppError');

// ENCAPSULATION: a CustomerDetails object can only exist if its data is valid.
// The constructor checks everything, and the data is kept in a private field (#data),
// so nothing outside the class can change it afterwards.
class CustomerDetails {
  static FIELDS = {
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone',
    street: 'Street address',
    city: 'Suburb / City',
    state: 'State',
    postcode: 'Postcode',
  };

  #data;

  constructor(input) {
    if (!input || typeof input !== 'object') {
      throw new ValidationError('Delivery details are required');
    }

    // copy only the known fields, trimmed — anything extra in the request is ignored
    const data = {};
    for (const [field, label] of Object.entries(CustomerDetails.FIELDS)) {
      const value = String(input[field] ?? '').trim();
      if (!value) throw new ValidationError(`${label} is required`);
      data[field] = value;
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      throw new ValidationError('Please provide a valid email address');
    }
    if (!/^[0-9+()\s-]{8,20}$/.test(data.phone)) {
      throw new ValidationError('Please provide a valid phone number');
    }
    if (!/^\d{4}$/.test(data.postcode)) {
      throw new ValidationError('Postcode must be 4 digits');
    }

    this.#data = Object.freeze(data);
  }

  // plain copy for saving to MongoDB or sending back to the browser
  toObject() {
    return { ...this.#data };
  }
}

module.exports = CustomerDetails;
