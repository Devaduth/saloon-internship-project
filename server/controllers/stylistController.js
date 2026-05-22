import Stylist from '../models/Stylist.js';

const buildError = (message, code, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const buildFilter = (query) => {
  const filter = { status: 'AA' };

  if (query.category) {
    filter.category = query.category;
  }

  if (query.subcategory) {
    filter.subcategory = query.subcategory;
  }

  if (query.branch_id) {
    filter.branch_id = query.branch_id;
  }

  if (query.city_id) {
    filter.city_id = query.city_id;
  }

  if (query.area_id) {
    filter.area_id = query.area_id;
  }

  if (query.state_id) {
    filter.state_id = query.state_id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  return filter;
};

export const getStylists = async (request, response, next) => {
  try {
    const stylists = await Stylist.find(buildFilter(request.query)).sort({ rating: -1, experience: -1, name: 1 });

    return response.status(200).json({
      success: true,
      data: stylists,
    });
  } catch (error) {
    return next(error);
  }
};

export const getStylistById = async (request, response, next) => {
  try {
    const stylist = await Stylist.findOne({ _id: request.params.id, status: 'AA' });

    if (!stylist) {
      throw buildError('Stylist not found.', 'NOT_FOUND', 404);
    }

    return response.status(200).json({
      success: true,
      data: stylist,
    });
  } catch (error) {
    return next(error);
  }
};

export const getStylistCertifications = async (request, response, next) => {
  try {
    const stylist = await Stylist.findOne({ _id: request.params.id, status: 'AA' }).select('certifications name');

    if (!stylist) {
      throw buildError('Stylist not found.', 'NOT_FOUND', 404);
    }

    return response.status(200).json({
      success: true,
      data: {
        stylist_id: stylist._id,
        name: stylist.name,
        certifications: stylist.certifications,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getStylistGallery = async (request, response, next) => {
  try {
    const stylist = await Stylist.findOne({ _id: request.params.id, status: 'AA' }).select('professional_gallery name');

    if (!stylist) {
      throw buildError('Stylist not found.', 'NOT_FOUND', 404);
    }

    return response.status(200).json({
      success: true,
      data: {
        stylist_id: stylist._id,
        name: stylist.name,
        professional_gallery: stylist.professional_gallery,
      },
    });
  } catch (error) {
    return next(error);
  }
};