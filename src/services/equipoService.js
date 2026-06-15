import api from './api';

export default {
  findAll() {
    return api.get('/api/equipos');
  },
  findActivos() {
    return api.get('/api/equipos/activos');
  },
  findById(id) {
    return api.get(`/api/equipos/${id}`);
  },
  findByEmpleado(empleadoId) {
    return api.get(`/api/equipos/empleado/${empleadoId}`);
  },
  findByEstado(estadoId) {
    return api.get(`/api/equipos/estado/${estadoId}`);
  },
  findByTipo(tipoEquipoId) {
    return api.get(`/api/equipos/tipo/${tipoEquipoId}`);
  },
  buscarConFiltros(filtros) {
    return api.get('/api/equipos/buscar', { params: filtros });
  },
  create(equipo) {
    return api.post('/api/equipos', equipo);
  },
  update(id, equipo) {
    return api.put(`/api/equipos/${id}`, equipo);
  },
  delete(id) {
    return api.delete(`/api/equipos/${id}`);
  },
  asignarEmpleado(equipoId, empleadoId, observaciones) {
    return api.put(`/api/equipos/${equipoId}/asignar/${empleadoId}`, { observaciones });
  },
  devolverEquipo(equipoId, observaciones) {
    return api.put(`/api/equipos/${equipoId}/devolver`, { observaciones });
  }
};