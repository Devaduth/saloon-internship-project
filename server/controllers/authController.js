import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';
import Staff from '../models/Staff.js';
import { verifyPassword } from '../utils/password.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const JWT_EXPIRY = '7d';

const buildError = (message, code, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const normalizeMobileNumber = (value = '') => String(value).trim();

const isValidIndianMobileNumber = (value = '') => /^[6-9]\d{9}$/.test(value);

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const sanitizeUser = (user) => {
  if (!user) {
    return user;
  }

  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password_hash;
  delete userObject.password_salt;
  delete userObject.otp_number;
  delete userObject.otp_expiry;
  return userObject;
};

const sanitizeCustomer = sanitizeUser;

const signAuthToken = (userId, role, legacyPayload = {}) => {
  return jwt.sign(
    {
      userId,
      role,
      ...legacyPayload,
    },
    getJwtSecret(),
    {
      expiresIn: JWT_EXPIRY,
    }
  );
};

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

const normalizePassword = (value = '') => String(value || '').trim();

const loginWithPassword = async ({ Model, role, request, response, next, invalidMessage }) => {
  try {
    const email = normalizeEmail(request.body.email);
    const password = normalizePassword(request.body.password);

    if (!email || !password) {
      throw buildError('Email and password are required.', 'MISSING_FIELDS', 400);
    }

    const account = await Model.findOne({ email }).select('+password_hash +password_salt');

    if (!account) {
      throw buildError(invalidMessage, 'INVALID_CREDENTIALS', 401);
    }

    if (account.status !== 'AA') {
      throw buildError('Account is inactive.', 'INACTIVE_ACCOUNT', 403);
    }

    const passwordValid = verifyPassword(password, account.password_salt, account.password_hash);

    if (!passwordValid) {
      throw buildError(invalidMessage, 'INVALID_CREDENTIALS', 401);
    }

    return response.status(200).json({
      success: true,
      token: signAuthToken(account._id.toString(), role),
      role,
      user: sanitizeUser(account),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw buildError('JWT secret is not configured.', 'JWT_SECRET_MISSING', 500);
  }

  return process.env.JWT_SECRET;
};

export const sendOtp = async (request, response, next) => {
  try {
    const mobile_number = normalizeMobileNumber(request.body.mobile_number);

    if (!mobile_number || !isValidIndianMobileNumber(mobile_number)) {
      throw buildError('Mobile number you entered is invalid', 'INVALID_MOBILE_NUMBER', 400);
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const existingCustomer = await Customer.findOne({ mobile_number });

    let customer;

    if (existingCustomer) {
      customer = await Customer.findOneAndUpdate(
        { mobile_number },
        {
          $set: {
            otp_number: otp,
            otp_expiry: otpExpiry,
            status: 'OS',
            is_verified: false,
          },
          $inc: {
            resend_count: 1,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      customer = await Customer.create({
        mobile_number,
        otp_number: otp,
        otp_expiry: otpExpiry,
        resend_count: 0,
        is_verified: false,
        status: 'OS',
      });
    }

    console.log('Generated OTP:', otp);
    console.log(`OTP generated for mobile number: ${mobile_number}`);

    return response.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      generated_otp: process.env.NODE_ENV === 'production' ? undefined : otp,
      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

export const verifyOtp = async (request, response, next) => {
  try {
    const mobile_number = normalizeMobileNumber(request.body.mobile_number);
    const otp = normalizeMobileNumber(request.body.otp);

    if (!mobile_number || !otp) {
      throw buildError('Mobile number and OTP are required.', 'MISSING_FIELDS', 400);
    }

    if (!isValidIndianMobileNumber(mobile_number)) {
      throw buildError('Mobile number you entered is invalid', 'INVALID_MOBILE_NUMBER', 400);
    }

    const customer = await Customer.findOne({ mobile_number });

    if (!customer) {
      throw buildError('Customer not found.', 'CUSTOMER_NOT_FOUND', 404);
    }

    if (!customer.otp_number) {
      throw buildError('OTP is not available for verification.', 'INVALID_OTP', 400);
    }

    if (!customer.otp_expiry || customer.otp_expiry.getTime() < Date.now()) {
      throw buildError('OTP has expired.', 'OTP_EXPIRED', 400);
    }

    if (String(customer.otp_number) !== String(otp)) {
      throw buildError('Invalid OTP.', 'INVALID_OTP', 400);
    }

    customer.is_verified = true;
    customer.status = 'OV';
    customer.otp_number = '';
    customer.otp_expiry = null;

    await customer.save();

    const token = signAuthToken(customer._id.toString(), 'customer', {
      customer_id: customer._id.toString(),
      mobile_number: customer.mobile_number,
    });

    return response.status(200).json({
      success: true,
      token,
      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

export const registerCustomer = async (request, response, next) => {
  try {
    const customerId = request.authUser?._id || request.customer?._id;

    if (!customerId) {
      throw buildError('Authentication required.', 'UNAUTHORIZED', 401);
    }

    const name = String(request.body.name || '').trim();
    const ageValue = Number(request.body.age);
    const gender = String(request.body.gender || '').trim();

    if (!name) {
      throw buildError('Name is required.', 'INVALID_NAME', 400);
    }

    if (name.length < 3 || name.length > 20) {
      throw buildError('Name must be between 3 and 20 characters.', 'INVALID_NAME', 400);
    }

    if (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 146) {
      throw buildError('Age must be between 1 and 146.', 'INVALID_AGE', 400);
    }

    const allowedGenders = new Set(['Male', 'Female', 'Other']);
    if (!allowedGenders.has(gender)) {
      throw buildError('Gender must be Male, Female, or Other.', 'INVALID_GENDER', 400);
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw buildError('Customer not found.', 'CUSTOMER_NOT_FOUND', 404);
    }

    customer.name = name;
    customer.age = ageValue;
    customer.gender = gender;
    customer.status = 'AA';

    await customer.save();

    return response.status(200).json({
      success: true,
      message: 'You have successfully registered into the app',
      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

export const adminLogin = (request, response, next) => {
  return loginWithPassword({
    Model: Admin,
    role: 'admin',
    request,
    response,
    next,
    invalidMessage: 'Invalid admin credentials.',
  });
};

export const staffLogin = (request, response, next) => {
  return loginWithPassword({
    Model: Staff,
    role: 'staff',
    request,
    response,
    next,
    invalidMessage: 'Invalid staff credentials.',
  });
};