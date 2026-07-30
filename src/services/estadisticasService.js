import api, { getDeduplicated } from "./api";

/**
 * Obtener estadísticas globales de designaciones en un rango de fechas.
 * @param {string} inicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fin - Fecha fin (YYYY-MM-DD)
 * @param {object} config - Configuración Axios adicional
 */
const getEstadisticas = (inicio, fin, config = {}) => {
  const params = {};
  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;
  return getDeduplicated("/designaciones/estadisticas", { params, loaderType: "topbar", ...config }).then((r) => r.data);
};

/**
 * Obtener estadísticas detalladas de un árbitro específico en un rango de fechas.
 * @param {number|string} idArbitro - Identificador del árbitro
 * @param {string} inicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fin - Fecha fin (YYYY-MM-DD)
 * @param {object} config - Configuración Axios adicional
 */
const getEstadisticasArbitro = async (idArbitro, inicio, fin, config = {}) => {
  const params = {};
  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;
  return await getDeduplicated(`/designaciones/estadisticas/arbitro/${idArbitro}`, { params, loaderType: "topbar", ...config })
    .then((r) => r.data);
};

/**
 * Obtener comparación de estadísticas de varios árbitros.
 * @param {Array<number|string>} idsArbitros - IDs de los árbitros a comparar
 * @param {number} [mesInicio] - Mes de inicio (1-12)
 * @param {number} [mesFin] - Mes de fin (1-12)
 * @param {object} config - Configuración Axios adicional
 */
const getComparacionArbitros = (idsArbitros, mesInicio, mesFin, config = {}) => {
  const params = { idsArbitros: idsArbitros.join(",") };
  if (mesInicio !== undefined && mesInicio !== null) params.mesInicio = mesInicio;
  if (mesFin !== undefined && mesFin !== null) params.mesFin = mesFin;
  return getDeduplicated("/designaciones/estadisticas/comparacion", { params, loaderType: "topbar", ...config }).then((r) => r.data);
};

export default {
  getEstadisticas,
  getEstadisticasArbitro,
  getComparacionArbitros,
};
