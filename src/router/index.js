import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/authService';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/estados',
    name: 'Estados',
    component: () => import('../views/EstadosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/areas',
    name: 'Areas',
    component: () => import('../views/AreasView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tipos-equipo',
    name: 'TiposEquipo',
    component: () => import('../views/TiposEquipoView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accesorios',
    name: 'Accesorios',
    component: () => import('../views/AccesoriosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/empleados',
    name: 'Empleados',
    component: () => import('../views/EmpleadosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/equipos',
    name: 'Equipos',
    component: () => import('../views/EquiposView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/historial',
    name: 'Historial',
    component: () => import('../views/HistorialView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;