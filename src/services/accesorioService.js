import api from './api';

export default {
  findAll() {
    return api.get('/api/accesorios');
  },
  findActivos() {
    return api.get('/api/accesorios/activos');
  },
  findById(id) {
    return api.get(`/api/accesorios/${id}`);
  },
  findByEstado(estadoId) {
    return api.get(`/api/accesorios/estado/${estadoId}`);
  },
  create(accesorio) {
    return api.post('/api/accesorios', accesorio);
  },
  update(id, accesorio) {
    return api.put(`/api/accesorios/${id}`, accesorio);
  },
  delete(id) {
    return api.delete(`/api/accesorios/${id}`);
  }
};