const mongoose = require('mongoose');
const BaseRepository = require('./baseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  // POLYMORPHISM (method overriding): a badly formed id means "not found",
  // instead of Mongoose throwing a CastError and the request failing with a 500
  findById(id) {
    if (!mongoose.isValidObjectId(id)) return Promise.resolve(null);
    return super.findById(id);
  }
}

module.exports = ProductRepository;
