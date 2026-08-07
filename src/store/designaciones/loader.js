import { state } from "../state";
import { sortDesignaciones } from "../helpers";
import designacionService from "../../services/designacionService";

export const clearCache = () => {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("cached_")) {
      sessionStorage.removeItem(key);
    }
  }
  state.arbitrosDesignadosMap = {};
};

export const getMostRecentSaturday = () => {
  const referenceDate = new Date();
  const day = referenceDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToSaturday = day + 1;
  const satDate = new Date(referenceDate);
  satDate.setDate(referenceDate.getDate() - daysToSaturday);

  const yyyy = satDate.getFullYear();
  const mm = String(satDate.getMonth() + 1).padStart(2, "0");
  const dd = String(satDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const processAndCacheDesignaciones = async (list) => {
  for (const d of list) {
    d.estadoDesignacion = parseEstadoNumeric(d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado);
    const id = d.idDesignacion || d.id;
    const isMutable = d.estadoDesignacion === 0 || d.estadoDesignacion === 1;
    if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
      state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      if (isMutable) {
        delete d.arbitrosDesignados;
      }
    } else if (d.arbitros && d.arbitros.length > 0) {
      state.arbitrosDesignadosMap[id] = d.arbitros;
      if (!isMutable) {
        d.arbitrosDesignados = d.arbitros;
      }
    } else {
      if (!isMutable) {
        if (state.arbitrosDesignadosMap[id] && state.arbitrosDesignadosMap[id].length > 0) {
          d.arbitrosDesignados = state.arbitrosDesignadosMap[id];
        } else {
          const refs = await loadArbitrosDesignados(id);
          state.arbitrosDesignadosMap[id] = refs;
          d.arbitrosDesignados = refs;
        }
      }
    }
  }
};

export const loadDesignacionesIncompletas = async (page = 0, size = 30, config = {}) => {
  const force = config.force === true;
  const cacheKey = `cached_designaciones_incompletas_${page}_${size}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (!force && cached) {
    try {
      const list = JSON.parse(cached);
      state.designacionesIncompletas = sortDesignaciones(list);
      list.forEach((d) => {
        const id = d.idDesignacion || d.id;
        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        }
      });
      return;
    } catch (e) {
      console.warn("Failed to load cached designaciones incompletas", e);
    }
  }

  try {
    const res0 = await designacionService.getByEstado(0, page, size);
    let list = Array.isArray(res0) ? res0 : res0.content || res0;

    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    
    await processAndCacheDesignaciones(list);

    sessionStorage.setItem(cacheKey, JSON.stringify(list));
    state.designacionesIncompletas = sortDesignaciones(list);
  } catch (e) {
    console.warn("Failed to load designaciones incompletas", e);
  }
};

export const loadDesignacionesCanceladas = async (page = 0, size = 30, config = {}) => {
  const force = config.force === true;
  const cacheKey = `cached_designaciones_canceladas_${page}_${size}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (!force && cached) {
    try {
      const list = JSON.parse(cached);
      state.designacionesCanceladas = sortDesignaciones(list);
      list.forEach((d) => {
        const id = d.idDesignacion || d.id;
        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        }
      });
      return;
    } catch (e) {
      console.warn("Failed to load cached designaciones canceladas", e);
    }
  }

  try {
    const [res3, res4] = await Promise.all([
      designacionService.getByEstado(3, page, size),
      designacionService.getByEstado(4, page, size).catch(() => [])
    ]);
    const list3 = Array.isArray(res3) ? res3 : res3.content || res3;
    const list4 = Array.isArray(res4) ? res4 : res4.content || res4;
    let list = [...list3, ...list4];

    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    
    await processAndCacheDesignaciones(list);

    sessionStorage.setItem(cacheKey, JSON.stringify(list));
    state.designacionesCanceladas = sortDesignaciones(list);
  } catch (e) {
    console.warn("Failed to load designaciones canceladas", e);
  }
};

export const loadDesignacionesCompletas = async (page = 0, size = 30, config = {}) => {
  const force = config.force === true;
  const cacheKey = `cached_designaciones_completas_${page}_${size}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (!force && cached) {
    try {
      const list = JSON.parse(cached);
      state.designaciones = sortDesignaciones(list);
      list.forEach((d) => {
        const id = d.idDesignacion || d.id;
        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        }
      });
      return;
    } catch (e) {
      console.warn("Failed to load cached designaciones completas", e);
    }
  }

  try {
    const res = await designacionService.getByEstado(1, page, size);
    let list = Array.isArray(res) ? res : res.content || res;
    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);

    await processAndCacheDesignaciones(list);

    sessionStorage.setItem(cacheKey, JSON.stringify(list));
    state.designaciones = sortDesignaciones(list);
  } catch (e) {
    console.warn("Failed to load designaciones completas", e);
  }
};

export const loadDesignacionesFinalizadas = async (page = 0, size = 30, config = {}) => {
  const force = config.force === true;
  const cacheKey = `cached_designaciones_finalizadas_${page}_${size}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (!force && cached) {
    try {
      const list = JSON.parse(cached);
      state.designacionesFinalizadas = sortDesignaciones(list);
      list.forEach((d) => {
        const id = d.idDesignacion || d.id;
        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        }
      });
      return;
    } catch (e) {
      console.warn("Failed to load cached designaciones finalizadas", e);
    }
  }

  try {
    const res = await designacionService.getByEstado(2, page, size);
    let list = Array.isArray(res) ? res : res.content || res;
    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);

    await processAndCacheDesignaciones(list);

    sessionStorage.setItem(cacheKey, JSON.stringify(list));
    state.designacionesFinalizadas = sortDesignaciones(list);
  } catch (e) {
    console.warn("Failed to load designaciones finalizadas", e);
  }
};

export const loadArbitrosDesignados = async (idDesignacion, force = false, apiConfig = {}) => {
  if (!force && state.arbitrosDesignadosMap[idDesignacion]) {
    return state.arbitrosDesignadosMap[idDesignacion];
  }
  try {
    const res = await designacionService.getDesignados(idDesignacion, apiConfig);
    const data = Array.isArray(res) ? res : res.data || res;
    state.arbitrosDesignadosMap[idDesignacion] = data;
    return data;
  } catch (e) {
    console.warn("Failed to load arbitros designados", e);
    return [];
  }
};

const parseEstadoNumeric = (rawState) => {
  if (rawState === undefined || rawState === null) return 0;
  if (typeof rawState === "number") return rawState;
  const s = String(rawState).trim().toUpperCase();
  if (s === "0" || s.includes("INCOMPLETA") || s.includes("PENDIENTE")) return 0;
  if (s === "1" || s.includes("COMPLETA")) return 1;
  if (s === "2" || s.includes("FINALIZADA") || s.includes("JORNADA")) return 2;
  if (s === "3" || s.includes("CANCELADA")) return 3;
  if (s === "4" || s.includes("SUSPENDIDA")) return 4;
  const num = parseInt(s, 10);
  return isNaN(num) ? 0 : num;
};

let isFetchingUltimas = false;

export const ultimasDesignaciones = async (config = {}) => {
  const force = config.force === true;
  const cacheKey = "cached_ultimas_designaciones";
  const cached = sessionStorage.getItem(cacheKey);

  if (!force && cached) {
    try {
      const data = JSON.parse(cached);
      state.ultimasDesignaciones = data;

      const incompletas = [];
      const completas = [];
      const canceladas = [];
      const finalizadas = [];

      data.forEach((d) => {
        const id = d.idDesignacion || d.id;
        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        }

        if (d.estadoDesignacion === 0) {
          incompletas.push(d);
        } else if (d.estadoDesignacion === 1) {
          completas.push(d);
        } else if (d.estadoDesignacion === 2) {
          finalizadas.push(d);
        } else if (d.estadoDesignacion === 3 || d.estadoDesignacion === 4) {
          canceladas.push(d);
        } else {
          incompletas.push(d);
        }
      });

      state.designacionesIncompletas = sortDesignaciones(incompletas);
      state.designaciones = sortDesignaciones(completas);
      state.designacionesCanceladas = sortDesignaciones(canceladas);
      state.designacionesFinalizadas = sortDesignaciones(finalizadas);
      return;
    } catch (e) {
      console.warn("Failed to load cached ultimas designaciones", e);
    }
  }

  if (isFetchingUltimas) {
    return;
  }
  isFetchingUltimas = true;
  state.loadingDesignaciones = true;

  try {
    const res = await designacionService.ultimasDesignaciones();
    const data = Array.isArray(res) ? res : res.content || res.data || res;

    if (Array.isArray(data) && data.length > 0) {
      state.ultimasDesignaciones = data;

      const incompletas = [];
      const completas = [];
      const canceladas = [];
      const finalizadas = [];

      for (const d of data) {
        const rawState = d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado;
        const numericState = parseEstadoNumeric(rawState);
        d.estadoDesignacion = numericState;

        if (d.editable === undefined) {
          d.editable = true;
        }

        if (numericState === 0) {
          incompletas.push(d);
        } else if (numericState === 1) {
          completas.push(d);
        } else if (numericState === 2) {
          finalizadas.push(d);
        } else if (numericState === 3 || numericState === 4) {
          canceladas.push(d);
        } else {
          incompletas.push(d);
        }

        const id = d.idDesignacion || d.id;
        const isMutable = numericState === 0 || numericState === 1;

        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
          if (isMutable) {
            delete d.arbitrosDesignados;
          }
        } else if (d.arbitros && d.arbitros.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitros;
          if (!isMutable) {
            d.arbitrosDesignados = d.arbitros;
          }
        } else {
          if (!isMutable) {
            if (state.arbitrosDesignadosMap[id] && state.arbitrosDesignadosMap[id].length > 0) {
              d.arbitrosDesignados = state.arbitrosDesignadosMap[id];
            } else {
              const refs = await loadArbitrosDesignados(id);
              state.arbitrosDesignadosMap[id] = refs;
              d.arbitrosDesignados = refs;
            }
          }
        }
      }

      sessionStorage.setItem(cacheKey, JSON.stringify(data));

      state.designacionesIncompletas = sortDesignaciones(incompletas);
      state.designaciones = sortDesignaciones(completas);
      state.designacionesCanceladas = sortDesignaciones(canceladas);
      state.designacionesFinalizadas = sortDesignaciones(finalizadas);
    } else {
      await reloadAllDesignaciones(config);
    }
  } catch (e) {
    console.warn("Failed to load ultimas designaciones, fallback to reloadAllDesignaciones", e);
    await reloadAllDesignaciones(config);
  } finally {
    state.loadingDesignaciones = false;
    isFetchingUltimas = false;
  }
};

export const reloadAllDesignaciones = async (config = {}) => {
  state.loadingDesignaciones = true;
  try {
    await Promise.all([
      loadDesignacionesIncompletas(0, 30, config),
      loadDesignacionesCompletas(0, 30, config),
      loadDesignacionesCanceladas(0, 30, config),
      loadDesignacionesFinalizadas(0, 30, config),
    ]);
  } catch (e) {
    console.warn("Failed to reload all designaciones", e);
  } finally {
    state.loadingDesignaciones = false;
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
