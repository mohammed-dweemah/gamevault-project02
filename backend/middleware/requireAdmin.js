const User = require('../models/User');

/**
 * Admin middleware — only allows users with role: 'admin'
 */
const requireAdmin = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = requireAdmin;
