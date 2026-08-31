const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || "";
};

/**
 * Servicio para suscripción a notificaciones en tiempo real vía Server-Sent Events (SSE).
 */
export class NotificacionService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Set();
    this.reconnectTimeout = null;
    this.isConnected = false;
  }

  /**
   * Inicia la suscripción al flujo de eventos SSE.
   * @param {Object} options
   * @param {Function} [options.onMessage] - Callback al recibir un mensaje
   * @param {Function} [options.onError] - Callback al ocurrir un error
   * @param {Function} [options.onOpen] - Callback al abrirse la conexión
   */
  subscribe(options = {}) {
    this.close();

    const baseUrl = getBaseUrl().replace(/\/+$/, "");
    const url = `${baseUrl}/api/notificaciones/subscribe`;

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = (event) => {
        this.isConnected = true;
        if (options.onOpen) options.onOpen(event);
      };

      this.eventSource.onmessage = (event) => {
        let data = event.data;
        try {
          data = JSON.parse(event.data);
        } catch {
          // Mantener como string si no es JSON
        }
        if (options.onMessage) options.onMessage(data, event);
        this.listeners.forEach((listener) => {
          try {
            listener(data, event);
          } catch (e) {
            console.error("Error en listener de notificación:", e);
          }
        });
      };

      this.eventSource.onerror = (error) => {
        this.isConnected = false;
        if (options.onError) options.onError(error);
      };
    } catch (err) {
      console.warn("No se pudo iniciar la conexión SSE:", err);
    }

    return this;
  }

  /**
   * Agrega un listener global para eventos entrantes.
   * @param {Function} listener
   * @returns {Function} Función para desuscribir el listener
   */
  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Cierra la conexión SSE.
   */
  close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }
}

export const notificacionService = new NotificacionService();
export default notificacionService;

