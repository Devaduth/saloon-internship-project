import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';

const buildError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = 400;
  return error;
};

export const createAppointment = async (request, response, next) => {
  try {
    const { main_category = '', sub_category = '' } = request.body;
    const customerId = request.body.customer_id || new mongoose.Types.ObjectId().toString();
    const createdBy = request.body.created_by || request.body.user_id || 'guest-user';
    const modifiedBy = request.body.modified_by || createdBy;

    const appointment = await Appointment.findOneAndUpdate(
      { customer_id: customerId },
      {
        $set: {
          stylist_id: request.body.stylist_id || '',
          branch_id: request.body.branch_id || '',
          city_id: request.body.city_id || '',
          area_id: request.body.area_id || '',
          state_id: request.body.state_id || '',
          main_category,
          sub_category,
          selected_services: Array.isArray(request.body.selected_services) ? request.body.selected_services : [],
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

    return response.status(201).json({
      success: true,
      message: 'You have successfully selected the main and sub category.',
      data: appointment,
    });
  } catch (error) {
    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};

export const updateAppointmentStylist = async (request, response, next) => {
  try {
    const appointment = await Appointment.findById(request.params.id);

    if (!appointment) {
      throw buildError('Appointment not found.', 'NOT_FOUND');
    }

    appointment.stylist_id = request.body.stylist_id || appointment.stylist_id;
    appointment.branch_id = request.body.branch_id || appointment.branch_id;
    appointment.city_id = request.body.city_id || appointment.city_id;
    appointment.area_id = request.body.area_id || appointment.area_id;
    appointment.state_id = request.body.state_id || appointment.state_id;
    appointment.selected_services = Array.isArray(request.body.selected_services)
      ? request.body.selected_services
      : appointment.selected_services;
    appointment.modified_by = request.body.modified_by || appointment.modified_by || 'guest-user';
    appointment.status = request.body.status || appointment.status;

    await appointment.save();

    return response.status(200).json({
      success: true,
      message: 'Selected stylist updated successfully.',
      data: appointment,
    });
  } catch (error) {
    if (!error.code) {
      error.code = 'SERVER_ERROR';
    }

    return next(error);
  }
};
