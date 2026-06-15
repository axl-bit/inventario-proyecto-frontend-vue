<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>⌨️ Accesorios</h2>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle"></i> Nuevo Accesorio
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

        <div v-else-if="accesorios.length === 0" class="text-center py-4 text-muted">
          No hay accesorios registrados
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Activo</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="accesorio in accesorios" :key="accesorio.id">
                <td>{{ accesorio.id }}</td>
                <td>{{ accesorio.nombre }}</td>
                <td>
                  <span class="badge bg-primary">{{ accesorio.estado?.nombre }}</span>
                </td>
                <td>
                  <span :class="['badge', accesorio.activo ? 'bg-success' : 'bg-secondary']">
                    {{ accesorio.activo ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-warning me-1" @click="openModal(accesorio)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(accesorio)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div class="modal fade" id="accesorioModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Editar Accesorio' : 'Nuevo Accesorio' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAccesorio">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="form.nombre"
                  required
                  placeholder="Ej: Mouse, Teclado, Monitor..."
                />
              </div>
              <div class="mb-3">
                <label for="estado" class="form-label">Estado</label>
                <select class="form-select" id="estado" v-model="form.estadoId" required>
                  <option value="" disabled>Seleccione un estado</option>
                  <option v-for="estado in estados" :key="estado.id" :value="estado.id">
                    {{ estado.nombre }}
                  </option>
                </select>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="activo" v-model="form.activo" />
                <label class="form-check-label" for="activo">Activo</label>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import accesorioService from '../services/accesorioService';
import estadoService from '../services/estadoService';

const accesorios = ref([]);
const estados = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const editMode = ref(false);
const currentId = ref(null);

const form = ref({
  nombre: '',
  estadoId: '',
  activo: true
});

let modalInstance = null;

onMounted(async () => {
  modalInstance = new Modal(document.getElementById('accesorioModal'));
  await Promise.all([loadAccesorios(), loadEstados()]);
});

async function loadAccesorios() {
  loading.value = true;
  error.value = '';
  try {
    const response = await accesorioService.findAll();
    accesorios.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar los accesorios';
  } finally {
    loading.value = false;
  }
}

async function loadEstados() {
  try {
    const response = await estadoService.findActivos();
    estados.value = response.data;
  } catch (err) {
    console.error('Error al cargar estados', err);
  }
}

function openModal(accesorio = null) {
  editMode.value = !!accesorio;
  if (accesorio) {
    currentId.value = accesorio.id;
    form.value.nombre = accesorio.nombre;
    form.value.estadoId = accesorio.estado?.id || '';
    form.value.activo = accesorio.activo;
  } else {
    currentId.value = null;
    form.value.nombre = '';
    form.value.estadoId = '';
    form.value.activo = true;
  }
  modalInstance.show();
}

async function saveAccesorio() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    // Construir objeto con la estructura que espera el backend
    const data = {
      nombre: form.value.nombre,
      estado: { id: form.value.estadoId },
      activo: form.value.activo
    };
    if (editMode.value) {
      await accesorioService.update(currentId.value, data);
      success.value = 'Accesorio actualizado correctamente';
    } else {
      await accesorioService.create(data);
      success.value = 'Accesorio creado correctamente';
    }
    modalInstance.hide();
    await loadAccesorios();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar el accesorio';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(accesorio) {
  if (!confirm(`¿Eliminar el accesorio "${accesorio.nombre}"?`)) return;
  error.value = '';
  success.value = '';
  try {
    await accesorioService.delete(accesorio.id);
    success.value = 'Accesorio eliminado correctamente';
    await loadAccesorios();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar el accesorio';
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>