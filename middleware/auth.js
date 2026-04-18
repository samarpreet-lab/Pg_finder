/**
 * Authentication middleware to protect routes
 * Checks if user is logged in via session
 */
module.exports = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};
