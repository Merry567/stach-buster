// middleware/auth.js
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  let token = req.header("Authorization");

  // Support both "Bearer <token>" and just "<token>"
  if (token && token.startsWith("Bearer ")) {
    token = token.replace("Bearer ", "");
  }

  console.log("Authorization header received:", req.header("Authorization")); // ← debug

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
}

module.exports = verifyToken;