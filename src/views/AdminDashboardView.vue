<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-body">
            <h1>🛡️ Panel de Administrador</h1>
            <p>Bienvenido, {{ user?.username }} ({{ user?.role }})</p>
            
            <div class="mt-4">
              <h3>Acciones rápidas:</h3>
              <div class="d-grid gap-2 d-md-block">
                <button class="btn btn-primary me-2">Gestionar Usuarios</button>
                <button class="btn btn-info me-2">Ver Productos</button>
                <button class="btn btn-success">Reportes</button>
              </div>
            </div>

            <hr>

            <button @click="logout" class="btn btn-danger">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const router = useRouter();
const user = ref(null);

onMounted(() => {
  user.value = authService.getCurrentUser();
});

const logout = () => {
  authService.logout();
  router.push('/login');
};
</script>