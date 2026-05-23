import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    mobile_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    otp_number: {
      type: String,
      trim: true,
      default: '',
    },
    otp_expiry: {
      type: Date,
      default: null,
    },
    resend_count: {
      type: Number,
      default: 0,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['OS', 'OV', 'AA', 'IA'],
      default: 'OS',
    },
  },
  {
    timestamps: true,
    collection: 'customers',
  }
);

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;