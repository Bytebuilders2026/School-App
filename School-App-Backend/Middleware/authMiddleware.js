const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER:", req.headers.authorization);

    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }

    // 🔥 Split Bearer token
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "SchoolAppSuperSecretKey");
    console.log("DECODED:", decoded);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
