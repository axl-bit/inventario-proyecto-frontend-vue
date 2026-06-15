<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>💻 Tipos de Equipo</h2>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle"></i> Nuevo Tipo
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

        <div v-else-if="tipos.length === 0" class="text-center py-4 text-muted">
          No hay tipos de equipo registrados
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Móvil</th>
                <th>Activo</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tipo in tipos" :key="tipo.id">
                <td>{{ tipo.id }}</td>
                <td>{{ tipo.nombre }}</td>
                <td>
                  <span :class="['badge', tipo.esMovil ? 'bg-info' : 'bg-secondary']">
                    {{ tipo.esMovil ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', tipo.activo ? 'bg-success' : 'bg-secondary']">
                    {{ tipo.activo ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-warning me-1" @click="openModal(tipo)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(tipo)">
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
    <div class="modal fade" id="tipoEquipoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Editar Tipo' : 'Nuevo Tipo' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTipo">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="form.nombre"
                  required
                  placeholder="Ej: Laptop, Desktop, Tablet..."
                />
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="esMovil" v-model="form.esMovil" />
                <label class="form-check-label" for="esMovil">Es móvil</label>
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
import tipoEquipoService from '../services/tipoEquipoService';

const tipos = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const editMode = ref(false);
const currentId = ref(null);

const form = ref({
  nombre: '',
  esMovil: false,
  activo: true
});

let modalInstance = null;

onMounted(() => {
  loadTipos();
  modalInstance = new Modal(document.getElementById('tipoEquipoModal'));
});

async function loadTipos() {
  loading.value = true;
  error.value = '';
  try {
    const response = await tipoEquipoService.findAll();
    tipos.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar los tipos de equipo';
  } finally {
    loading.value = false;
  }
}

function openModal(tipo = null) {
  editMode.value = !!tipo;
  if (tipo) {
    currentId.value = tipo.id;
    form.value.nombre = tipo.nombre;
    form.value.esMovil = tipo.esMovil;
    form.value.activo = tipo.activo;
  } else {
    currentId.value = null;
    form.value.nombre = '';
    form.value.esMovil = false;
    form.value.activo = true;
  }
  modalInstance.show();
}

async function saveTipo() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const data = { ...form.value };
    if (editMode.value) {
      await tipoEquipoService.update(currentId.value, data);
      success.value = 'Tipo de equipo actualizado correctamente';
    } else {
      await tipoEquipoService.create(data);
      success.value = 'Tipo de equipo creado correctamente';
    }
    modalInstance.hide();
    await loadTipos();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar el tipo de equipo';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(tipo) {
  if (!confirm(`¿Eliminar el tipo "${tipo.nombre}"?`)) return;
  error.value = '';
  success.value = '';
  try {
    await tipoEquipoService.delete(tipo.id);
    success.value = 'Tipo de equipo eliminado correctamente';
    await loadTipos();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar el tipo de equipo';
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>