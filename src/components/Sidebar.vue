<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⚽</div>
      <div>
        <div class="logo-text">ArbDesig</div>
        <div class="logo-sub">Fútbol · Árbitros</div>
      </div>
    </div>

    <router-link
      v-for="nav in navItems"
      :key="nav.id"
      :to="nav.path"
      class="nav-item"
      active-class="active"
    >
      <i :class="['ti', nav.icon]" aria-hidden="true"></i>
      <span>{{ nav.label }}</span>
    </router-link>
  </div>
</template>

<script setup>
const navItems = [
  { id: "dashboard", path: "/", icon: "ti-dashboard", label: "Resumen" },
  { id: "canchas", path: "/canchas", icon: "ti-map-pin", label: "Canchas" },
  { id: "arbitros", path: "/arbitros", icon: "ti-users", label: "Árbitros" },
  { id: "suspensiones", path: "/suspensiones", icon: "ti-ban", label: "Suspensiones" },
  { id: "designaciones", path: "/designaciones", icon: "ti-clipboard-list", label: "Designaciones" },
  { id: "buscar", path: "/buscar", icon: "ti-search", label: "Buscador" },
  { id: "estadisticas", path: "/estadisticas", icon: "ti-chart-bar", label: "Estadísticas" },
  { id: "historico", path: "/designaciones-viejas", icon: "ti-history", label: "Historial" },
];
</script>

