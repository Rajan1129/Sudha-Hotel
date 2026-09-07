import client from './client';

export const login = (username, password) => client.post('/auth/login', { username, password }).then((r) => r.data);
export const fetchMe = () => client.get('/auth/me').then((r) => r.data);
