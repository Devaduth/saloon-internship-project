import Salon from '../models/Salon.js';
import Stylist from '../models/Stylist.js';
import Slot from '../models/Slot.js';

export const listSalons = async (req, res, next) => {
  try {
    const query = { status: 'AA' };
    const salons = await Salon.find(query).lean();
    return res.status(200).json({ success: true, data: salons });
  } catch (error) {
    return next(error);
  }
};

export const getSalonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salon = await Salon.findById(id).lean();

    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    return res.status(200).json({ success: true, data: salon });
  } catch (error) {
    return next(error);
  }
};

export const getSalonStylists = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stylists = await Stylist.find({ salon_id: id, status: 'AA' }).lean();
    return res.status(200).json({ success: true, data: stylists });
  } catch (error) {
    return next(error);
  }
};

export const getSalonSlots = async (req, res, next) => {
  try {
    const { id } = req.params; // salon id
    const date = req.query.date || '';
    const filter = { salon_id: id };

    if (date) {
      filter.date = date;
    }

    const slots = await Slot.find(filter).lean();
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    return next(error);
  }
};
