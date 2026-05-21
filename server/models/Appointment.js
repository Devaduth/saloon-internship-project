import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
      index: true,
    },
    main_category: {
      type: String,
      required: true,
      enum: ['Men', 'Women', 'Child'],
      trim: true,
    },
    sub_category: {
      type: String,
      required: true,
      enum: ['Hair Care', 'Body Care'],
      trim: true,
    },
    created_by: {
      type: String,
      required: true,
      trim: true,
      default: 'guest-user',
    },
    modified_by: {
      type: String,
      required: true,
      trim: true,
      default: 'guest-user',
    },
    status: {
      type: String,
      required: true,
      enum: ['AA', 'IA'],
      default: 'AA',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' },
    collection: 'appointments',
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
