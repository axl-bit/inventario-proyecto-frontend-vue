<template>
  <div class="container-fluid">
    <h2 class="mb-4">📋 Historial de Asignaciones</h2>

    <!-- Alertas -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = ''"></button>
    </div>

    <!-- Filtros -->
    <div class="card shadow mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-5">
            <label class="form-label">Por Equipo</label>
            <select class="form-select" v-model="filtroEquipoId" @change="buscarPorEquipo">
              <option :value="null">-- Todos los equipos --</option>
              <option v-for="eq in equiposList" :key="eq.id" :value="eq.id">
                {{ eq.marca }} {{ eq.modelo }} (ID: {{ eq.id }})
              </option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label">Por Empleado</label>
            <select class="form-select" v-model="filtroEmpleadoId" @change="buscarPorEmpleado">
              <option :value="null">-- Todos los empleados --</option>
              <option v-for="emp in empleadosList" :key="emp.id" :value="emp.id">
                {{ emp.nombre }} {{ emp.apellido }} ({{ emp.docIdentidad }})
              </option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100" @click="limpiarFiltros">
              <i class="bi bi-x-circle"></i> Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card shadow">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="historial.length === 0" class="text-center py-4 text-muted">
          No se encontraron registros de asignación.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Equipo</th>
                <th>Empleado</th>
                <th>Fec. Asignación</th>
                <th>Fec. Devolución</th>
                <th>Observaciones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historial" :key="h.id">
                <td>{{ h.id }}</td>
                <td>{{ h.equipo?.marca }} {{ h.equipo?.modelo }}</td>
                <td>{{ h.empleado?.nombre }} {{ h.empleado?.apellido }}</td>
                <td>{{ formatearFecha(h.fechaAsignacion) }}</td>
                <td>{{ h.fechaDevolucion ? formatearFecha(h.fechaDevolucion) : '—' }}</td>
                <td>{{ h.observaciones || 'Sin observaciones' }}</td>
                <td>
                  <span v-if="!h.fechaDevolucion" class="badge bg-success">Activo</span>
                  <span v-else class="badge bg-secondary">Devuelto</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import historialService from '../services/historialService';
import equipoService from '../services/equipoService';
import empleadoService from '../services/empleadoService';

const historial = ref([]);
const equiposList = ref([]);
const empleadosList = ref([]);
const loading = ref(false);
const error = ref('');

const filtroEquipoId = ref(null);
const filtroEmpleadoId = ref(null);

onMounted(async () => {
  await Promise.all([
    cargarEquipos(),
    cargarEmpleados(),
    // Cargar historial general inicialmente
    cargarTodoHistorial()
  ]);
});

async function cargarEquipos() {
  try {
    const response = await equipoService.findAll();
    equiposList.value = response.data;
  } catch (err) {
    console.error('Error al cargar equipos', err);
  }
}

async function cargarEmpleados() {
  try {
    const response = await empleadoService.findAll();
    empleadosList.value = response.data;
  } catch (err) {
    console.error('Error al cargar empleados', err);
  }
}

// Carga inicial: como no tenemos un endpoint general, mostramos todo haciendo peticiones separadas (poco eficiente)
// Idealmente crearías un endpoint GET /api/historial que devuelva todo el historial.
// Por ahora simulamos trayendo todos los equipos y sus historiales (no recomendado para producción)
// Pero la API actual solo soporta filtrar por equipo o empleado.
// Solución: Dejar vacío hasta que se seleccione un filtro, o agregar un endpoint.
// Para que sea útil, mostraremos un mensaje si no hay filtros.
// NOTA: Se necesita un endpoint general en backend. Lo crearemos rápidamente.

async function cargarTodoHistorial() {
  // Como no existe un endpoint general, no cargamos nada hasta que se aplique un filtro.
  // O podemos agregar el endpoint en backend. (Ver abajo)
  historial.value = [];
}

async function buscarPorEquipo() {
  if (!filtroEquipoId.value) {
    historial.value = [];
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const response = await historialService.findByEquipo(filtroEquipoId.value);
    historial.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar historial del equipo';
    historial.value = [];
  } finally {
    loading.value = false;
  }
}

async function buscarPorEmpleado() {
  if (!filtroEmpleadoId.value) {
    historial.value = [];
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const response = await historialService.findByEmpleado(filtroEmpleadoId.value);
    historial.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar historial del empleado';
    historial.value = [];
  } finally {
    loading.value = false;
  }
}

function limpiarFiltros() {
  filtroEquipoId.value = null;
  filtroEmpleadoId.value = null;
  historial.value = [];
}

function formatearFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>