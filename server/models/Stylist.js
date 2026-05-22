import mongoose from 'mongoose';

const stylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    stylist_photo: {
      type: String,
      required: true,
      trim: true,
    },
    certifications: {
      type: [String],
      default: [],
    },
    professional_gallery: {
      type: [String],
      default: [],
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      required: true,
      enum: ['AA', 'IA'],
      default: 'AA',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    branch_id: {
      type: String,
      trim: true,
      default: '',
    },
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
    branch_name: {
      type: String,
      trim: true,
      default: '',
    },
    working_hours: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    services: {
      type: [
        {
          name: String,
          duration: String,
          price: Number,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' },
    collection: 'stylists',
  }
);

const Stylist = mongoose.model('Stylist', stylistSchema);

export default Stylist;