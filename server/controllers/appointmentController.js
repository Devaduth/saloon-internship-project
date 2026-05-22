import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';

const buildError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = 400;
  return error;
};

const normalizeSelectedServices = (services = []) =>
  services
    .filter(Boolean)
    .map((service) => ({
      id: service.id || service.service_id || '',
      name: service.name || service.service_name || '',
      service_name: service.service_name || service.name || '',
      duration: service.duration || '',
      price: Number(service.price || 0),
    }));

const parseDurationToMinutes = (duration = '') => {
  const value = String(duration).trim().toLowerCase();

  if (!value) {
    return 0;
  }

  const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  if (hourMatch) {
    return Math.round(Number.parseFloat(hourMatch[1]) * 60);
  }

  const minuteMatch = value.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
  if (minuteMatch) {
    return Number.parseInt(minuteMatch[1], 10);
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatMinutes = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (!hours && !remainingMinutes) {
    return '0 min';
  }

  if (!hours) {
    return `${remainingMinutes} min`;
  }

  if (!remainingMinutes) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} min`;
};

const calculateServiceTotals = (services = []) => {
  const normalizedServices = normalizeSelectedServices(services);

  return normalizedServices.reduce(
    (totals, service) => {
      totals.totalPrice += Number(service.price || 0);
      totals.totalMinutes += parseDurationToMinutes(service.duration);
      return totals;
    },
    { totalPrice: 0, totalMinutes: 0 }
  );
};

const ensureAppointmentId = async (appointment) => {
  if (appointment && !appointment.appointment_id) {
    appointment.appointment_id = appointment._id.toString();
    await appointment.save();
  }

  return appointment;
};

export const createAppointment = async (request, response, next) => {
  try {
    const { main_category = '', sub_category = '' } = request.body;
    const customerId = request.body.customer_id || new mongoose.Types.ObjectId().toString();
    const createdBy = request.body.created_by || request.body.user_id || 'guest-user';
    const modifiedBy = request.body.modified_by || createdBy;
    const selectedServices = normalizeSelectedServices(request.body.selected_services);
    const totals = calculateServiceTotals(selectedServices);

    const appointment = await Appointment.findOneAndUpdate(
      { customer_id: customerId },
      {
        $set: {
          appointment_date_time: request.body.appointment_date_time || '',
          stylist_id: request.body.stylist_id || '',
          branch_id: request.body.branch_id || '',
          city_id: request.body.city_id || '',
          area_id: request.body.area_id || '',
          state_id: request.body.state_id || '',
          customer_address: request.body.customer_address || '',
          main_category,
          sub_category,
          selected_services: selectedServices,
          total_price: totals.totalPrice,
          total_duration: formatMinutes(totals.totalMinutes),
          modified_by: modifiedBy,
          status: 'AA',
        },
        $setOnInsert: {
          created_by: createdBy,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await ensureAppointmentId(appointment);

    return response.status(201).json({
      success: true,
      message: 'Appointment draft created successfully.',
      data: appointment,
    });
  } catch (error) {
    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

export const getAppointmentById = async (request, response, next) => {
  try {
    const appointment = await Appointment.findById(request.params.id);

    if (!appointment) {
      throw buildError('Appointment not found.', 'NOT_FOUND');
    }

    await ensureAppointmentId(appointment);

    return response.status(200).json({
      success: true,
      message: 'Appointment fetched successfully.',
      data: appointment,
    });
  } catch (error) {
    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

export const updateAppointment = async (request, response, next) => {
  try {
    const appointment = await Appointment.findById(request.params.id);

    if (!appointment) {
      throw buildError('Appointment not found.', 'NOT_FOUND');
    }

    const selectedServices = Array.isArray(request.body.selected_services)
      ? normalizeSelectedServices(request.body.selected_services)
      : appointment.selected_services;
    const totals = calculateServiceTotals(selectedServices);

    appointment.appointment_date_time = request.body.appointment_date_time || appointment.appointment_date_time;
    appointment.stylist_id = request.body.stylist_id || appointment.stylist_id;
    appointment.branch_id = request.body.branch_id || appointment.branch_id;
    appointment.city_id = request.body.city_id || appointment.city_id;
    appointment.area_id = request.body.area_id || appointment.area_id;
    appointment.state_id = request.body.state_id || appointment.state_id;
    appointment.customer_address = request.body.customer_address || appointment.customer_address;
    appointment.selected_services = selectedServices;
    appointment.total_price = Number.isFinite(Number(request.body.total_price))
      ? Number(request.body.total_price)
      : totals.totalPrice;
    appointment.total_duration = request.body.total_duration || formatMinutes(totals.totalMinutes);
    appointment.modified_by = request.body.modified_by || appointment.modified_by || 'guest-user';
    appointment.status = request.body.status || appointment.status;
    appointment.appointment_id = appointment.appointment_id || appointment._id.toString();

    await appointment.save();

    return response.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      data: appointment,
    });
  } catch (error) {
    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

export const updateAppointmentStylist = updateAppointment;
