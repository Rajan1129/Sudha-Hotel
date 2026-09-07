import client from './client';

export async function fetchGallery(params = {}) {
  const { data } = await client.get('/gallery', { params });
  return data;
}

export async function createGalleryItem(payload) {
  const { data } = await client.post('/gallery', payload);
  return data;
}

export async function deleteGalleryItem(id) {
  const { data } = await client.delete(`/gallery/${id}`);
  return data;
}
