import client from './client';

export const fetchMenu = () => client.get('/menu').then((r) => r.data);
export const createMenuItem = (payload) => client.post('/menu', payload).then((r) => r.data);
export const updateMenuItem = (id, payload) => client.put(`/menu/${id}`, payload).then((r) => r.data);
export const deleteMenuItem = (id) => client.delete(`/menu/${id}`).then((r) => r.data);
