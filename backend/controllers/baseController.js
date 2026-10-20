const { AppError } = require('../errors/AppError');

// Shared behaviour for every class-based controller (INHERITANCE).
class BaseController {
  // Wraps a route handler so every action handles errors the same way:
  //  - an AppError (ValidationError, NotFoundError, ...) -> its own status + message
  //  - anything unexpected -> 500 with a fallback message
  // POLYMORPHISM: err.statusCode is different for each AppError subclass, but this
  // code doesn't need to know which one it got.
  handle(action, failMessage) {
    return async (req, res) => {
      try {
        await action(req, res);
      } catch (err) {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({ message: err.message });
        }
        res.status(500).json({ message: failMessage, error: err.message });
      }
    };
  }
}

module.exports = BaseController;
