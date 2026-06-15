<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link class="navbar-brand" to="/dashboard">📦 Inventario</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
          
          <!-- Dropdown controlado por Vue -->
          <li class="nav-item dropdown" ref="dropdownLi">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              ref="dropdownToggle"
              @click.prevent="toggleDropdown"
            >
              Catálogos
            </a>
            <ul class="dropdown-menu" ref="dropdownMenu">
              <li><router-link class="dropdown-item" to="/estados">Estados</router-link></li>
              <li><router-link class="dropdown-item" to="/areas">Áreas</router-link></li>
              <li><router-link class="dropdown-item" to="/tipos-equipo">Tipos de Equipo</router-link></li>
              <li><router-link class="dropdown-item" to="/accesorios">Accesorios</router-link></li>
            </ul>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" to="/empleados">Empleados</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/equipos">Equipos</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/historial">Historial</router-link>
          </li>
        </ul>
        <div class="d-flex">
          <span class="navbar-text me-3">
            {{ user?.username }} ({{ user?.role }})
          </span>
          <button class="btn btn-outline-light btn-sm" @click="logout">Salir</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import * as bootstrap from 'bootstrap';

const router = useRouter();
const user = ref(null);

const dropdownLi = ref(null);
const dropdownToggle = ref(null);
const dropdownMenu = ref(null);
let dropdownInstance = null;

onMounted(() => {
  user.value = authService.getCurrentUser();

  // Crear instancia del dropdown manualmente
  if (dropdownToggle.value) {
    dropdownInstance = new bootstrap.Dropdown(dropdownToggle.value, {
      popperConfig: {
        strategy: 'fixed'
      }
    });
  }

  // Cerrar el dropdown al hacer clic en un elemento del menú
  dropdownMenu.value?.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  // Destruir la instancia
  dropdownInstance?.dispose();
  dropdownMenu.value?.removeEventListener('click', closeDropdown);
});

function toggleDropdown() {
  dropdownInstance?.toggle();
}

function closeDropdown() {
  dropdownInstance?.hide();
}

const logout = () => {
  authService.logout();
  router.push('/login');
};
</script>