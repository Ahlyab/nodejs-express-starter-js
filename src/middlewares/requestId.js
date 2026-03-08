const { randomUUID } = require('crypto');

/**
 * Attach a unique request ID to each request for tracing
 * Uses X-Request-Id header if present, otherwise generates a UUID
 */
const requestId = (req, res, next) => {
  const id = req.get('X-Request-Id') || randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};

module.exports = requestId;
