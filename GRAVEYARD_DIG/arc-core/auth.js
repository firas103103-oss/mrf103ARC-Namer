const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

exports.rateLimiter = rateLimit({ windowMs: 60000, max: 100 });

exports.issueToken = (payload, ttl) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ttl });

exports.verify = (req, res, next) => {
  try {
    req.user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(401);
  }
};
