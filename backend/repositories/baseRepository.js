// REPOSITORY PATTERN + ABSTRACTION: services talk to these classes, never to Mongoose directly.
// BaseRepository holds the database operations every repository shares (INHERITANCE).
class BaseRepository {
  constructor(model) {
    // abstract class: it only makes sense through a subclass (CartRepository, etc.)
    if (new.target === BaseRepository) {
      throw new TypeError('BaseRepository is abstract — extend it instead');
    }
    this.model = model;
  }

  findById(id) {
    return this.model.findById(id);
  }

  findOne(filter) {
    return this.model.findOne(filter);
  }

  find(filter) {
    return this.model.find(filter);
  }

  create(data) {
    return this.model.create(data);
  }

  save(document) {
    return document.save();
  }
}

module.exports = BaseRepository;
