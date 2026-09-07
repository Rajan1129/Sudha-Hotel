import client from './client';

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return client
    .post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const uploadMultipleFiles = (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  return client
    .post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
