import client from './client';

export const fetchRooms = (params = {}) => client.get('/rooms', { params }).then((r) => r.data);
export const fetchRoom = (id, params = {}) => client.get(`/rooms/${id}`, { params }).then((r) => r.data);
export const createRoom = (payload) => client.post('/rooms', payload).then((r) => r.data);
export const updateRoom = (id, payload) => client.put(`/rooms/${id}`, payload).then((r) => r.data);
export const deleteRoom = (id) => client.delete(`/rooms/${id}`).then((r) => r.data);
