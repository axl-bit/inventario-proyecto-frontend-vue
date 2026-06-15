<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="text-center mb-4">📝 Crear Cuenta</h2>
            
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

            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="firstName" class="form-label">Nombre</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="firstName"
                  v-model="firstName"
                  placeholder="Ingresa tu nombre"
                  required
                >
              </div>

              <div class="mb-3">
                <label for="lastName" class="form-label">Apellido</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="lastName"
                  v-model="lastName"
                  placeholder="Ingresa tu apellido"
                  required
                >
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email"
                  v-model="email"
                  placeholder="ejemplo@correo.com"
                  required
                >
              </div>

              <div class="mb-3">
                <label for="username" class="form-label">Usuario</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username"
                  v-model="username"
                  placeholder="Elige un nombre de usuario"
                  required
                >
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  v-model="password"
                  placeholder="Crea una contraseña segura"
                  required
                  minlength="6"
                >
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="confirmPassword"
                  v-model="confirmPassword"
                  placeholder="Repite tu contraseña"
                  required
                  minlength="6"
                >
              </div>

              <div class="mb-3">
                <label for="role" class="form-label">Rol</label>
                <select class="form-select" id="role" v-model="role">
                  <option value="USER">Usuario</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-success btn-lg"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <p>
                ¿Ya tienes cuenta? 
                <router-link to="/login">Inicia sesión aquí</router-link>
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

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('USER');
const error = ref('');
const success = ref('');
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';
  success.value = '';

  // Validaciones
  if (!firstName.value || !lastName.value || !email.value || !username.value || !password.value) {
    error.value = 'Todos los campos son obligatorios';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  loading.value = true;

  try {
    const userData = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      username: username.value,
      password: password.value,
      role: role.value
    };

    const response = await authService.register(userData);

    if (response.success) {
      success.value = '¡Registro exitoso! Redirigiendo...';
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      error.value = response.message || 'Error al registrarse';
    }
  } catch (err) {
    if (err.response) {
      error.value = err.response.data?.message || 'Error en el registro';
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

.btn-success {
  padding: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-success:hover {
  transform: translateY(-1px);
}

.form-control:focus, .form-select:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
}
</style>