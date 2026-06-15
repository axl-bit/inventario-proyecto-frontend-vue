import api from './api';

export default {
  findByEquipo(equipoId) {
    return api.get(`/api/historial/equipo/${equipoId}`);
  },
  findByEmpleado(empleadoId) {
    return api.get(`/api/historial/empleado/${empleadoId}`);
  },
  findActivosByEmpleado(empleadoId) {
    return api.get(`/api/historial/empleado/${empleadoId}/activos`);
  }
};