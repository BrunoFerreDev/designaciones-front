import { computed } from "vue";
import { state } from "./state";
import { addToast } from "./helpers";

let activeController = null;
let reconnectTimeout = null;

// Get the unread notification count
export const unreadNotificationsCount = computed(() => {
  return (state.notifications || []).filter((n) => !n.read).length;
});

// Process an incoming notification raw string
const handleIncomingNotification = (dataStr) => {
  console.log("Notificación recibida raw:", dataStr);
  let parsed;
  try {
    parsed = JSON.parse(dataStr);
  } catch (e) {
    parsed = {
      mensaje: dataStr,
      tipo: "info",
    };
  }

  const message = parsed.mensaje || parsed.message || dataStr;

  // Ignorar notificación inicial de conexión establecida
  const messageLower = String(message).toLowerCase();
  if (
    messageLower.includes("conexión establecida") ||
    messageLower.includes("conexion establecida") ||
    messageLower.includes("connection established") ||
    messageLower === "ok" ||
    messageLower === "connected"
  ) {
    console.log("Ignorando mensaje de control SSE (conexión establecida).");
    return;
  }

  const rawType = parsed.tipo || parsed.type || "info";

  // Map backend types to semantic classes (info, success, warning, error)
  let type = "info";
  const typeUpper = String(rawType).toUpperCase();
  if (
    typeUpper.includes("DESASIGNACION") ||
    typeUpper.includes("DESASIGNADO") ||
    typeUpper.includes("CANCELADO") ||
    typeUpper.includes("SUSPENSION")
  ) {
    type = "warning";
  } else if (
    typeUpper.includes("CREACION") ||
    typeUpper.includes("NUEVA") ||
    typeUpper.includes("ACEPTADA") ||
    typeUpper.includes("EXITO")
  ) {
    type = "success";
  } else if (typeUpper.includes("ERROR") || typeUpper.includes("FALLO")) {
    type = "error";
  }

  let timestamp = new Date().toISOString();
  if (parsed.timestamp) {
    const d = new Date(parsed.timestamp);
    if (!isNaN(d.getTime())) {
      timestamp = d.toISOString();
    }
  }

  const newNotification = {
    id: Date.now() + Math.random(),
    title: "Notificación",
    message: message,
    type: type, // "info", "success", "warning", "error"
    timestamp: timestamp,
    read: false,
  };

  if (!state.notifications) {
    state.notifications = [];
  }

  // Insert at the beginning of the list
  state.notifications.unshift(newNotification);

  // Keep only the last 50 notifications in history
  if (state.notifications.length > 50) {
    state.notifications = state.notifications.slice(0, 50);
  }

  // Persist to localStorage
  localStorage.setItem("notifications", JSON.stringify(state.notifications));

  // Add to sidebar temporary alerts
  if (!state.sidebarNotifications) {
    state.sidebarNotifications = [];
  }
  state.sidebarNotifications.push(newNotification);

  // Automatically remove after 3 seconds
  setTimeout(() => {
    state.sidebarNotifications = (state.sidebarNotifications || []).filter(
      (n) => n.id !== newNotification.id
    );
  }, 3000);
};

// Establish a connection with the server using local mock simulation
export const connectNotifications = () => {
  console.log("Conectando a notificaciones locales (Simulación de Modo Demo).");
  
  // Register global window helper to trigger notifications from mock database
  window.triggerMockNotification = (message, type = "info") => {
    handleIncomingNotification(JSON.stringify({ mensaje: message, tipo: type }));
  };

  // Seed a welcome notification if there are no notifications at all
  if (!state.notifications || state.notifications.length === 0) {
    setTimeout(() => {
      if (window.triggerMockNotification) {
        window.triggerMockNotification(
          "¡Bienvenido a la demo de ArbDesig! Todos los cambios se guardan localmente en tu navegador.",
          "NUEVA_CREACION"
        );
      }
    }, 1500);
  }
};

const cleanupConnection = () => {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};

// Terminate subscription
export const disconnectNotifications = () => {
  cleanupConnection();
  console.log("Desconectado de notificaciones locales.");
};

// Mark a single notification as read
export const markAsRead = (id) => {
  const notif = (state.notifications || []).find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    localStorage.setItem("notifications", JSON.stringify(state.notifications));
  }
};

// Mark all notifications as read
export const markAllAsRead = () => {
  (state.notifications || []).forEach((n) => {
    n.read = true;
  });
  localStorage.setItem("notifications", JSON.stringify(state.notifications));
};

// Delete a single notification from history
export const deleteNotification = (id) => {
  state.notifications = (state.notifications || []).filter((n) => n.id !== id);
  localStorage.setItem("notifications", JSON.stringify(state.notifications));
};

// Clear all notification history
export const clearAllNotifications = () => {
  state.notifications = [];
  localStorage.setItem("notifications", JSON.stringify(state.notifications));
};
