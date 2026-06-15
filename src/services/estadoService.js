import api from './api';

export default {
  findAll() {
    return api.get('/api/estados');
  },
  findActivos() {
    return api.get('/api/estados/activos');
  },
  findById(id) {
    return api.get(`/api/estados/${id}`);
  },
  create(estado) {
    return api.post('/api/estados', estado);
  },
  update(id, estado) {
    return api.put(`/api/estados/${id}`, estado);
  },
  delete(id) {
    return api.delete(`/api/estados/${id}`);
  }
};