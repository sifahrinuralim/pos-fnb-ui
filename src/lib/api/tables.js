import api from '$lib/services/api';

export const createTable = (data) => api.post('/tables', data);
export const listTables = (status, skip = 0, limit = 50) => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  return api.get(`/tables?${params.toString()}`);
};
export const getTable = (id) => api.get(`/tables/${id}`);
export const updateTable = (id, data) => api.patch(`/tables/${id}`, data);
export const deleteTable = (id) => api.delete(`/tables/${id}`);
