import { formatValidationError } from '../utils/format.js';
import { signupSchema } from '../validations/auth.validation.js';
import logger from '../config/logger.js';

export const signup = async (req, res, next) => {
  try {
    console.log('req.headers:', req.headers);
    console.log('req.body:', req.body);
    console.log('req.body type:', typeof req.body);
    console.log('req.body keys:', req.body ? Object.keys(req.body) : 'N/A');
    console.log('content-type:', req.headers['content-type']);

    const body = req.body;

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      return res.status(400).json({
        error: 'validation failed',
        details: 'Request body is missing or empty',
      });
    }

    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, role } = validationResult.data;

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      message: 'User registered',
      user: {
        id: 1,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    logger.error('Signup errors', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
};
