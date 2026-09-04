import { sortDesignaciones } from "./helpers";

// Claves únicas consolidadas en LocalStorage
const KEYS = {
  DESIGNACIONES: "designaciones",
  ARBITROS: "arbitros",
  CANCHAS: "canchas",
  SUSPENSIONES: "suspensiones",
};

// Claves obsoletas para limpieza automática
const OBSOLETE_KEYS = [
  "designaciones_incompletas",
  "designaciones_completas",
  "designaciones_finalizadas",
  "designaciones_aceptadas",
  "designaciones_a_confirmar",
  "designaciones_arbitros_map",
  "designaciones_canchas",
  "designaciones_arbitros",
  "designaciones_arbitros_no_disp",
  "designaciones_suspensiones",
];

const safeGet = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

const safeSet = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving ${key} to localStorage:`, e);
  }
};

/**
 * Inicializa el estado reactivo desde LocalStorage.
 * Discrimina la lista única de designaciones por estadoDesignacion.
 */
export const initLocalStorage = (state) => {
  // Limpieza de claves viejas
  OBSOLETE_KEYS.forEach((k) => localStorage.removeItem(k));

  // 1. Canchas
  const canchas = safeGet(KEYS.CANCHAS, null);
  if (Array.isArray(canchas) && canchas.length > 0) {
    state.canchas = canchas;
  }

  // 2. Árbitros (discriminados por estado/disponibilidad)
  const arbitros = safeGet(KEYS.ARBITROS, null);
  if (Array.isArray(arbitros) && arbitros.length > 0) {
    state.arbitros = arbitros.filter(
      (a) => a.estado !== false && a.estadoSistema !== false,
    );
    state.arbitrosNoDisponibles = arbitros.filter(
      (a) => a.estado === false || a.estadoSistema === false,
    );
  }

  // 3. Designaciones: Una sola key, discriminada por estadoDesignacion
  // 0: Pendiente a completar, 1: Completa/Aceptada, 2: Finalizada, 3: Cancelada
  const designaciones = safeGet(KEYS.DESIGNACIONES, null);
  if (Array.isArray(designaciones) && designaciones.length > 0) {
    state.designacionesIncompletas = sortDesignaciones(
      designaciones.filter(
        (d) => Number(d.estadoDesignacion) === 0 && !d.aConfirmar,
      ),
    );
    state.designaciones = sortDesignaciones(
      designaciones.filter(
        (d) => Number(d.estadoDesignacion) === 1 && !d.aConfirmar,
      ),
    );
    state.designacionesFinalizadas = sortDesignaciones(
      designaciones.filter((d) => Number(d.estadoDesignacion) === 2),
    );
    state.designacionesAceptadas = sortDesignaciones(
      designaciones.filter((d) => Number(d.estadoDesignacion) === 3),
    );
    state.designacionesSuspendidas = sortDesignaciones(
      designaciones.filter((d) => Number(d.estadoDesignacion) === 4),
    );
    state.designacionesAConfirmar = sortDesignaciones(
      designaciones.filter((d) => Boolean(d.aConfirmar)),
    );

    // Cargar mapa de árbitros si vienen en los objetos
    designaciones.forEach((d) => {
      const id = d.idDesignacion || d.id;
      if (id && d.arbitrosDesignados && Array.isArray(d.arbitrosDesignados)) {
        state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        state.arbitrosDesignadosMap[String(id)] = d.arbitrosDesignados;
      }
    });
  }

  // 4. Suspensiones
  const suspensiones = safeGet(KEYS.SUSPENSIONES, null);
  if (Array.isArray(suspensiones) && suspensiones.length > 0) {
    state.suspensiones = suspensiones;
  }
};

/* ========================================================
   DESIGNACIONES (Una sola key: "designaciones")
======================================================== */
export const persistDesignacionesStorage = (state) => {
  const map = new Map();
  const all = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAceptadas,
    ...state.designacionesSuspendidas,
    ...state.designacionesAConfirmar,
  ];

  all.forEach((d) => {
    const id = d.idDesignacion || d.id;
    if (id) {
      const refs =
        state.arbitrosDesignadosMap[id] ||
        state.arbitrosDesignadosMap[String(id)] ||
        state.arbitrosDesignadosMap[Number(id)] ||
        d.arbitrosDesignados ||
        [];
      map.set(String(id), {
        ...d,
        idDesignacion: d.idDesignacion || id,
        id: d.id || id,
        ...(refs && refs.length > 0 ? { arbitrosDesignados: refs } : {}),
      });
    }
  });

  safeSet(KEYS.DESIGNACIONES, Array.from(map.values()));
};

export const updateDesignacionInStorage = (state, updatedDes) => {
  if (!updatedDes) return;
  const id = updatedDes.idDesignacion || updatedDes.id;
  if (!id) return;

  const lists = [
    state.designacionesIncompletas,
    state.designaciones,
    state.designacionesFinalizadas,
    state.designacionesAceptadas,
    state.designacionesSuspendidas,
    state.designacionesAConfirmar,
  ];

  let prevData = null;
  let wasInAConfirmar = false;

  lists.forEach((list) => {
    const idx = list.findIndex(
      (d) =>
        (d.idDesignacion || d.id) === id ||
        String(d.idDesignacion || d.id) === String(id),
    );
    if (idx !== -1) {
      prevData = list[idx];
      if (list === state.designacionesAConfirmar) {
        wasInAConfirmar = true;
      }
      list.splice(idx, 1);
    }
  });

  const merged = { ...(prevData || {}), ...updatedDes };
  const st = Number(
    merged.estadoDesignacion !== undefined ? merged.estadoDesignacion : 0,
  );

  // Si estaba en aConfirmar o viene marcado como tal, mantenerlo en aConfirmar
  if (wasInAConfirmar || merged.aConfirmar) {
    state.designacionesAConfirmar.push(merged);
  } else {
    // Discriminar por estado de designación en memoria reactiva
    switch (st) {
      case 0:
        state.designacionesIncompletas.push(merged);
        break;
      case 1:
        state.designaciones.push(merged);
        break;
      case 2:
        state.designacionesFinalizadas.push(merged);
        break;
      case 3:
        state.designacionesAceptadas.push(merged);
        break;
      case 4:
        state.designacionesSuspendidas.push(merged);
        break;
      default:
        state.designaciones.push(merged);
        break;
    }
  }

  state.designacionesIncompletas = sortDesignaciones(
    state.designacionesIncompletas,
  );
  state.designaciones = sortDesignaciones(state.designaciones);
  state.designacionesFinalizadas = sortDesignaciones(
    state.designacionesFinalizadas,
  );
  state.designacionesAceptadas = sortDesignaciones(
    state.designacionesAceptadas,
  );
  state.designacionesSuspendidas = sortDesignaciones(
    state.designacionesSuspendidas,
  );
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar,
  );

  const refs =
    merged.arbitrosDesignados ||
    state.arbitrosDesignadosMap[id] ||
    state.arbitrosDesignadosMap[String(id)] ||
    state.arbitrosDesignadosMap[Number(id)];
  if (refs && Array.isArray(refs)) {
    state.arbitrosDesignadosMap[id] = refs;
    state.arbitrosDesignadosMap[String(id)] = refs;
  }

  // Guardar todas en una sola clave "designaciones"
  persistDesignacionesStorage(state);
};

export const removeDesignacionFromStorage = (state, id) => {
  const lists = [
    state.designacionesIncompletas,
    state.designaciones,
    state.designacionesFinalizadas,
    state.designacionesAceptadas,
    state.designacionesSuspendidas,
    state.designacionesAConfirmar,
  ];

  lists.forEach((list) => {
    const idx = list.findIndex(
      (d) =>
        (d.idDesignacion || d.id) === id ||
        String(d.idDesignacion || d.id) === String(id),
    );
    if (idx !== -1) {
      list.splice(idx, 1);
    }
  });

  delete state.arbitrosDesignadosMap[id];
  delete state.arbitrosDesignadosMap[String(id)];
  persistDesignacionesStorage(state);
};

/* ========================================================
   CANCHAS (Una sola key: "canchas")
======================================================== */
export const persistCanchasStorage = (state) => {
  safeSet(KEYS.CANCHAS, state.canchas);
};

export const updateCanchaInStorage = (state, cancha) => {
  if (!cancha) return;
  const id = cancha.idCancha || cancha.id;
  const idx = state.canchas.findIndex((c) => (c.idCancha || c.id) === id);
  if (idx !== -1) {
    state.canchas[idx] = { ...state.canchas[idx], ...cancha };
  } else {
    state.canchas.push(cancha);
  }
  persistCanchasStorage(state);
};

export const removeCanchaFromStorage = (state, id) => {
  state.canchas = state.canchas.filter((c) => (c.idCancha || c.id) !== id);
  persistCanchasStorage(state);
};

/* ========================================================
   ÁRBITROS (Una sola key: "arbitros")
======================================================== */
export const persistArbitrosStorage = (state) => {
  const map = new Map();
  [...state.arbitros, ...(state.arbitrosNoDisponibles || [])].forEach((a) => {
    const id = a.idArbitro || a.id;
    if (id) map.set(id, a);
  });
  safeSet(KEYS.ARBITROS, Array.from(map.values()));
};

export const updateArbitroInStorage = (state, arbitro) => {
  if (!arbitro) return;
  const id = arbitro.idArbitro || arbitro.id;

  const updateList = (list) => {
    const idx = list.findIndex((a) => (a.idArbitro || a.id) === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...arbitro };
      return true;
    }
    return false;
  };

  const updatedInActivos = updateList(state.arbitros);
  const updatedInNoDisp = updateList(state.arbitrosNoDisponibles || []);

  if (!updatedInActivos && !updatedInNoDisp) {
    if (arbitro.estado === false || arbitro.estadoSistema === false) {
      state.arbitrosNoDisponibles.push(arbitro);
    } else {
      state.arbitros.push(arbitro);
    }
  }

  persistArbitrosStorage(state);
};

export const removeArbitroFromStorage = (state, id) => {
  state.arbitros = state.arbitros.filter((a) => (a.idArbitro || a.id) !== id);
  state.arbitrosNoDisponibles = (state.arbitrosNoDisponibles || []).filter(
    (a) => (a.idArbitro || a.id) !== id,
  );
  persistArbitrosStorage(state);
};

/* ========================================================
   SUSPENSIONES (Una sola key: "suspensiones")
======================================================== */
export const persistSuspensionesStorage = (state) => {
  safeSet(KEYS.SUSPENSIONES, state.suspensiones);
};

export const updateSuspensionInStorage = (state, suspension) => {
  if (!suspension) return;
  const id = suspension.id || suspension.idSuspencion;
  const idx = state.suspensiones.findIndex(
    (s) => (s.id || s.idSuspencion) === id,
  );
  if (idx !== -1) {
    state.suspensiones[idx] = { ...state.suspensiones[idx], ...suspension };
  } else {
    state.suspensiones.push(suspension);
  }
  persistSuspensionesStorage(state);
};

export const removeSuspensionFromStorage = (state, id) => {
  state.suspensiones = state.suspensiones.filter(
    (s) => (s.id || s.idSuspencion) !== id,
  );
  persistSuspensionesStorage(state);
};
