import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true, select: false },
    password_salt: { type: String, required: true, select: false },
    role: { type: String, enum: ['staff'], default: 'staff' },
    status: { type: String, enum: ['AA', 'IA'], default: 'AA' },
    salon_id: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'staff' }
);

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
