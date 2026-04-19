const errorHandler = (err, _req, res, _next) => {
  const statusCode = Number(err.statusCode) || 500;
  const isServerError = statusCode >= 500;
  const message = isServerError ? "Internal server error" : err.message || "Request failed";

  if (isServerError) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
