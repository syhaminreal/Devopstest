import { formatValidationError } from '../../utils/format.js';
import { signupSchema, signInSchema } from './auth.validation.js';
import logger from '../../config/logger.js';
import { jwttoken } from '../../utils/jwt.js';
import { createUser, authenticateUser } from './auth.service.js';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import { user } from './user.model.js';

export const signup = async (req, res, next) => {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
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

    const { name, email, password, role } = validationResult.data;

    const newUser = await createUser({ name, email, password, role });

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      message: 'User registered',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    logger.error('Signup error', error);

    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      return res.status(400).json({
        error: 'validation failed',
        details: 'Request body is missing or empty',
      });
    }

    const validationResult = signInSchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const authenticatedUser = await authenticateUser(email, password);

    logger.info(`User signed in: ${email}`);

    const token = jwttoken.sign({ email: authenticatedUser.email, role: authenticatedUser.role });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    logger.error('Signin error', error);

    if (error.message === 'User not found' || error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwttoken.verify(token);
      logger.info(`User signed out: ${decoded.email}`);
    } catch (err) {
      logger.warn('Signout attempted with invalid token');
    }

    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Signout error', error);
    next(error);
  }
};

