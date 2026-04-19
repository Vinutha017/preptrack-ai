const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const uniqueErrors = [];
  const seen = new Set();

  for (const error of errors.array()) {
    const field = error.path || "request";
    if (seen.has(field)) continue;
    seen.add(field);
    uniqueErrors.push({ field, message: error.msg });
  }

  return res.status(400).json({
    message: "Validation failed",
    errors: uniqueErrors,
  });
};

module.exports = validate;
