import client from './client';

export const fetchReviews = () => client.get('/reviews').then((r) => r.data);
export const submitReview = (payload) => client.post('/reviews', payload).then((r) => r.data);
export const fetchAllReviews = () => client.get('/reviews/admin').then((r) => r.data);
export const approveReview = (id) => client.put(`/reviews/${id}/approve`).then((r) => r.data);
export const deleteReview = (id) => client.delete(`/reviews/${id}`).then((r) => r.data);
