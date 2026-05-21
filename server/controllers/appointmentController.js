import Appointment from '../models/Appointment.js';

const allowedMainCategories = ['Men', 'Women', 'Child'];
const allowedSubCategories = ['Hair Care', 'Body Care'];

const buildError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = 400;
  return error;
};

export const createAppointment = async (request, response, next) => {
  try {
    const { main_category, sub_category } = request.body;
    const createdBy = request.body.created_by || request.body.user_id || 'guest-user';
    const modifiedBy = request.body.modified_by || createdBy;

    if (!main_category || !allowedMainCategories.includes(main_category)) {
      throw buildError('Main category is required and must be valid.', 'VALIDATION_ERROR');
    }

    if (!sub_category || !allowedSubCategories.includes(sub_category)) {
      throw buildError('You should select at least one sub category', 'E002');
    }

    const appointment = await Appointment.create({
      main_category,
      sub_category,
      created_by: createdBy,
      modified_by: modifiedBy,
      status: 'AA',
    });

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
