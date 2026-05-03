import aj from "#config/arcjet.js";
import logger from "#config/logger.js";

const securityMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.isBot()) {
        logger.warn('Bot request blocked', { ip: req.ip, path: req.path });
      } else if (decision.isRateLimit()) {
        logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
      } else {
        logger.warn('Request blocked by Arcjet', { ip: req.ip, path: req.path });
      }
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      });
    }

    next();
  } catch (e) {
    logger.error('Arcjet middleware error', { error: e.message, stack: e.stack });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    });
  }
};

export default securityMiddleware;
