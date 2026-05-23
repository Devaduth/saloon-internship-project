import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
      index: true,
    },
    appointment_id: {
      type: String,
      trim: true,
      default: '',
    },
    // New salon-based booking fields
    salon_id: {
      type: String,
      trim: true,
      default: '',
    },
    stylist_id: {
      type: String,
      trim: true,
      default: '',
    },
    booking_date: {
      type: String,
      trim: true,
      default: '',
    },
    booking_slot: {
      type: String,
      trim: true,
      default: '',
    },
    service_ids: {
      type: [String],
      default: [],
    },
    // legacy fields (kept for compatibility but unused in salon flow)
    city_id: {
      type: String,
      trim: true,
      default: '',
    },
    area_id: {
      type: String,
      trim: true,
      default: '',
    },
    state_id: {
      type: String,
      trim: true,
      default: '',
    },
    branch_id: {
      type: String,
      trim: true,
      default: '',
    },
    main_category: {
      type: String,
      trim: true,
      default: '',
    },
    sub_category: {
      type: String,
      trim: true,
      default: '',
    },
    selected_services: {
      type: [
        {
          id: { type: String, default: '' },
          name: { type: String, default: '' },
          duration: { type: String, default: '' },
          price: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    total_price: { type: Number, default: 0 },
    total_duration: { type: String, trim: true, default: '' },
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
    booking_status: {
      type: String,
      required: true,
      enum: ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' },
    collection: 'appointments',
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
