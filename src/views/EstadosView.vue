<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>📋 Estados</h2>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle"></i> Nuevo Estado
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

        <div v-else-if="estados.length === 0" class="text-center py-4 text-muted">
          No hay estados registrados
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Activo</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="estado in estados" :key="estado.id">
                <td>{{ estado.id }}</td>
                <td>{{ estado.nombre }}</td>
                <td>
                  <span :class="['badge', estado.activo ? 'bg-success' : 'bg-secondary']">
                    {{ estado.activo ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-warning me-1" @click="openModal(estado)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(estado)">
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
    <div class="modal fade" id="estadoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Editar Estado' : 'Nuevo Estado' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEstado">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="form.nombre"
                  required
                  placeholder="Ej: Activo, En reparación..."
                />
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
import estadoService from '../services/estadoService';

const estados = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const editMode = ref(false);
const currentId = ref(null);

const form = ref({
  nombre: '',
  activo: true
});

let modalInstance = null;

onMounted(() => {
  loadEstados();
  modalInstance = new Modal(document.getElementById('estadoModal'));
});

async function loadEstados() {
  loading.value = true;
  error.value = '';
  try {
    const response = await estadoService.findAll();
    estados.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar los estados';
  } finally {
    loading.value = false;
  }
}

function openModal(estado = null) {
  editMode.value = !!estado;
  if (estado) {
    currentId.value = estado.id;
    form.value.nombre = estado.nombre;
    form.value.activo = estado.activo;
  } else {
    currentId.value = null;
    form.value.nombre = '';
    form.value.activo = true;
  }
  modalInstance.show();
}

async function saveEstado() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const data = { ...form.value };
    if (editMode.value) {
      await estadoService.update(currentId.value, data);
      success.value = 'Estado actualizado correctamente';
    } else {
      await estadoService.create(data);
      success.value = 'Estado creado correctamente';
    }
    modalInstance.hide();
    await loadEstados();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar el estado';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(estado) {
  if (!confirm(`¿Eliminar el estado "${estado.nombre}"?`)) return;
  error.value = '';
  success.value = '';
  try {
    await estadoService.delete(estado.id);
    success.value = 'Estado eliminado correctamente';
    await loadEstados();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar el estado';
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>