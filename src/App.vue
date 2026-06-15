<template>
  <div id="app">
    <!-- Mostrar Navbar solo si está autenticado -->
    <Navbar v-if="isAuthenticated && !isGuestRoute" />
    
    <!-- Contenido de la página -->
    <main :class="{ 'mt-4': isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import authService from './services/authService';
import Navbar from './components/Navbar.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const route = useRoute();

const isAuthenticated = computed(() => authService.isAuthenticated());

const isGuestRoute = computed(() => {
  return route.meta?.guest === true;
});
</script>

<style>
body {
  background-color: #f5f5f5;
}
</style>