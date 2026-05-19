import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const RATE_LIMITS = {
  admin: {
    max: 20,
    message: 'Admin request limit exceeded. Please slow down.',
  },
  user: {
    max: 10,
    message: 'User request limit exceeded. Please slow down.',
  },
  guest: {
    max: 5,
    message: 'Guest request limit exceeded. Please slow down.',
  },
};

const getRequestRole = (req) => {
  const role = req.user?.role || req.auth?.role || req.headers['x-user-role'];

  return RATE_LIMITS[role] ? role : 'guest';
};

const securityMiddleware = async (req, res, next) => {
  try {
    const role = getRequestRole(req);
    const rateLimit = RATE_LIMITS[role];
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: rateLimit.max,
        name: `${role}-rate-limit`,
      }),
    );

    const decision = await client.protect(req);

    if (decision.isDenied()) {
      const logContext = {
        ip: req.ip,
        path: req.path,
        role,
      };

      if (decision.isBot()) {
        logger.warn('Bot request blocked', logContext);

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Automated traffic is not allowed.',
        });
      }

      if (decision.isRateLimit()) {
        logger.warn('Rate limit exceeded', logContext);

        return res.status(429).json({
          error: 'Too many requests',
          message: rateLimit.message,
        });
      }

      logger.warn('Request blocked by Arcjet', logContext);

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy.',
      });
    }

    return next();
  } catch (e) {
    logger.error('Arcjet middleware error', {
      error: e.message,
      stack: e.stack,
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware.',
    });
  }
};

export default securityMiddleware;
