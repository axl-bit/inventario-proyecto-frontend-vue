<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>👥 Empleados</h2>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle"></i> Nuevo Empleado
      </button>
    </div>

    <!-- Alertas -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = ''"></button>
    </div>
    <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ success }}
      <button type="button" class="btn-close" @click="success = ''"></button>
    </div>

    <!-- Tabla -->
    <div class="card shadow">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="empleados.length === 0" class="text-center py-4 text-muted">
          No hay empleados registrados
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Doc. Identidad</th>
                <th>Área</th>
                <th>Usuario</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in empleados" :key="emp.id">
                <td>{{ emp.id }}</td>
                <td>{{ emp.nombre }}</td>
                <td>{{ emp.apellido }}</td>
                <td>{{ emp.docIdentidad }}</td>
                <td>
                  <span class="badge bg-info">{{ emp.area?.nombre }}</span>
                </td>
                <td>
                  <span v-if="emp.user" class="badge bg-success">
                    {{ emp.user.username }}
                    <button class="btn-close btn-close-white ms-1" style="font-size: 0.5rem;" @click="revocarUsuario(emp)"></button>
                  </span>
                  <button v-else class="btn btn-sm btn-outline-primary" @click="openAsignarUsuario(emp)">
                    Asignar
                  </button>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-warning me-1" @click="openModal(emp)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(emp)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Formulario Empleado -->
    <div class="modal fade" id="empleadoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Editar Empleado' : 'Nuevo Empleado' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEmpleado">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="nombre" v-model="form.nombre" required />
              </div>
              <div class="mb-3">
                <label for="apellido" class="form-label">Apellido</label>
                <input type="text" class="form-control" id="apellido" v-model="form.apellido" required />
              </div>
              <div class="mb-3">
                <label for="docIdentidad" class="form-label">Doc. Identidad</label>
                <input type="text" class="form-control" id="docIdentidad" v-model="form.docIdentidad" />
              </div>
              <div class="mb-3">
                <label for="area" class="form-label">Área</label>
                <select class="form-select" id="area" v-model="form.areaId" required>
                  <option value="" disabled>Seleccione un área</option>
                  <option v-for="area in areas" :key="area.id" :value="area.id">
                    {{ area.nombre }} ({{ area.sede }})
                  </option>
                </select>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ saving ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Asignar Usuario -->
    <div class="modal fade" id="asignarUsuarioModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar Usuario a {{ empleadoSeleccionado?.nombre }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="asignarUsuario">
              <div class="mb-3">
                <label for="userId" class="form-label">Usuario</label>
                <select class="form-select" id="userId" v-model="usuarioAsignar" required>
                  <option value="" disabled>Seleccione un usuario</option>
                  <option v-for="user in usuariosDisponibles" :key="user.id" :value="user.id">
                    {{ user.username }} ({{ user.role }})
                  </option>
                </select>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="asignando">
                  <span v-if="asignando" class="spinner-border spinner-border-sm me-2"></span>
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import empleadoService from '../services/empleadoService';
import areaService from '../services/areaService';
import authService from '../services/authService';

const empleados = ref([]);
const areas = ref([]);
const usuariosDisponibles = ref([]);
const loading = ref(false);
const saving = ref(false);
const asignando = ref(false);
const error = ref('');
const success = ref('');
const editMode = ref(false);
const currentId = ref(null);
const empleadoSeleccionado = ref(null);
const usuarioAsignar = ref('');

const form = ref({
  nombre: '',
  apellido: '',
  docIdentidad: '',
  areaId: ''
});

let modalEmpleado = null;
let modalUsuario = null;

onMounted(async () => {
  modalEmpleado = new Modal(document.getElementById('empleadoModal'));
  modalUsuario = new Modal(document.getElementById('asignarUsuarioModal'));
  await Promise.all([loadEmpleados(), loadAreas()]);
});

async function loadEmpleados() {
  loading.value = true;
  error.value = '';
  try {
    const response = await empleadoService.findAll();
    empleados.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar empleados';
  } finally {
    loading.value = false;
  }
}

async function loadAreas() {
  try {
    const response = await areaService.findActivos();
    areas.value = response.data;
  } catch (err) {
    console.error('Error al cargar áreas', err);
  }
}

function openModal(empleado = null) {
  editMode.value = !!empleado;
  if (empleado) {
    currentId.value = empleado.id;
    form.value.nombre = empleado.nombre;
    form.value.apellido = empleado.apellido;
    form.value.docIdentidad = empleado.docIdentidad;
    form.value.areaId = empleado.area?.id || '';
  } else {
    currentId.value = null;
    form.value.nombre = '';
    form.value.apellido = '';
    form.value.docIdentidad = '';
    form.value.areaId = '';
  }
  modalEmpleado.show();
}

async function saveEmpleado() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const data = {
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      docIdentidad: form.value.docIdentidad,
      area: { id: form.value.areaId }
    };
    if (editMode.value) {
      await empleadoService.update(currentId.value, data);
      success.value = 'Empleado actualizado correctamente';
    } else {
      await empleadoService.create(data);
      success.value = 'Empleado creado correctamente';
    }
    modalEmpleado.hide();
    await loadEmpleados();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar el empleado';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(empleado) {
  if (!confirm(`¿Eliminar a ${empleado.nombre} ${empleado.apellido}?`)) return;
  try {
    await empleadoService.delete(empleado.id);
    success.value = 'Empleado eliminado correctamente';
    await loadEmpleados();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar el empleado';
  }
}

// Asignar usuario
function openAsignarUsuario(empleado) {
  empleadoSeleccionado.value = empleado;
  usuarioAsignar.value = '';
  cargarUsuariosDisponibles();
  modalUsuario.show();
}

async function cargarUsuariosDisponibles() {
  try {
    // Obtener usuarios del sistema (necesitarás un endpoint para esto)
    const response = await authService.getUsers(); // Asumiendo que existe
    usuariosDisponibles.value = response.data.filter(u => u.role !== 'ADMIN');
  } catch (err) {
    console.error('Error al cargar usuarios', err);
  }
}

async function asignarUsuario() {
  if (!usuarioAsignar.value || !empleadoSeleccionado.value) return;
  asignando.value = true;
  try {
    await empleadoService.asignarUsuario(empleadoSeleccionado.value.id, usuarioAsignar.value);
    success.value = 'Usuario asignado correctamente';
    modalUsuario.hide();
    await loadEmpleados();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al asignar usuario';
  } finally {
    asignando.value = false;
  }
}

async function revocarUsuario(empleado) {
  if (!confirm(`¿Revocar acceso a ${empleado.user.username}?`)) return;
  try {
    await empleadoService.revocarUsuario(empleado.id);
    success.value = 'Usuario revocado correctamente';
    await loadEmpleados();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al revocar usuario';
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
.btn-close-white {
  filter: invert(1);
}
</style>