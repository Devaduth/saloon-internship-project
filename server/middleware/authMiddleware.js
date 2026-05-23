import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';

const buildError = (message, code, statusCode = 401) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw buildError('JWT secret is not configured.', 'JWT_SECRET_MISSING', 500);
  }

  return process.env.JWT_SECRET;
};

export const protect = async (request, _response, next) => {
  try {
    const authHeader = request.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      throw buildError('Authorization token is missing.', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      throw buildError('Authorization token is missing.', 'UNAUTHORIZED', 401);
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded?.customer_id) {
      throw buildError('Invalid authorization token.', 'UNAUTHORIZED', 401);
    }

    const customer = await Customer.findById(decoded.customer_id);

    if (!customer) {
      throw buildError('Customer not found.', 'CUSTOMER_NOT_FOUND', 404);
    }

    request.customer = customer;
    request.token = token;

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.code = 'TOKEN_EXPIRED';
      error.message = 'Authorization token has expired.';
    } else if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.code = 'INVALID_TOKEN';
      error.message = 'Invalid authorization token.';
    } else if (!error.statusCode) {
      error.statusCode = 500;
    }

    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};