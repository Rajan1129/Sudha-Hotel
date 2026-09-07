import client from './client';

export const createInquiry = (payload) => client.post('/inquiries', payload).then((r) => r.data);
export const fetchInquiries = () => client.get('/inquiries').then((r) => r.data);
export const resolveInquiry = (id) => client.put(`/inquiries/${id}/resolve`).then((r) => r.data);
export const deleteInquiry = (id) => client.delete(`/inquiries/${id}`).then((r) => r.data);
export const clearAllInquiries = () => client.delete('/inquiries/clear-all').then((r) => r.data);
