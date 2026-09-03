import api from "./api";
import designadoService from "./designadoService";

/**
 * 4. Designaciones (/designaciones)
 */

// Crear una nueva jornada de designación
export const createDesignacion = (dto) =>
  api.post("/designaciones", dto).then((r) => r.data);

// Modificar datos generales de una designación
export const actualizarDesignacion = (idDesignacion, dto) =>
  api.put(`/designaciones/${idDesignacion}`, dto).then((r) => r.data);

// Obtener el detalle completo de una designación por su identificador
export const getById = (idDesignacion) =>
  api.get(`/designaciones/${idDesignacion}`).then((r) => r.data);

// Sincronizar automáticamente los montos y aranceles según la cancha y partidos
export const sincronizarArancel = (idDesignacion) =>
  api
    .post(`/designaciones/${idDesignacion}/sincronizar-arancel`)
    .then((r) => r.data);

// Obtener todas las designaciones calendarizadas para un mes y año dados
export const buscarPorMes = (mes, anio) =>
  api
    .get("/designaciones/mes", { params: { mes, anio } })
    .then((r) => r.data);

// Pasar la designación a estado Cancelada (estado 3) indicando el motivo
export const cancelarDesignacion = (idDesignacion, detalle) =>
  api
    .put(`/designaciones/${idDesignacion}/cambiar-cancelado`, null, {
      params: { detalle },
    })
    .then((r) => r.data);

// Endpoint unificado de búsqueda: rango (inicio, fin) o puntual (fecha)
export const buscar = ({ inicio, fin, fecha } = {}) => {
  const params = {};
  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;
  if (fecha) params.fecha = fecha;
  return api.get("/designaciones/buscar", { params }).then((r) => r.data);
};

export const buscarPorRango = (inicio, fin) =>
  buscar({ inicio, fin });

export const buscarPorFecha = (fecha) =>
  buscar({ fecha });

// Obtener listado de designaciones en el rango: 7 días antes y 7 días después del día actual
export const getDesignacionesRangoActual = async (fechaBase = new Date()) => {
  const base =
    typeof fechaBase === "string"
      ? new Date(fechaBase.replace(" ", "T"))
      : new Date(fechaBase);

  const inicioDate = new Date(base);
  inicioDate.setDate(base.getDate() - 7);

  const finDate = new Date(base);
  finDate.setDate(base.getDate() + 7);

  const formatLocalDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const inicio = formatLocalDate(inicioDate);
  const fin = formatLocalDate(finDate);

  const res = await buscarPorRango(inicio, fin);
  return Array.isArray(res) ? res : res?.data || [];
};

// Obtener listado de designaciones de los últimos 7 días (mantiene compatibilidad)
export const getUltimos7Dias = (fechaBase = new Date()) =>
  getDesignacionesRangoActual(fechaBase);

// Lista paginada por estado (0: Pendiente, 1: Aceptada, 2: Finalizada, 3: Cancelada)
export const getAll = (page = 0, size = 50) =>
  api.get("/designaciones", { params: { page, size } }).then((r) => r.data);

export const getByEstado = (estado = 1, page = 0, size = 50) =>
  api
    .get("/designaciones", { params: { estado, page, size } })
    .then((r) => r.data);

export const getIncompletas = (page = 0, size = 50) =>
  getByEstado(0, page, size);

export const getCompletas = (page = 0, size = 50) =>
  getByEstado(1, page, size);

export const getAceptadas = (page = 0, size = 50) =>
  getByEstado(1, page, size);

export const getFinalizadas = (page = 0, size = 50) =>
  getByEstado(2, page, size);

export const getCanceladas = (page = 0, size = 50) =>
  getByEstado(3, page, size);

// Marcar la jornada como Finalizada (estado 2) e impactar estadísticas/finanzas
export const finalizarDesignacion = (idDesignacion, detalle) => {
  const params = detalle ? { detalle } : {};
  return api
    .put(`/designaciones/${idDesignacion}/finalizar`, null, { params })
    .then((r) => r.data);
};

// Confirma y pasa la designación a estado Aceptada (estado 1)
export const aceptarDesignacion = (idDesignacion) =>
  api.put(`/designaciones/${idDesignacion}/aceptar`).then((r) => r.data);

// Marca la designación para reprogramación
export const reprogramarDesignacion = (idDesignacion) =>
  api
    .put(`/designaciones/${idDesignacion}/reprogramar`)
    .then((r) => r.data);

/**
 * Endpoint Unificado de Asignación de Árbitros
 * POST /designaciones/{idDesignacion}/arbitros?idArbitro={id}&forzar={bool}&historico={bool}
 */
export const asignarArbitro = (
  idDesignacion,
  idArbitro,
  { forzar = false, historico = false } = {},
) => {
  const params = { idArbitro };
  if (forzar) params.forzar = true;
  if (historico) params.historico = true;
  return api
    .post(`/designaciones/${idDesignacion}/arbitros`, null, { params })
    .then((r) => r.data);
};

export const asignarArbitroManual = (idDesignacion, idArbitro, tipo = 1) => {
  return asignarArbitro(idDesignacion, idArbitro, {
    historico: tipo === 0,
  });
};

export const forzarAsignarArbitro = (idDesignacion, idArbitro) => {
  return asignarArbitro(idDesignacion, idArbitro, {
    forzar: true,
  });
};

export const asignarArbitroHistorico = (idDesignacion, idArbitro) => {
  return asignarArbitro(idDesignacion, idArbitro, {
    historico: true,
  });
};

// Desvincula a un árbitro de la designación
export const quitarArbitroManual = (idDesignacion, idArbitro) =>
  api
    .delete(`/designaciones/${idDesignacion}/arbitros/${idArbitro}`)
    .then((r) => r.data);

// Elimina por completo una designación
export const deleteDesignacion = (id) =>
  api.delete(`/designaciones/${id}`).then((r) => r.data);

// Asigna masivamente una lista de árbitros a la jornada
export const designarListaArbitrosADesignacion = (idDesignacion, idsArbitros) =>
  api
    .post(`/designaciones/${idDesignacion}/arbitros/bulk`, idsArbitros)
    .then((r) => r.data);

// Retorna las designaciones más recientes cargadas en el sistema
export const getUltimasDesignaciones = () =>
  api.get("/designaciones/ultimas-designaciones").then((r) => r.data);

// Alias y métodos de designados
export const getDesignados = designadoService.getDesignados;
export const eliminarDesignado = designadoService.eliminarDesignado;
export const actualizarMontoPercibido = designadoService.actualizarMontoPercibido;
export const actualizarMontoADesignados = designadoService.actualizarMontoADesignados;
export const actualizarCantidadPartidos = designadoService.actualizarCantidadPartidos;

export default {
  createDesignacion,
  actualizarDesignacion,
  getById,
  sincronizarArancel,
  buscarPorMes,
  cancelarDesignacion,
  buscar,
  buscarPorRango,
  buscarPorFecha,
  getDesignacionesRangoActual,
  getUltimos7Dias,
  getAll,
  getByEstado,
  getIncompletas,
  getCompletas,
  getAceptadas,
  getFinalizadas,
  getCanceladas,
  finalizarDesignacion,
  aceptarDesignacion,
  reprogramarDesignacion,
  asignarArbitro,
  asignarArbitroManual,
  forzarAsignarArbitro,
  asignarArbitroHistorico,
  quitarArbitroManual,
  deleteDesignacion,
  designarListaArbitrosADesignacion,
  getUltimasDesignaciones,
  getDesignados,
  eliminarDesignado,
  actualizarMontoPercibido,
  actualizarMontoADesignados,
  actualizarCantidadPartidos,
};
