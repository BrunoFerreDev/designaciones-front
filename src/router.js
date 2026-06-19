import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import Canchas from './views/Canchas.vue';
import Arbitros from './views/Arbitros.vue';
import Suspensiones from './views/Suspensiones.vue';
import Designaciones from './views/Designaciones.vue';
import BuscarDesignaciones from './views/BuscarDesignaciones.vue';
import DesignacionesViejas from './views/DesignacionesViejas.vue';
import Estadisticas from './views/Estadisticas.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/estadisticas',
    name: 'estadisticas',
    component: Estadisticas
  },
  {
    path: '/canchas',
    name: 'canchas',
    component: Canchas
  },
  {
    path: '/arbitros',
    name: 'arbitros',
    component: Arbitros
  },
  {
    path: '/suspensiones',
    name: 'suspensiones',
    component: Suspensiones
  },
  {
    path: '/designaciones',
    name: 'designaciones',
    component: Designaciones
  },
  {
    path: '/buscar',
    name: 'buscar',
    component: BuscarDesignaciones
  },
  {
    path: '/designaciones-viejas',
    name: 'designaciones-viejas',
    component: DesignacionesViejas
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

export default router;
