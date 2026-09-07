import client from './client';

export const quoteBooking = (payload) => client.post('/bookings/quote', payload).then((r) => r.data);
export const createBooking = (payload) => client.post('/bookings', payload).then((r) => r.data);
export const confirmPayment = (id, payload) =>
  client.post(`/bookings/${id}/confirm-payment`, payload).then((r) => r.data);
export const fetchBooking = (id) => client.get(`/bookings/${id}`).then((r) => r.data);
export const fetchBookings = (params = {}) => client.get('/bookings', { params }).then((r) => r.data);
export const updateBookingStatus = (id, payload) =>
  client.put(`/bookings/${id}/status`, payload).then((r) => r.data);
export const deleteBooking = (id) => client.delete(`/bookings/${id}`).then((r) => r.data);
