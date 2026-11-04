const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Admin privileges are required to perform this action'
  });
};

// Interoperability exports: support both named destructured require and direct function export
adminOnly.adminOnly = adminOnly;
adminOnly.default = adminOnly;
module.exports = adminOnly;
module.exports.adminOnly = adminOnly;
module.exports.default = adminOnly;
