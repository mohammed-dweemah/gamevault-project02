/**
 * Custom Express Middleware — POST Request Logger
 * Requirement: Log every successful POST request with timestamp and user ID
 */

const postLogger = (req, res, next) => {
  // Only intercept POST requests
  if (req.method !== 'POST') return next();

  // Store the original res.json to intercept the response
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    // Log only on successful responses (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const timestamp = new Date().toISOString();
      const userId = req.session?.userId || 'unauthenticated';
      const route = req.originalUrl;

      console.log(
        `\x1b[36m[POST LOG]\x1b[0m ` +
        `\x1b[33mTimestamp:\x1b[0m ${timestamp} | ` +
        `\x1b[33mRoute:\x1b[0m ${route} | ` +
        `\x1b[33mUser ID:\x1b[0m ${userId}`
      );
    }

    // Call the original res.json
    return originalJson(body);
  };

  next();
};

module.exports = postLogger;
