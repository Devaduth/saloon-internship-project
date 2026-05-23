import Appointment from '../models/Appointment.js';
import Slot from '../models/Slot.js';

const buildError = (message, code = 'BOOKING_ERROR', statusCode = 400) => {
  const err = new Error(message);
  err.code = code;
  err.statusCode = statusCode;
  return err;
};

export const createBooking = async (req, res, next) => {
  try {
    const { salon_id, stylist_id, slot_id, service_ids = [] } = req.body;

    if (!salon_id || !stylist_id || !slot_id) {
      throw buildError('Salon, stylist and slot are required', 'MISSING_FIELDS', 400);
    }

    const slot = await Slot.findById(slot_id);

    if (!slot) {
      throw buildError('Slot not found', 'SLOT_NOT_FOUND', 404);
    }

    if (slot.is_booked) {
      throw buildError('Slot already booked', 'SLOT_TAKEN', 409);
    }

    // Reserve slot
    slot.is_booked = true;
    await slot.save();

    const appointment = await Appointment.create({
      customer_id: req.body.customer_id || req.customer?._id || 'guest-user',
      salon_id,
      stylist_id,
      booking_date: slot.date,
      booking_slot: `${slot.start_time}-${slot.end_time}`,
      service_ids,
      selected_services: [],
      total_price: 0,
      total_duration: '',
      created_by: req.body.created_by || 'guest-user',
      modified_by: req.body.modified_by || 'guest-user',
      booking_status: 'CONFIRMED',
    });

    slot.booking_id = appointment._id.toString();
    await slot.save();

    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    return next(error);
  }
};

export const getBookingsForCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId || req.customer?._id;
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer id required' });
    }

    const bookings = await Appointment.find({ customer_id: customerId }).lean();
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return next(error);
  }
};
