const jwt = require("jsonwebtoken");

// This function will be used in routes to protect them
function verifyToken(req, res, next) {
  // Get token from headers
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = decoded;

    // Call next middleware or route handler
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

module.exports = verifyToken;
