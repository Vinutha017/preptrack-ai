const rateLimit = require("express-rate-limit");

const defaultHandler = (req, res) => {
  res.status(429).json({
    message: "Too many requests, please try again later.",
    retryAfterSeconds: Math.ceil((req.rateLimit?.resetTime?.getTime?.() - Date.now()) / 1000) || 60,
  });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
});

module.exports = {
  authLimiter,
  apiLimiter,
};
