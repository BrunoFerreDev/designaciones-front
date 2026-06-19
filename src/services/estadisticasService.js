import api from "./api";

/**
 * Obtener estadísticas globales de designaciones en un rango de fechas.
 * @param {string} inicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fin - Fecha fin (YYYY-MM-DD)
 */
const getEstadisticas = (inicio, fin) => {
  const params = {};
  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;
  return api.get("/designaciones/estadisticas", { params }).then((r) => r.data);
};

/**
 * Obtener estadísticas detalladas de un árbitro específico en un rango de fechas.
 * @param {number|string} idArbitro - Identificador del árbitro
 * @param {string} inicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fin - Fecha fin (YYYY-MM-DD)
 */
const getEstadisticasArbitro = async (idArbitro, inicio, fin) => {
  const params = {};
  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;
  return await api
    .get(`/designaciones/estadisticas/arbitro/${idArbitro}`, { params })
    .then((r) => r.data);
};

export default {
  getEstadisticas,
  getEstadisticasArbitro,
};
