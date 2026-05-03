import logger from '../config/logger.js';

export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  }),
  setCookie: (res, name, value, options = {}) => {
    try {
      const cookieOptions = { ...cookies.getOptions(), ...options };
      res.cookie(name, value, cookieOptions);
    } catch (error) {
      logger.error('Failed to set cookie', error);
      throw new Error('Failed to set cookie');
    }
  },
  clearCookie: (res, name) => {
    try {
      res.clearCookie(name, cookies.getOptions());
    } catch (error) {
      logger.error('Failed to clear cookie', error);
      throw new Error('Failed to clear cookie');
    }
  },
  get: (req, name) => {
    try {
      return req.cookies[name];
    } catch (error) {
      logger.error('Failed to get cookie', error);
      throw new Error('Failed to get cookie');
    }
  },
};
