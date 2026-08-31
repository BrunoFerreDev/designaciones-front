import { state } from "./state";
import { getCancha, sortDesignaciones, formatLocalDateTime } from "./helpers";
import { closeModal } from "./modal";
import {
  persistDesignacionesStorage,
  updateDesignacionInStorage,
  removeDesignacionFromStorage,
} from "./storage";
import designacionService from "../services/designacionService";

// Re-export submodules
export * from "./designaciones/assignment";
export * from "./designaciones/status";
export * from "./designaciones/confirmation";

import {
  cambiarEstadoDesignacionManual,
  cancelarDesignacionManual,
  aceptarDesignacionManual,
  finalizarDesignacionManual,
  reprogramarDesignacionManual,
} from "./designaciones/status";

let loadingPromise = null;

export const loadDesignacionesUltimos7Dias = async () => {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const res = await designacionService.getUltimos7Dias();
      const list = Array.isArray(res) ? res : [];

      const incompletas = list.filter((d) => d.estadoDesignacion === 0);
      const completas = list.filter((d) => d.estadoDesignacion === 1);
      const finalizadas = list.filter((d) => d.estadoDesignacion === 2);
      const aceptadas = list.filter((d) => d.estadoDesignacion === 3);

      state.designacionesIncompletas = sortDesignaciones(incompletas);
      state.designaciones = sortDesignaciones(completas);
      state.designacionesFinalizadas = sortDesignaciones(finalizadas);
      state.designacionesAceptadas = sortDesignaciones(aceptadas);

      // Pre-cargar árbitros asignados en el mapa
      list.forEach(async (d) => {
        const id = d.idDesignacion || d.id;
        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        } else {
          const refs = await loadArbitrosDesignados(id);
          state.arbitrosDesignadosMap[id] = refs;
        }
        persistDesignacionesStorage(state);
      });

      persistDesignacionesStorage(state);
    } catch (e) {
      console.warn("Failed to load designaciones for last 7 days", e);
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

export const loadDesignacionesIncompletas = async () => {
  await loadDesignacionesUltimos7Dias();
};

export const loadDesignacionesAceptadas = async () => {
  await loadDesignacionesUltimos7Dias();
};

export const loadDesignacionesCompletas = async () => {
  await loadDesignacionesUltimos7Dias();
};

export const loadDesignacionesFinalizadas = async () => {
  await loadDesignacionesUltimos7Dias();
};

export const reloadAllDesignaciones = async () => {
  try {
    await Promise.all([
      loadDesignacionesIncompletas(),
      loadDesignacionesCompletas(),
      loadDesignacionesAceptadas(),
      loadDesignacionesFinalizadas(),
    ]);
  } catch (err) {
    console.warn("Failed to reload all designaciones", err);
  }
};

export const loadArbitrosDesignados = async (idDesignacion) => {
  if (state.arbitrosDesignadosMap[idDesignacion]) {
    return state.arbitrosDesignadosMap[idDesignacion];
  }
  try {
    const res = await designacionService.getDesignados(idDesignacion);
    const data = Array.isArray(res) ? res : res.data || res;
    state.arbitrosDesignadosMap[idDesignacion] = data;
    persistDesignacionesStorage(state);
    return data;
  } catch (e) {
    console.warn("Failed to load arbitros designados", e);
    return [];
  }
};

export const loadDesignacionesArbitros = async (id) => {
  try {
    const res = await designacionService.getDesignados(id);
    state.designacionesArbitros = Array.isArray(res) ? res : res.data || res;
  } catch (e) {
    console.warn("Failed to load designaciones arbitros", e);
  }
};

export const saveDesignacion = () => {
  const { canchaId, fecha, cantidadPartidos, etapaCampeonato } = state.form;
  const c = getCancha(canchaId);
  if (!c || !fecha || !cantidadPartidos) {
    alert("Completá cancha, fecha y cantidad de partidos.");
    return;
  }

  let formattedFecha = fecha;
  if (fecha && fecha.includes("T") && fecha.split(":").length === 2) {
    formattedFecha = fecha + ":00";
  }

  const dto = {
    idCancha: canchaId,
    fecha: formattedFecha,
    cantidadPartidos,
    etapaCampeonato: etapaCampeonato || "FECHA_NORMAL",
  };

  designacionService
    .createDesignacion(dto)
    .then((created) => {
      if (created && (created.idDesignacion || created.id)) {
        updateDesignacionInStorage(state, {
          canchaId,
          cancha: c,
          ...dto,
          ...created,
        });
      } else {
        reloadAllDesignaciones();
      }
      closeModal();
    })
    .catch((err) => {
      console.warn("createDesignacion failed, using local fallback", err);
      const fallback = {
        id: state.nextDesId++,
        canchaId,
        cancha: c,
        ...dto,
        arbitros: [],
        estadoDesignacion: 0,
      };
      updateDesignacionInStorage(state, fallback);
      closeModal();
    });
};

export const updateDesignacion = () => {
  const {
    idDesignacion,
    canchaId,
    fecha,
    cantidadPartidos,
    etapaCampeonato,
    detalle,
    detalleDesignacion,
    editable,
    estadoDesignacion,
  } = state.form;

  const c = getCancha(canchaId);
  if (!canchaId || !fecha || !cantidadPartidos) {
    alert("Completá cancha, fecha y cantidad de partidos.");
    return;
  }

  let formattedFecha = formatLocalDateTime(fecha);
  const detalleFinal =
    detalleDesignacion !== undefined
      ? detalleDesignacion
      : detalle !== undefined
        ? detalle
        : "";

  const dto = {
    idCancha: Number(canchaId),
    fecha: formattedFecha,
    cantidadPartidos: Number(cantidadPartidos),
    etapaCampeonato: etapaCampeonato || "FECHA_NORMAL",
    detalle: detalleFinal,
    detalleDesignacion: detalleFinal,
    editable: editable !== undefined ? editable : true,
    estadoDesignacion:
      estadoDesignacion !== undefined ? Number(estadoDesignacion) : 0,
  };

  // Actualización optimista de la entidad puntual
  updateDesignacionInStorage(state, {
    idDesignacion,
    id: idDesignacion,
    canchaId: Number(canchaId),
    cancha: c,
    ...dto,
  });
  closeModal();

  designacionService
    .actualizarDesignacion(idDesignacion, dto)
    .then((updated) => {
      if (updated && typeof updated === "object") {
        updateDesignacionInStorage(state, {
          canchaId: Number(canchaId),
          cancha: c,
          ...updated,
        });
      }
    })
    .catch((err) => {
      console.warn("actualizarDesignacion backend failed, kept local state", err);
    });
};

export const deleteDesignacion = (id) => {
  if (!confirm("¿Eliminar esta designación?")) return;
  removeDesignacionFromStorage(state, id);
  designacionService
    .deleteDesignacion(id)
    .catch((err) => {
      console.warn("deleteDesignacion backend failed, removed locally", err);
    });
};

export const clonarDesignaciones = async (designaciones) => {
  if (!Array.isArray(designaciones) || designaciones.length === 0) return;

  const promises = designaciones.map((d) => {
    let newFecha = d.fecha;
    if (d.fecha) {
      try {
        const dateObj = new Date(d.fecha);
        dateObj.setDate(dateObj.getDate() + 7);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const seconds = String(dateObj.getSeconds()).padStart(2, "0");
        newFecha = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      } catch (e) {
        console.warn("Error parsing or shifting date", e);
      }
    }

    const idCancha =
      d.idCancha ||
      d.canchaId ||
      (d.cancha ? d.cancha.idCancha || d.cancha.id : null);

    const dto = {
      idCancha,
      fecha: newFecha,
      cantidadPartidos: d.cantidadPartidos,
      etapaCampeonato: d.etapaCampeonato || "FECHA_NORMAL",
    };

    return designacionService.createDesignacion(dto);
  });

  try {
    await Promise.all(promises);
    await reloadAllDesignaciones();
  } catch (error) {
    console.error("Error al clonar designaciones", error);
    alert("Hubo un error al clonar algunas designaciones.");
    await reloadAllDesignaciones();
    throw error;
  }
};

export const loadUltimasDesignaciones = async () => {
  try {
    const res = await designacionService.getUltimasDesignaciones();
    return Array.isArray(res) ? res : res.data || [];
  } catch (e) {
    console.warn("Failed to load ultimas designaciones", e);
    return [];
  }
};
