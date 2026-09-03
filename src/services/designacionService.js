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

// Helper para calcular rango desde fin de semana pasado hasta fin de semana próximo
export const getRangoFindePasadoAProximo = (referenceDate = new Date()) => {
  const d =
    typeof referenceDate === "string"
      ? new Date(referenceDate.replace(" ", "T"))
      : new Date(referenceDate);
  const day = d.getDay();
  const diffToSaturday = day === 0 ? -1 : 6 - day;
  const thisSat = new Date(d);
  thisSat.setDate(d.getDate() + diffToSaturday);

  // Finde pasado (al menos 14 días atrás para cubrir completamente fin de semana anterior)
  const lastSat = new Date(thisSat);
  lastSat.setDate(thisSat.getDate() - 14);

  // Finde próximo (hasta 15 días adelante para cubrir sábado y domingo próximos)
  const nextSun = new Date(thisSat);
  nextSun.setDate(thisSat.getDate() + 15);

  const fmt = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    inicio: fmt(lastSat),
    fin: fmt(nextSun),
    lastSaturdayDate: lastSat,
    nextSundayDate: nextSun,
  };
};

// Obtener listado de designaciones abarcando finde pasado, actual y próximo
export const getUltimos7Dias = async (fechaBase = new Date()) => {
  const { inicio, fin, lastSaturdayDate, nextSundayDate } =
    getRangoFindePasadoAProximo(fechaBase);

  try {
    const res = await buscarPorRango(inicio, fin);
    let list = Array.isArray(res) ? res : res?.content || res?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      const seen = new Set();
      return list.filter((item) => {
        const id = item.idDesignacion || item.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }
  } catch (err) {
    console.warn("buscarPorRango falló, usando fallback por fechas:", err);
  }

  // Fallback: consultar fecha por fecha en el rango
  try {
    const promesas = [];
    const cur = new Date(lastSaturdayDate);
    while (cur <= nextSundayDate) {
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, "0");
      const dd = String(cur.getDate()).padStart(2, "0");
      const fecha = `${yyyy}-${mm}-${dd}`;
      promesas.push(
        buscarPorFecha(fecha).catch((e) => {
          console.warn(`Error buscando designaciones para fecha ${fecha}:`, e);
          return [];
        }),
      );
      cur.setDate(cur.getDate() + 1);
    }
    const results = await Promise.all(promesas);
    const flat = results.filter(Boolean).flat();
    const seen = new Set();
    return flat.filter((item) => {
      const id = item.idDesignacion || item.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  } catch (e) {
    console.error("Error al cargar designaciones por rango:", e);
    return [];
  }
};

export const getDesignacionesPeriodoActual = getUltimos7Dias;

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

// Desvincula todos los árbitros de una designación
export const limpiarArbitrosDesignacion = async (
  idDesignacion,
  arbitrosList = [],
) => {
  if (Array.isArray(arbitrosList) && arbitrosList.length > 0) {
    const promises = arbitrosList.map((a) => {
      const arbId = a.arbitro?.idArbitro || a.idArbitro;
      if (arbId) {
        return quitarArbitroManual(idDesignacion, arbId).catch((err) => {
          console.warn(`No se pudo quitar árbitro ${arbId} en backend:`, err);
        });
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
  }
};

// Elimina por completo una designación
export const deleteDesignacion = (id) =>
  api.delete(`/designaciones/${id}`).then((r) => r.data);

// Asigna masivamente una lista de árbitros a la jornada
export const designarListaArbitrosADesignacion = async (
  idDesignacion,
  idsArbitros,
) => {
  if (!Array.isArray(idsArbitros) || idsArbitros.length === 0) return;
  try {
    return await api
      .post(`/designaciones/${idDesignacion}/arbitros/bulk`, idsArbitros)
      .then((r) => r.data);
  } catch (errBulk) {
    console.warn(
      "Endpoint masivo no disponible o falló, asignando árbitros individualmente:",
      errBulk,
    );
    const promises = idsArbitros.map((idArb) =>
      asignarArbitro(idDesignacion, idArb, { forzar: true }).catch((errIndiv) => {
        console.warn(`Error asignando árbitro ${idArb} en backend:`, errIndiv);
      }),
    );
    return await Promise.all(promises);
  }
};

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
  getUltimos7Dias,
  getDesignacionesPeriodoActual,
  getRangoFindePasadoAProximo,
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
  limpiarArbitrosDesignacion,
  deleteDesignacion,
  designarListaArbitrosADesignacion,
  getUltimasDesignaciones,
  getDesignados,
  eliminarDesignado,
  actualizarMontoPercibido,
  actualizarMontoADesignados,
  actualizarCantidadPartidos,
};
