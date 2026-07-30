<template>
  <div :class="['sidebar', { 'open': isOpen }]">
    <div class="sidebar-logo">
      <div class="logo-icon">⚽</div>
      <div>
        <div class="logo-text">ArbDesig</div>
        <div class="logo-sub">Fútbol · Árbitros</div>
      </div>
    </div>

    <div class="nav-items-container">
      <router-link
        v-for="nav in navItems"
        :key="nav.id"
        :to="nav.path"
        class="nav-item"
        active-class="active"
        @click="$emit('close')"
      >
        <i :class="['ti', nav.icon]" aria-hidden="true"></i>
        <span>{{ nav.label }}</span>
      </router-link>
    </div>

    <div class="mt-auto pt-4 border-t border-gray-200">
      <a href="#" @click.prevent="handleLogout" class="nav-item text-red-600 hover:text-red-700 hover:bg-red-50">
        <i class="ti ti-logout" aria-hidden="true"></i>
        <span>Cerrar Sesión</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { logoutUser } from '../store';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const navItems = [
  { id: "arbitros", path: "/arbitros", icon: "ti-users", label: "Árbitros" },
  { id: "canchas", path: "/canchas", icon: "ti-map-pin", label: "Canchas" },
  { id: "suspensiones", path: "/suspensiones", icon: "ti-ban", label: "Suspensiones" },
  { id: "designaciones", path: "/designaciones", icon: "ti-clipboard-list", label: "Designaciones" },
  { id: "buscar", path: "/buscar", icon: "ti-search", label: "Buscador" },
  { id: "estadisticas", path: "/estadisticas", icon: "ti-chart-bar", label: "Estadísticas" },
  { id: "historico", path: "/designaciones-viejas", icon: "ti-history", label: "Historial" },
];

const handleLogout = async () => {
  emit("close");
  await logoutUser();
};
</script>


