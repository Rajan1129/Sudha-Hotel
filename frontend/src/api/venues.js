import client from './client';

export const fetchVenues = () => client.get('/venues').then((r) => r.data);
export const fetchVenuesAdmin = () => client.get('/venues/admin').then((r) => r.data);
export const createVenue = (payload) => client.post('/venues', payload).then((r) => r.data);
export const updateVenue = (id, payload) => client.put(`/venues/${id}`, payload).then((r) => r.data);
export const deleteVenue = (id) => client.delete(`/venues/${id}`).then((r) => r.data);
