<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>🖥️ Equipos</h2>
      <button class="btn btn-primary" @click="openCreateModal()">
        <i class="bi bi-plus-circle"></i> Nuevo Equipo
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

    <!-- Filtros -->
    <div class="card shadow mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <input type="text" class="form-control" v-model="filtros.marca" placeholder="Marca" @input="aplicarFiltros" />
          </div>
          <div class="col-md-3">
            <input type="text" class="form-control" v-model="filtros.modelo" placeholder="Modelo" @input="aplicarFiltros" />
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filtros.empleadoId" @change="aplicarFiltros">
              <option :value="null">Todos empleados</option>
              <option v-for="emp in empleadosList" :key="emp.id" :value="emp.id">{{ emp.nombre }} {{ emp.apellido }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filtros.estadoId" @change="aplicarFiltros">
              <option :value="null">Todos estados</option>
              <option v-for="est in estadosList" :key="est.id" :value="est.id">{{ est.nombre }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filtros.tipoEquipoId" @change="aplicarFiltros">
              <option :value="null">Todos tipos</option>
              <option v-for="tipo in tiposEquipoList" :key="tipo.id" :value="tipo.id">{{ tipo.nombre }}</option>
            </select>
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

        <div v-else-if="equipos.length === 0" class="text-center py-4 text-muted">
          No hay equipos registrados
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Empleado</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Accesorios</th>
                <th>Activo</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="equipo in equipos" :key="equipo.id">
                <td>{{ equipo.id }}</td>
                <td>{{ equipo.marca }}</td>
                <td>{{ equipo.modelo }}</td>
                <td>
                  <span v-if="equipo.empleado" class="badge bg-primary">
                    {{ equipo.empleado.nombre }} {{ equipo.empleado.apellido }}
                  </span>
                  <span v-else class="text-muted">Sin asignar</span>
                </td>
                <td><span class="badge bg-secondary">{{ equipo.estado?.nombre }}</span></td>
                <td><span class="badge bg-info">{{ equipo.tipoEquipo?.nombre }}</span></td>
                <td>
                  <span v-for="acc in equipo.accesorios" :key="acc.id" class="badge bg-warning text-dark me-1">
                    {{ acc.nombre }}
                  </span>
                  <span v-if="!equipo.accesorios || equipo.accesorios.length === 0" class="text-muted">Ninguno</span>
                </td>
                <td>
                  <span :class="['badge', equipo.activo ? 'bg-success' : 'bg-secondary']">
                    {{ equipo.activo ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-primary me-1" @click="openAsignarModal(equipo)" title="Asignar empleado">
                    <i class="bi bi-person-check"></i>
                  </button>
                  <button class="btn btn-sm btn-warning me-1" @click="openEditModal(equipo)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger me-1" @click="confirmDelete(equipo)">
                    <i class="bi bi-trash"></i>
                  </button>
                  <button v-if="equipo.activo" class="btn btn-sm btn-outline-danger" @click="devolverEquipo(equipo)" title="Devolver equipo">
                    <i class="bi bi-arrow-return-left"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Equipo -->
    <div class="modal fade" id="equipoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Editar Equipo' : 'Nuevo Equipo' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEquipo">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Marca</label>
                  <input type="text" class="form-control" v-model="form.marca" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Modelo</label>
                  <input type="text" class="form-control" v-model="form.modelo" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sistema Operativo</label>
                  <input type="text" class="form-control" v-model="form.sistemaOperativo" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Procesador</label>
                  <input type="text" class="form-control" v-model="form.procesador" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">RAM</label>
                  <input type="text" class="form-control" v-model="form.ram" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Almacenamiento</label>
                  <input type="text" class="form-control" v-model="form.almacenamiento" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">IMEI</label>
                  <input type="text" class="form-control" v-model="form.imei" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Serie</label>
                  <input type="text" class="form-control" v-model="form.serie" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Observaciones</label>
                  <textarea class="form-control" v-model="form.observaciones" rows="2"></textarea>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Fecha Ingreso</label>
                  <input type="datetime-local" class="form-control" v-model="form.fechaIngreso" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Empleado</label>
                  <select class="form-select" v-model="form.empleadoId" required>
                    <option value="" disabled>Seleccione</option>
                    <option v-for="emp in empleadosList" :key="emp.id" :value="emp.id">{{ emp.nombre }} {{ emp.apellido }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Tipo Equipo</label>
                  <select class="form-select" v-model="form.tipoEquipoId" required>
                    <option value="" disabled>Seleccione</option>
                    <option v-for="tipo in tiposEquipoList" :key="tipo.id" :value="tipo.id">{{ tipo.nombre }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Estado</label>
                  <select class="form-select" v-model="form.estadoId" required>
                    <option value="" disabled>Seleccione</option>
                    <option v-for="est in estadosList" :key="est.id" :value="est.id">{{ est.nombre }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="form-check mt-4">
                    <input class="form-check-input" type="checkbox" id="renovacion" v-model="form.renovacion" />
                    <label class="form-check-label" for="renovacion">Renovación</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="activoEquipo" v-model="form.activo" />
                    <label class="form-check-label" for="activoEquipo">Activo</label>
                  </div>
                </div>

                <!-- ACCESORIOS DINÁMICOS -->
                <div class="col-12 mb-3">
                  <label class="form-label">Accesorios</label>
                  <div v-for="(acc, index) in form.accesoriosIds" :key="index" class="input-group mb-2">
                    <select class="form-select" v-model="form.accesoriosIds[index]" required>
                      <option value="" disabled>Seleccione accesorio</option>
                      <option v-for="accOption in accesoriosList" :key="accOption.id" :value="accOption.id">
                        {{ accOption.nombre }}
                      </option>
                    </select>
                    <button 
                      class="btn btn-outline-danger" 
                      type="button" 
                      @click="removeAccesorio(index)" 
                      :disabled="form.accesoriosIds.length === 1"
                      title="Eliminar accesorio"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                  <button class="btn btn-outline-primary btn-sm" type="button" @click="addAccesorio">
                    <i class="bi bi-plus"></i> Agregar accesorio
                  </button>
                </div>
              </div>
              <div class="d-grid mt-2">
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

    <!-- Modal Asignar Empleado -->
    <div class="modal fade" id="asignarModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar Empleado</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="confirmarAsignacion">
              <div class="mb-3">
                <label class="form-label">Empleado</label>
                <select class="form-select" v-model="asignar.empleadoId" required>
                  <option value="" disabled>Seleccione empleado</option>
                  <option v-for="emp in empleadosList" :key="emp.id" :value="emp.id">{{ emp.nombre }} {{ emp.apellido }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Observaciones</label>
                <textarea class="form-control" v-model="asignar.observaciones" rows="2"></textarea>
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
import equipoService from '../services/equipoService';
import empleadoService from '../services/empleadoService';
import estadoService from '../services/estadoService';
import tipoEquipoService from '../services/tipoEquipoService';
import accesorioService from '../services/accesorioService';

const equipos = ref([]);
const empleadosList = ref([]);
const estadosList = ref([]);
const tiposEquipoList = ref([]);
const accesoriosList = ref([]);
const loading = ref(false);
const saving = ref(false);
const asignando = ref(false);
const error = ref('');
const success = ref('');
const editMode = ref(false);
const currentEquipo = ref(null);

const filtros = ref({
  marca: '',
  modelo: '',
  empleadoId: null,
  estadoId: null,
  tipoEquipoId: null
});

const form = ref({
  marca: '',
  modelo: '',
  sistemaOperativo: '',
  procesador: '',
  ram: '',
  almacenamiento: '',
  imei: '',
  serie: '',
  observaciones: '',
  fechaIngreso: new Date().toISOString().slice(0, 16),
  empleadoId: '',
  tipoEquipoId: '',
  estadoId: '',
  accesoriosIds: [''], // arreglo para múltiples accesorios
  renovacion: false,
  activo: true
});

const asignar = ref({
  empleadoId: '',
  observaciones: ''
});

let modalEquipo = null;
let modalAsignar = null;

onMounted(async () => {
  modalEquipo = new Modal(document.getElementById('equipoModal'));
  modalAsignar = new Modal(document.getElementById('asignarModal'));
  await Promise.all([
    loadEquipos(),
    loadEmpleados(),
    loadEstados(),
    loadTipos(),
    loadAccesorios()
  ]);
});

async function loadEquipos() {
  loading.value = true;
  error.value = '';
  try {
    const response = await equipoService.findAll();
    equipos.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar equipos';
  } finally {
    loading.value = false;
  }
}

async function loadEmpleados() {
  try {
    const response = await empleadoService.findAll();
    empleadosList.value = response.data;
  } catch (err) { console.error(err); }
}
async function loadEstados() {
  try {
    const response = await estadoService.findActivos();
    estadosList.value = response.data;
  } catch (err) { console.error(err); }
}
async function loadTipos() {
  try {
    const response = await tipoEquipoService.findActivos();
    tiposEquipoList.value = response.data;
  } catch (err) { console.error(err); }
}
async function loadAccesorios() {
  try {
    const response = await accesorioService.findActivos();
    accesoriosList.value = response.data;
  } catch (err) { console.error(err); }
}

async function aplicarFiltros() {
  loading.value = true;
  try {
    const response = await equipoService.buscarConFiltros({
      marca: filtros.value.marca || undefined,
      modelo: filtros.value.modelo || undefined,
      empleadoId: filtros.value.empleadoId || undefined,
      estadoId: filtros.value.estadoId || undefined,
      tipoEquipoId: filtros.value.tipoEquipoId || undefined
    });
    equipos.value = response.data;
  } catch (err) {
    error.value = 'Error al filtrar equipos';
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.value = {
    marca: '',
    modelo: '',
    sistemaOperativo: '',
    procesador: '',
    ram: '',
    almacenamiento: '',
    imei: '',
    serie: '',
    observaciones: '',
    fechaIngreso: new Date().toISOString().slice(0, 16),
    empleadoId: '',
    tipoEquipoId: '',
    estadoId: '',
    accesoriosIds: [''],
    renovacion: false,
    activo: true
  };
}

function addAccesorio() {
  form.value.accesoriosIds.push('');
}

function removeAccesorio(index) {
  if (form.value.accesoriosIds.length > 1) {
    form.value.accesoriosIds.splice(index, 1);
  }
}

function openCreateModal() {
  editMode.value = false;
  currentEquipo.value = null;
  resetForm();
  modalEquipo.show();
}

function openEditModal(equipo) {
  editMode.value = true;
  currentEquipo.value = equipo;
  
  // Mapear accesorios a arreglo de IDs
  const accIds = equipo.accesorios?.map(a => a.id) || [''];
  
  form.value = {
    marca: equipo.marca,
    modelo: equipo.modelo,
    sistemaOperativo: equipo.sistemaOperativo,
    procesador: equipo.procesador,
    ram: equipo.ram,
    almacenamiento: equipo.almacenamiento,
    imei: equipo.imei,
    serie: equipo.serie,
    observaciones: equipo.observaciones,
    fechaIngreso: equipo.fechaIngreso ? equipo.fechaIngreso.slice(0, 16) : '',
    empleadoId: equipo.empleado?.id || '',
    tipoEquipoId: equipo.tipoEquipo?.id || '',
    estadoId: equipo.estado?.id || '',
    accesoriosIds: accIds.length > 0 ? accIds : [''],
    renovacion: equipo.renovacion,
    activo: equipo.activo
  };
  modalEquipo.show();
}

async function saveEquipo() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    // Construir lista de accesorios a partir de IDs (filtrar vacíos)
    const accesoriosPayload = form.value.accesoriosIds
      .filter(id => id !== '' && id !== null)
      .map(id => ({ id: id }));

    const payload = {
      marca: form.value.marca,
      modelo: form.value.modelo,
      sistemaOperativo: form.value.sistemaOperativo,
      procesador: form.value.procesador,
      ram: form.value.ram,
      almacenamiento: form.value.almacenamiento,
      imei: form.value.imei,
      serie: form.value.serie,
      observaciones: form.value.observaciones,
      fechaIngreso: form.value.fechaIngreso,
      renovacion: form.value.renovacion,
      activo: form.value.activo,
      empleado: { id: form.value.empleadoId },
      tipoEquipo: { id: form.value.tipoEquipoId },
      estado: { id: form.value.estadoId },
      accesorios: accesoriosPayload
    };
    
    if (editMode.value) {
      await equipoService.update(currentEquipo.value.id, payload);
      success.value = 'Equipo actualizado';
    } else {
      await equipoService.create(payload);
      success.value = 'Equipo creado';
    }
    modalEquipo.hide();
    await loadEquipos();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar equipo';
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(equipo) {
  if (!confirm(`¿Eliminar equipo ${equipo.marca} ${equipo.modelo}?`)) return;
  try {
    await equipoService.delete(equipo.id);
    success.value = 'Equipo eliminado';
    await loadEquipos();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar';
  }
}

function openAsignarModal(equipo) {
  currentEquipo.value = equipo;
  asignar.value.empleadoId = '';
  asignar.value.observaciones = '';
  modalAsignar.show();
}

async function confirmarAsignacion() {
  asignando.value = true;
  try {
    await equipoService.asignarEmpleado(
      currentEquipo.value.id,
      asignar.value.empleadoId,
      asignar.value.observaciones
    );
    success.value = 'Empleado asignado correctamente';
    modalAsignar.hide();
    await loadEquipos();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al asignar';
  } finally {
    asignando.value = false;
  }
}

async function devolverEquipo(equipo) {
  if (!confirm(`¿Devolver equipo ${equipo.marca} ${equipo.modelo}?`)) return;
  try {
    await equipoService.devolverEquipo(equipo.id, 'Devolución manual');
    success.value = 'Equipo devuelto correctamente';
    await loadEquipos();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al devolver';
  }
}
</script>

<style scoped>
.table th, .table td { vertical-align: middle; }
</style>