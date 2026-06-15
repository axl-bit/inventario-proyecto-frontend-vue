<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>🏢 Áreas</h2>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle"></i> Nueva Área
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

        <div v-else-if="areas.length === 0" class="text-center py-4 text-muted">
          No hay áreas registradas
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Sede</th>
                <th>Activo</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="area in areas" :key="area.id">
                <td>{{ area.id }}</td>
                <td>{{ area.nombre }}</td>
                <td>{{ area.sede }}</td>
                <td>
                  <span :class="['badge', area.activo ? 'bg-success' : 'bg-secondary']">
                    {{ area.activo ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-warning me-1" @click="openModal(area)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(area)">
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
    <div class="modal fade" id="areaModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Editar Área' : 'Nueva Área' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveArea">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="form.nombre"
                  required
                  placeholder="Ej: Sistemas, Recursos Humanos..."
                />
              </div>
              <div class="mb-3">
                <label for="sede" class="form-label">Sede</label>
                <input
                  type="text"
                  class="form-control"
                  id="sede"
                  v-model="form.sede"
                  placeholder="Ej: Lima, Arequipa..."
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
import areaService from '../services/areaService';

const areas = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const editMode = ref(false);
const currentId = ref(null);

const form = ref({
  nombre: '',
  sede: '',
  activo: true
});

let modalInstance = null;

onMounted(() => {
  loadAreas();
  modalInstance = new Modal(document.getElementById('areaModal'));
});

async function loadAreas() {
  loading.value = true;
  error.value = '';
  try {
    const response = await areaService.findAll();
    areas.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar las áreas';
  } finally {
    loading.value = false;
  }
}

function openModal(area = null) {
  editMode.value = !!area;
  if (area) {
    currentId.value = area.id;
    form.value.nombre = area.nombre;
    form.value.sede = area.sede;
    form.value.activo = area.activo;
  } else {
    currentId.value = null;
    form.value.nombre = '';
    form.value.sede = '';
    form.value.activo = true;
  }
  modalInstance.show();
}

async function saveArea() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const data = { ...form.value };
    if (editMode.value) {
      await areaService.update(currentId.value, data);
      success.value = 'Área actualizada correctamente';
    } else {
      await areaService.create(data);
      success.value = 'Área creada correctamente';
    }
    modalInstance.hide();
    await loadAreas();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar el área';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(area) {
  if (!confirm(`¿Eliminar el área "${area.nombre}"?`)) return;
  error.value = '';
  success.value = '';
  try {
    await areaService.delete(area.id);
    success.value = 'Área eliminada correctamente';
    await loadAreas();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar el área';
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>