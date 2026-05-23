import mongoose from 'mongoose';

const salonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city_id: { type: String, trim: true, default: '' },
    area_id: { type: String, trim: true, default: '' },
    state_id: { type: String, trim: true, default: '' },
    contact_number: { type: String, trim: true, default: '' },
    opening_hours: { type: String, trim: true, default: '' },
    services: {
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
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    status: { type: String, enum: ['AA', 'IA'], default: 'AA' },
  },
  { timestamps: true, collection: 'salons' }
);

const Salon = mongoose.model('Salon', salonSchema);

export default Salon;
