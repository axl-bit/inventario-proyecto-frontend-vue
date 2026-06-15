import api from './api';

export default {
  findAll() {
    return api.get('/api/tipos-equipo');
  },
  findActivos() {
    return api.get('/api/tipos-equipo/activos');
  },
  findById(id) {
    return api.get(`/api/tipos-equipo/${id}`);
  },
  create(tipoEquipo) {
    return api.post('/api/tipos-equipo', tipoEquipo);
  },
  update(id, tipoEquipo) {
    return api.put(`/api/tipos-equipo/${id}`, tipoEquipo);
  },
  delete(id) {
    return api.delete(`/api/tipos-equipo/${id}`);
  }
};