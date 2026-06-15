import api from './api';

export default {
  findAll() {
    return api.get('/api/empleados');
  },
  findById(id) {
    return api.get(`/api/empleados/${id}`);
  },
  findByArea(areaId) {
    return api.get(`/api/empleados/area/${areaId}`);
  },
  findConAcceso() {
    return api.get('/api/empleados/con-acceso');
  },
  findSinAcceso() {
    return api.get('/api/empleados/sin-acceso');
  },
  create(empleado) {
    return api.post('/api/empleados', empleado);
  },
  update(id, empleado) {
    return api.put(`/api/empleados/${id}`, empleado);
  },
  delete(id) {
    return api.delete(`/api/empleados/${id}`);
  },
  asignarUsuario(empleadoId, userId) {
    return api.put(`/api/empleados/${empleadoId}/asignar-usuario/${userId}`);
  },
  revocarUsuario(empleadoId) {
    return api.put(`/api/empleados/${empleadoId}/revocar-usuario`);
  }
};