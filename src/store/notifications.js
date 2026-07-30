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

// Establish a connection with the server using fetch to support Authorization headers
export const connectNotifications = () => {
  // If we already have an active connection, do not create a new one
  if (activeController) {
    console.log("La conexión de notificaciones ya está activa o en proceso.");
    return;
  }

  const token = localStorage.getItem("jwt_token");
  if (!token) {
    console.warn("No se encontró token JWT. Abortando suscripción de notificaciones.");
    return;
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const cleanedBase = baseURL ? baseURL.replace(/\/$/, "") : "http://localhost:8081";
  const url = `${cleanedBase}/api/notificaciones/subscribe`;

  activeController = new AbortController();
  const { signal } = activeController;

  console.log("Conectando a notificaciones por SSE (fetch):", url);

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Guardar última línea incompleta

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr) {
              handleIncomingNotification(dataStr);
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        console.log("Conexión de notificaciones cancelada (AbortError).");
      } else {
        console.error("Error en conexión SSE de notificaciones:", error);
        cleanupConnection();
        // Intentar reconectar después de 5 segundos si el usuario sigue autenticado
        reconnectTimeout = setTimeout(() => {
          if (localStorage.getItem("jwt_token")) {
            connectNotifications();
          }
        }, 5000);
      }
    });
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
  console.log("Desconectado de notificaciones SSE.");
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
