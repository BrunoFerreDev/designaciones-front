import { createRouter, createWebHistory } from 'vue-router';
import { state } from './store/state';
import Dashboard from './views/Dashboard.vue';
import Canchas from './views/Canchas.vue';
import Arbitros from './views/Arbitros.vue';
import Suspensiones from './views/Suspensiones.vue';
import Designaciones from './views/Designaciones.vue';
import BuscarDesignaciones from './views/BuscarDesignaciones.vue';
import DesignacionesViejas from './views/DesignacionesViejas.vue';
import Estadisticas from './views/Estadisticas.vue';
import Comparador from './views/Comparador.vue';
import Login from './views/Login.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/estadisticas',
    name: 'estadisticas',
    component: Estadisticas,
    meta: { requiresAuth: true }
  },
  {
    path: '/comparador',
    name: 'comparador',
    component: Comparador,
    meta: { requiresAuth: true }
  },
  {
    path: '/canchas',
    name: 'canchas',
    component: Canchas,
    meta: { requiresAuth: true }
  },
  {
    path: '/arbitros',
    name: 'arbitros',
    component: Arbitros,
    meta: { requiresAuth: true }
  },
  {
    path: '/arbitros/:id/estadisticas',
    redirect: to => ({ path: '/estadisticas', query: { arbitro: to.params.id } })
  },
  {
    path: '/suspensiones',
    name: 'suspensiones',
    component: Suspensiones,
    meta: { requiresAuth: true }
  },
  {
    path: '/designaciones',
    name: 'designaciones',
    component: Designaciones,
    meta: { requiresAuth: true }
  },
  {
    path: '/buscar',
    name: 'buscar',
    component: BuscarDesignaciones,
    meta: { requiresAuth: true }
  },
  {
    path: '/designaciones-viejas',
    name: 'designaciones-viejas',
    component: DesignacionesViejas,
    meta: { requiresAuth: true }
  },
  // Redireccionar cualquier otra ruta al dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !state.isAuthenticated) {
    next('/login');
  } else if (to.name === 'login' && state.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
