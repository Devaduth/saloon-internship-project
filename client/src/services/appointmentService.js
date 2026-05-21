import apiClient from '../api/axios';

export const createAppointment = async (payload) => {
  const response = await apiClient.post('/appointments', payload);
  return response.data;
};
