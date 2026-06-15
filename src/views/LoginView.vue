<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="text-center mb-4">🔐 Iniciar Sesión</h2>
            
            <!-- Mensaje de error -->
            <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ error }}
              <button type="button" class="btn-close" @click="error = ''"></button>
            </div>

            <!-- Mensaje de éxito -->
            <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
              {{ success }}
              <button type="button" class="btn-close" @click="success = ''"></button>
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Usuario</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username"
                  v-model="username"
                  placeholder="Ingresa tu usuario"
                  required
                  autocomplete="username"
                >
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  v-model="password"
                  placeholder="Ingresa tu contraseña"
                  required
                  autocomplete="current-password"
                >
              </div>

              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <p>
                ¿No tienes cuenta? 
                <router-link to="/register">Regístrate aquí</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    const response = await authService.login(username.value, password.value);
    
    if (response.success) {
      success.value = response.message;
      
      // Redirigir según el rol
      setTimeout(() => {
        switch (response.role) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'MANAGER':
            router.push('/manager/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }, 1000);
    } else {
      error.value = response.message || 'Error al iniciar sesión';
    }
  } catch (err) {
    if (err.response) {
      error.value = err.response.data?.message || 'Credenciales inválidas';
    } else {
      error.value = 'Error de conexión con el servidor';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 15px;
}

.card-body {
  padding: 2rem;
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
  padding: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  transform: translateY(-1px);
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>