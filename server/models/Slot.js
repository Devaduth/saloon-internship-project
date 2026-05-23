import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    salon_id: { type: String, required: true, index: true },
    stylist_id: { type: String, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    start_time: { type: String, required: true }, // e.g. 10:00
    end_time: { type: String, required: true }, // e.g. 10:30
    is_booked: { type: Boolean, default: false },
    booking_id: { type: String, trim: true, default: '' },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true, collection: 'slots' }
);

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;
