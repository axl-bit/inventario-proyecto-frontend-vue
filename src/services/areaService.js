import api from './api';

export default {
  findAll() {
    return api.get('/api/areas');
  },
  findActivos() {
    return api.get('/api/areas/activos');
  },
  findById(id) {
    return api.get(`/api/areas/${id}`);
  },
  findBySede(sede) {
    return api.get(`/api/areas/sede/${sede}`);
  },
  create(area) {
    return api.post('/api/areas', area);
  },
  update(id, area) {
    return api.put(`/api/areas/${id}`, area);
  },
  delete(id) {
    return api.delete(`/api/areas/${id}`);
  }
};