<template>
  <div class="modal-card max-w-xl w-full mx-auto" style="border-radius: var(--border-radius-lg, 14px); overflow: hidden; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div class="modal-header" style="background: #1e293b; color: white; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-top-left-radius: var(--border-radius-lg); border-top-right-radius: var(--border-radius-lg);">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="ti ti-bell" style="font-size: 24px;"></i>
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: white;">Notificaciones</h3>
          <span style="font-size: 11px; opacity: 0.9; color: #cbd5e1;">
            {{ unreadCount }} por leer · {{ state.notifications?.length || 0 }} en total
          </span>
        </div>
      </div>
      <button 
        @click="closeModal" 
        style="background: transparent; border: none; color: white; cursor: pointer; padding: 4px; display: inline-flex; border-radius: 50%;"
        onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'"
        onmouseout="this.style.background='transparent'"
      >
        <i class="ti ti-x" style="font-size: 20px;"></i>
      </button>
    </div>

    <!-- Body -->
    <div class="modal-body" style="padding: 1.25rem;">
      <!-- Actions Bar (if notifications exist) -->
      <div 
        v-if="state.notifications && state.notifications.length > 0" 
        style="display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 1rem;"
      >
        <button 
          class="btn secondary" 
          style="padding: 6px 12px; font-size: 12px; height: auto;" 
          @click="markAllAsRead" 
          title="Marcar todas como leídas"
        >
          <i class="ti ti-check-all"></i> Marcar todas leídas
        </button>
        <button 
          class="btn danger-outline" 
          style="padding: 6px 12px; font-size: 12px; height: auto;" 
          @click="clearAllNotifications" 
          title="Limpiar todas las notificaciones"
        >
          <i class="ti ti-trash"></i> Limpiar historial
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="!state.notifications || state.notifications.length === 0" class="notification-empty" style="padding: 40px 20px;">
        <div class="empty-icon-wrapper">
          <div class="pulse-ring"></div>
          <i class="ti ti-bell-off text-emerald-500" style="font-size: 36px;"></i>
        </div>
        <h3 class="empty-title" style="font-size: 18px; margin-top: 1rem;">Tu campo de juego está al día</h3>
        <p class="empty-desc" style="font-size: 13px;">No tienes notificaciones pendientes. Te avisaremos cuando ocurra algo importante.</p>
      </div>

      <!-- Scrollable Notifications List -->
      <div v-else class="notifications-scroll-area" style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
        <div
          v-for="item in state.notifications"
          :key="item.id"
          :class="['notification-item-card', `notif-${item.type}`, { 'unread': !item.read }]"
          @click="handleCardClick(item)"
          style="border-radius: 10px; padding: 12px 14px; gap: 12px; border-left-width: 4px;"
        >
          <!-- Unread Dot Indicator -->
          <div v-if="!item.read" class="unread-indicator" title="Sin leer" style="top: 8px; right: 8px;"></div>

          <!-- Icon wrapper -->
          <div 
            :class="['notif-icon-container', `notif-icon-${item.type}`]"
            style="width: 36px; height: 36px; font-size: 16px; border-radius: 8px;"
          >
            <i :class="['ti', getIcon(item.type)]"></i>
          </div>

          <!-- Notification Details -->
          <div class="notif-body">
            <div class="notif-header" style="align-items: center;">
              <span class="notif-title" style="font-size: 14px;">{{ item.title }}</span>
              <span class="notif-time" :title="formatFullDate(item.timestamp)" style="font-size: 11px;">
                {{ formatTimeAgo(item.timestamp) }}
              </span>
            </div>
            <p class="notif-message" style="font-size: 12.5px; line-height: 1.4;">{{ item.message }}</p>
          </div>

          <!-- Action buttons for card -->
          <div class="notif-actions" @click.stop style="gap: 2px;">
            <button
              v-if="!item.read"
              class="btn-icon-only text-emerald-600 hover:bg-emerald-50"
              style="width: 28px; height: 28px; font-size: 14px;"
              @click="markAsRead(item.id)"
              title="Marcar como leída"
            >
              <i class="ti ti-check"></i>
            </button>
            <button
              class="btn-icon-only text-red-500 hover:bg-red-50"
              style="width: 28px; height: 28px; font-size: 14px;"
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
  closeModal,
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
.notification-item-card {
  position: relative;
  display: flex;
  background: #ffffff;
  border-left: 5px solid #cbd5e1;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.02);
}

.notification-item-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
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
  min-width: 0;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.notif-title {
  font-weight: 600;
  color: #1e293b;
}

.unread .notif-title {
  color: #0f172a;
}

.notif-time {
  color: #94a3b8;
  white-space: nowrap;
}

.notif-message {
  color: #64748b;
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
  align-self: center;
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

/* Empty State Details */
.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: #f0fdf4;
  border-radius: 50%;
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
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.empty-desc {
  color: #64748b;
  max-width: 320px;
  margin: 0;
  line-height: 1.5;
}

.btn.danger-outline {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  transition: all 0.2s;
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

/* Custom Scrollbar for scrollable area */
.notifications-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.notifications-scroll-area::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}
.notifications-scroll-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}
.notifications-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
