import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.admin = verified; // Pass the decoded payload to the request object
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token", error });
  }
};

export default adminAuth;
