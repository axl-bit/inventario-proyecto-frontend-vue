<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-body">
            <h1>🎉 Bienvenido al Dashboard</h1>
            <p>Usuario: {{ user?.username }}</p>
            <p>Email: {{ user?.email }}</p>
            <p>Rol: {{ user?.role }}</p>
            
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
  if (!user.value) {
    router.push('/login');
  }
});

const logout = () => {
  authService.logout();
  router.push('/login');
};
</script>