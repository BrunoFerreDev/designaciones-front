import { state } from "../state";
import { sortDesignaciones } from "../helpers";
import designacionService from "../../services/designacionService";

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

export const loadDesignacionesIncompletas = async (page = 0, size = 30) => {
  try {
    const res0 = await designacionService.getByEstado(0, page, size);
    let list = Array.isArray(res0) ? res0 : res0.content || res0;

    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    state.designacionesIncompletas = sortDesignaciones(list);

    list.forEach(async (d) => {
      d.estadoDesignacion = parseEstadoNumeric(d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado);
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await loadArbitrosDesignados(id);
        state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones incompletas", e);
  }
};

export const loadDesignacionesCanceladas = async (page = 0, size = 30) => {
  try {
    const res = await designacionService.getByEstado(3, page, size);
    let list = Array.isArray(res) ? res : res.content || res;

    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    
    list.forEach((d) => {
      d.estadoDesignacion = parseEstadoNumeric(d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado);
    });

    state.designacionesCanceladas = sortDesignaciones(list);

    list.forEach(async (d) => {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await loadArbitrosDesignados(id);
        state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones canceladas", e);
  }
};

export const loadDesignacionesCompletas = async (page = 0, size = 30) => {
  try {
    const res = await designacionService.getByEstado(1, page, size);
    let list = Array.isArray(res) ? res : res.content || res;
    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);

    list.forEach((d) => {
      d.estadoDesignacion = parseEstadoNumeric(d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado);
    });

    state.designaciones = sortDesignaciones(list);

    list.forEach(async (d) => {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await loadArbitrosDesignados(id);
        state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones completas", e);
  }
};

export const loadDesignacionesFinalizadas = async (page = 0, size = 30) => {
  try {
    const res = await designacionService.getByEstado(2, page, size);
    let list = Array.isArray(res) ? res : res.content || res;
    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);

    list.forEach((d) => {
      d.estadoDesignacion = parseEstadoNumeric(d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado);
    });

    state.designacionesFinalizadas = sortDesignaciones(list);

    list.forEach(async (d) => {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await loadArbitrosDesignados(id);
        state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones finalizadas", e);
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
  if (s === "3" || s === "4" || s.includes("CANCELADA")) return 3;
  const num = parseInt(s, 10);
  return isNaN(num) ? 0 : num;
};

export const ultimasDesignaciones = async () => {
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

      data.forEach((d) => {
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
        } else if (numericState === 3) {
          canceladas.push(d);
        } else {
          incompletas.push(d);
        }

        const id = d.idDesignacion || d.id;
        if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
        } else if (d.arbitros && d.arbitros.length > 0) {
          state.arbitrosDesignadosMap[id] = d.arbitros;
        }
      });

      state.designacionesIncompletas = sortDesignaciones(incompletas);
      state.designaciones = sortDesignaciones(completas);
      state.designacionesCanceladas = sortDesignaciones(canceladas);
      state.designacionesFinalizadas = sortDesignaciones(finalizadas);
    } else {
      await reloadAllDesignaciones();
    }
  } catch (e) {
    console.warn("Failed to load ultimas designaciones, fallback to reloadAllDesignaciones", e);
    await reloadAllDesignaciones();
  } finally {
    state.loadingDesignaciones = false;
  }
};

export const reloadAllDesignaciones = async () => {
  state.loadingDesignaciones = true;
  try {
    await Promise.all([
      loadDesignacionesIncompletas(),
      loadDesignacionesCompletas(),
      loadDesignacionesCanceladas(),
      loadDesignacionesFinalizadas(),
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
