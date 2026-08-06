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
        <span
          v-if="nav.id === 'notificaciones' && unreadNotificationsCount > 0"
          class="badge-notification"
        >
          {{ unreadNotificationsCount }}
        </span>
      </router-link>
    </div>

    <!-- Temporary Notification Alert Box -->
    <div
      v-if="state.sidebarNotifications && state.sidebarNotifications.length > 0"
      class="sidebar-temp-notifications"
    >
      <div
        v-for="notif in state.sidebarNotifications"
        :key="notif.id"
        :class="['sidebar-temp-notif-card', `notif-${notif.type}`]"
      >
        <div class="sidebar-temp-notif-header">
          <i :class="['ti', getNotifIcon(notif.type)]"></i>
          <span class="sidebar-temp-notif-title">Notificación</span>
        </div>
        <div class="sidebar-temp-notif-body">
          {{ notif.message }}
        </div>
      </div>
    </div>

    <div class="mt-auto pt-4 border-t border-gray-200">
      <!-- Demo Mode indicator -->
      <div class="demo-sidebar-card">
        <span class="demo-pulse-green"></span>
        <div class="demo-card-content">
          <span class="demo-card-title">Modo Demo</span>
          <span class="demo-card-desc">Datos locales de prueba</span>
        </div>
      </div>

      <a href="#" @click.prevent="handleLogout" class="nav-item text-red-600 hover:text-red-700 hover:bg-red-50">
        <i class="ti ti-logout" aria-hidden="true"></i>
        <span>Cerrar Sesión</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { logoutUser, unreadNotificationsCount, state } from '../store';

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
  { id: "notificaciones", path: "/notificaciones", icon: "ti-bell", label: "Notificaciones" },
  { id: "buscar", path: "/buscar", icon: "ti-search", label: "Buscador" },
  { id: "estadisticas", path: "/estadisticas", icon: "ti-chart-bar", label: "Estadísticas" },
  { id: "historico", path: "/designaciones-viejas", icon: "ti-history", label: "Historial" },
];

const handleLogout = async () => {
  emit("close");
  await logoutUser();
};

const getNotifIcon = (type) => {
  switch (type) {
    case "success":
      return "ti-circle-check";
    case "warning":
      return "ti-alert-triangle";
    case "error":
      return "ti-circle-x";
    case "info":
    default:
      return "ti-info-circle";
  }
};
</script>

<style scoped>
.demo-sidebar-card {
  background-color: rgba(16, 185, 129, 0.08); /* emerald-500 tint */
  border: 1px dashed rgba(16, 185, 129, 0.25);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 0.75rem 0.75rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.demo-pulse-green {
  width: 8px;
  height: 8px;
  background-color: #10b981; /* emerald-500 */
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-green 1.6s infinite;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.demo-card-content {
  display: flex;
  flex-direction: column;
}

.demo-card-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #065f46; /* emerald-800 */
  line-height: 1.2;
}

.demo-card-desc {
  font-size: 0.65rem;
  font-weight: 500;
  color: #047857; /* emerald-700 */
  line-height: 1.2;
}
</style>


