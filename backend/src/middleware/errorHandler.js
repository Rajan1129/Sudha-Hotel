function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const status = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // Redact sensitive details before logging to server console
  const logMsg = err.message ? err.message.replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, '[MONGO_URI_REDACTED]') : 'Server error';
  console.error(`[error] [${req.method} ${req.path}] Status ${status}:`, logMsg);

  if (isProd) {
    // In production, suppress 500 internal details & stack traces
    if (status >= 500) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(status).json({
      message: err.message || 'An error occurred while processing your request.',
    });
  }

  // In development, include message and stack trace
  res.status(status).json({
    message: err.message || 'Internal server error',
    stack: err.stack,
  });
}

module.exports = { notFound, errorHandler };
