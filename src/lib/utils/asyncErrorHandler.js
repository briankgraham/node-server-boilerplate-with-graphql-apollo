// NOTE: Used as a wrapper around functions to catch errors.
// If any errors are thrown, they can bubble to here
// And jsonErrorHandler middleware can pick it up
// No need to add .catch() throughout, or try/catch.
module.exports = {
  catchErrors: fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
