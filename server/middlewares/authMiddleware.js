const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from request header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }
  
  try {
    // Verify token and get the payload (which contains the user's ID)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request object
    req.user = decoded; 

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
