<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Notificaciones</div>
        <div class="topbar-sub">
          {{ unreadCount }} por leer · {{ state.notifications?.length || 0 }} en total
        </div>
      </div>
      <div class="topbar-actions" v-if="state.notifications && state.notifications.length > 0">
        <button class="btn secondary" @click="markAllAsRead" title="Marcar todas como leídas">
          <i class="ti ti-check-all"></i> Marcar todas leídas
        </button>
        <button class="btn danger-outline" @click="clearAllNotifications" title="Limpiar todas las notificaciones">
          <i class="ti ti-trash"></i> Limpiar historial
        </button>
      </div>
    </div>

    <div class="content">
      <!-- Empty State -->
      <div v-if="!state.notifications || state.notifications.length === 0" class="empty-state notification-empty">
        <div class="empty-icon-wrapper">
          <div class="pulse-ring"></div>
          <i class="ti ti-bell-off text-emerald-500" style="font-size: 42px;"></i>
        </div>
        <h3 class="empty-title">Tu campo de juego está al día</h3>
        <p class="empty-desc">No tienes notificaciones pendientes. Te avisaremos cuando ocurra algo importante.</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="notifications-list">
        <div
          v-for="item in state.notifications"
          :key="item.id"
          :class="['notification-item-card', `notif-${item.type}`, { 'unread': !item.read }]"
          @click="handleCardClick(item)"
        >
          <!-- Unread Dot Indicator -->
          <div v-if="!item.read" class="unread-indicator" title="Sin leer"></div>

          <!-- Icon wrapper with dynamic background -->
          <div :class="['notif-icon-container', `notif-icon-${item.type}`]">
            <i :class="['ti', getIcon(item.type)]"></i>
          </div>

          <!-- Notification Details -->
          <div class="notif-body">
            <div class="notif-header">
              <span class="notif-title">{{ item.title }}</span>
              <span class="notif-time" :title="formatFullDate(item.timestamp)">
                {{ formatTimeAgo(item.timestamp) }}
              </span>
            </div>
            <p class="notif-message">{{ item.message }}</p>
          </div>

          <!-- Action buttons for card -->
          <div class="notif-actions" @click.stop>
            <button
              v-if="!item.read"
              class="btn-icon-only text-emerald-600 hover:bg-emerald-50"
              @click="markAsRead(item.id)"
              title="Marcar como leída"
            >
              <i class="ti ti-check"></i>
            </button>
            <button
              class="btn-icon-only text-red-500 hover:bg-red-50"
              @click="deleteNotification(item.id)"
              title="Eliminar notificación"
            >
              <i class="ti ti-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  state,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  unreadNotificationsCount
} from "../store";

const unreadCount = computed(() => unreadNotificationsCount.value);

const getIcon = (type) => {
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

const formatFullDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 10) return "ahora mismo";
  if (diffSec < 60) return `hace ${diffSec} seg`;
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs} hs`;
  return `hace ${diffDays} d`;
};

const handleCardClick = (item) => {
  if (!item.read) {
    markAsRead(item.id);
  }
};
</script>

<style scoped>
.topbar-actions {
  display: flex;
  gap: 10px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.notification-item-card {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border-left: 5px solid #cbd5e1;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
}

.notification-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.notification-item-card.unread {
  background: #f8fafc;
}

/* Colors by type */
.notification-item-card.notif-success {
  border-left-color: #10b981;
}
.notification-item-card.notif-info {
  border-left-color: #3b82f6;
}
.notification-item-card.notif-warning {
  border-left-color: #f59e0b;
}
.notification-item-card.notif-error {
  border-left-color: #ef4444;
}

/* Unread indicator dot */
.unread-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
}

/* Icon layout */
.notif-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 20px;
  flex-shrink: 0;
}

.notif-icon-success {
  background: #d1fae5;
  color: #10b981;
}
.notif-icon-info {
  background: #dbeafe;
  color: #3b82f6;
}
.notif-icon-warning {
  background: #fef3c7;
  color: #d97706;
}
.notif-icon-error {
  background: #fee2e2;
  color: #ef4444;
}

/* Text body */
.notif-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* for text wrapping and ellipsis */
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.notif-title {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
}

.unread .notif-title {
  color: #0f172a;
}

.notif-time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.notif-message {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

.unread .notif-message {
  color: #334155;
  font-weight: 500;
}

/* Card action buttons */
.notif-actions {
  display: flex;
  gap: 4px;
  align-self: center;
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

/* Empty State Details */
.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #f0fdf4;
  border-radius: 50%;
  margin-bottom: 24px;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
  opacity: 0;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: #64748b;
  max-width: 320px;
  margin: 0;
  line-height: 1.5;
}

.btn.danger-outline {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn.danger-outline:hover {
  background: #fee2e2;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
</style>
