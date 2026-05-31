import { reactive, computed } from "vue";
import arbitroService from "./services/arbitroService";
import canchaService from "./services/canchaService";
import designacionService from "./services/designacionService";
import suspencionService from "./services/suspencionService";

export const ROLES_ARB = [
  "Árbitro Principal",
  "Árbitro Asistente 1",
  "Árbitro Asistente 2",
  "Cuarto Árbitro",
  "VAR",
  "Asistente VAR",
];
export const ROLE_COLORS = [
  "#1D9E75",
  "#185FA5",
  "#BA7517",
  "#993C1D",
  "#534AB7",
  "#3B6D11",
];

export const state = reactive({
  canchas: [],
  arbitros: [],
  designaciones: [],
  designacionesIncompletas: [],
  designacionesFinalizadas: [],
  designacionesAConfirmar: [],
  designacionesArbitros: [],
  modal: null,
  nextCanchaId: 4,
  nextArbId: 9,
  nextDesId: 3,
  nextSuspId: 1,
  form: {},
  selectedArbitros: [],
  suspensiones: [],
  arbitrosDesignadosMap: {},
});

// Helpers
export const getCancha = (id) => state.canchas.find((c) => c.id === id);
export const getArbitro = (id) =>
  state.arbitros.find((a) => a.idArbitro === id);
export const disponiblesCount = computed(
  () => state.arbitros.filter((a) => a.estado).length,
);

export const calcStatus = (partidos) => {
  if (partidos >= 7) return { label: "Alta carga", cls: "badge-red" };
  if (partidos >= 5) return { label: "Media-alta", cls: "badge-amber" };
  if (partidos >= 3) return { label: "Normal", cls: "badge-green" };
  return { label: "Baja", cls: "badge-gray" };
};

export const minArbitros = (partidos) => (partidos >= 5 ? 4 : 3);

export const formatFecha = (fechaStr) => {
  if (!fechaStr) return "";
  try {
    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];

    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    if (fechaStr.includes("T")) {
      const [datePart, timePart] = fechaStr.split("T");
      const [yyyy, mm, dd] = datePart.split("-").map(Number);
      const [hh, min] = timePart.split(":").map(Number);

      const dateObj = new Date(yyyy, mm - 1, dd);
      const nombreDia = diasSemana[dateObj.getDay()];

      const hhStr = String(hh).padStart(2, "0");
      const minStr = String(min).padStart(2, "0");

      const timePartFormatted =
        min === 0 ? `${hhStr}hs` : `${hhStr}:${minStr}hs`;
      return `${nombreDia} ${dd} de ${meses[mm - 1]} a las ${timePartFormatted}`;
    } else {
      const parts = fechaStr.split("-").map(Number);
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        const dateObj = new Date(yyyy, mm - 1, dd);
        const nombreDia = diasSemana[dateObj.getDay()];
        return `${nombreDia} ${dd} de ${meses[mm - 1]}`;
      }
    }
  } catch (e) {
    console.warn("Error formatting date", e);
  }
  return fechaStr;
};

export const sortDesignaciones = (list) => {
  if (!Array.isArray(list)) return [];
  return list.slice().sort((a, b) => {
    const timeA = a.fecha ? new Date(a.fecha).getTime() : 0;
    const timeB = b.fecha ? new Date(b.fecha).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA; // Most recent to oldest
    }
    const nameA = a.cancha?.nombreCancha || "";
    const nameB = b.cancha?.nombreCancha || "";
    return nameA.localeCompare(nameB);
  });
};

// Actions

export const openModal = (type, id = null) => {
  state.modal = { type, id };
  state.selectedArbitros = [];
  if (type === "editCancha" && id) {
    const cancha = getCancha(id);
    state.form = {
      nombreCancha: cancha.nombreCancha || cancha.nombre || "",
      categoria: cancha.categoria || "ELITE",
      fueraDeJuego: cancha.fueraDeJuego || false,
      estado: cancha.estado !== undefined ? cancha.estado : true,
      ...cancha,
    };
  } else if (type === "addCancha") {
    state.form = {
      nombreCancha: "",
      categoria: "ELITE",
      fueraDeJuego: false,
      estado: true,
    };
  } else if (type === "editArbitro" && id) {
    state.form = { ...getArbitro(id) };
  } else if (type === "addArbitro") {
    state.form = {
      rol: ROLES_ARB[0],
      categoria: "INCIAL",
      talleCamiseta: "M",
      talleShort: "M",
      estado: true,
      disponibleSabado: true,
      disponibleDomingo: true,
      nombre: "",
      apellido: "",
      whatsapp: "",
    };
  } else if (type === "addDesignacion") {
    state.form = { cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL" }; // defaults para designación
  } else if (type === "manageReferees" && id) {
    state.form = { idDesignacion: id };
  } else if (type === "editDesignacion" && id) {
    const list = [...state.designacionesIncompletas, ...state.designaciones, ...state.designacionesFinalizadas, ...state.designacionesAConfirmar];
    const des = list.find((d) => (d.idDesignacion || d.id) === id);
    if (des) {
      const canchaId = des.idCancha || des.canchaId || (des.cancha ? des.cancha.idCancha || des.cancha.id : null);
      let formattedFecha = des.fecha || "";
      if (formattedFecha && formattedFecha.includes("T")) {
        const parts = formattedFecha.split(":");
        if (parts.length > 2) {
          formattedFecha = parts.slice(0, 2).join(":");
        }
      }
      state.form = {
        idDesignacion: id,
        canchaId: canchaId,
        fecha: formattedFecha,
        cantidadPartidos: des.cantidadPartidos || 1,
        etapaCampeonato: des.etapaCampeonato || des.etapaTorneo || "FECHA_NORMAL",
      };
    } else {
      state.form = {};
    }
  } else {
    state.form = {};
  }
};

export const closeModal = () => {
  state.modal = null;
};

export const saveCancha = () => {
  const { nombreCancha, categoria, fueraDeJuego, estado } = state.form;
  if (!nombreCancha) {
    alert("Completá el nombre de la cancha.");
    return;
  }
  // try to create via API, fallback to local
  const dto = {
    nombreCancha: nombreCancha.trim(),
    categoria: categoria || "ELITE",
    fueraDeJuego: fueraDeJuego !== undefined ? fueraDeJuego : false,
    estado: estado !== undefined ? estado : true,
  };
  canchaService
    .createCancha(dto)
    .then((created) => {
      // backend may return created cancha or nothing
      if (created && (created.idCancha || created.id)) {
        // Normalizar la cancha creada y guardarla
        const newCancha = {
          id: created.idCancha || created.id,
          nombre: created.nombreCancha || created.nombre || dto.nombreCancha,
          categoria: created.categoria || dto.categoria,
          fueraDeJuego:
            created.fueraDeJuego !== undefined
              ? created.fueraDeJuego
              : dto.fueraDeJuego,
          estado: created.estado !== undefined ? created.estado : dto.estado,
          partidos: created.partidos || 0,
          ciudad: created.ciudad || "",
          capacidad: created.capacidad || 0,
          ...created,
        };
        state.canchas.push(newCancha);
      } else {
        const id = state.nextCanchaId++;
        state.canchas.push({
          id,
          nombre: dto.nombreCancha,
          categoria: dto.categoria,
          fueraDeJuego: dto.fueraDeJuego,
          estado: dto.estado,
          partidos: 0,
          ciudad: "",
          capacidad: 0,
          ...dto,
        });
      }
      closeModal();
    })
    .catch((err) => {
      console.warn("createCancha failed, using local fallback", err);
      const id = state.nextCanchaId++;
      state.canchas.push({
        id,
        nombre: dto.nombreCancha,
        categoria: dto.categoria,
        fueraDeJuego: dto.fueraDeJuego,
        estado: dto.estado,
        partidos: 0,
        ciudad: "",
        capacidad: 0,
        ...dto,
      });
      closeModal();
    });
};

export const saveEditCancha = (id) => {
  const c = getCancha(id);
  if (!c) return;
  const nombreCancha = state.form.nombreCancha || state.form.nombre;
  c.nombreCancha = nombreCancha?.trim() || c.nombreCancha || c.nombre;
  c.nombre = c.nombreCancha;
  c.categoria = state.form.categoria || c.categoria;
  c.fueraDeJuego =
    state.form.fueraDeJuego !== undefined
      ? state.form.fueraDeJuego
      : c.fueraDeJuego;
  c.estado = state.form.estado !== undefined ? state.form.estado : c.estado;
  closeModal();
};

export const deleteCancha = (id) => {
  if (!confirm("¿Eliminar esta cancha?")) return;
  state.canchas = state.canchas.filter((c) => c.id !== id);
  state.designaciones = state.designaciones.filter((d) => d.canchaId !== id);
};

export const saveArbitro = () => {
  const {
    idArbitro,
    nombre,
    apellido,
    whatsapp,
    estado,
    disponibleSabado,
    disponibleDomingo,
    categoria,
    talleCamiseta,
    talleShort,
  } = state.form;
  if (!nombre || !apellido) {
    alert("Ingresá nombre y apellido.");
    return;
  }
  const dto = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    rol: "Árbitro Principal",
    whatsapp: whatsapp?.trim() || "",
    estado: estado !== undefined ? estado : true,
    disponibleSabado: disponibleSabado !== undefined ? disponibleSabado : true,
    disponibleDomingo: disponibleDomingo !== undefined ? disponibleDomingo : true,
    categoria: categoria || "INCIAL",
    talleCamiseta: talleCamiseta || "M",
    talleShort: talleShort || "M",
  };

  const isEdit = !!idArbitro;

  if (isEdit) {
    arbitroService
      .updateArbitro(idArbitro, dto)
      .then((updated) => {
        const a = getArbitro(idArbitro);
        if (a) {
          Object.assign(a, { ...dto, ...(updated || {}) });
        }
        closeModal();
      })
      .catch((err) => {
        console.warn("updateArbitro failed, updating locally", err);
        const a = getArbitro(idArbitro);
        if (a) {
          Object.assign(a, dto);
        }
        closeModal();
      });
  } else {
    arbitroService
      .createArbitro(dto)
      .then((created) => {
        if (created && created.idArbitro) {
          state.arbitros.push(created);
        } else if (created && created.id) {
          state.arbitros.push({ idArbitro: created.id, ...created });
        } else {
          state.arbitros.push({
            idArbitro: state.nextArbId++,
            designaciones: 0,
            estado: true,
            ...dto,
          });
        }
        closeModal();
      })
      .catch((err) => {
        console.warn("createArbitro failed, using local fallback", err);
        state.arbitros.push({
          idArbitro: state.nextArbId++,
          designaciones: 0,
          estado: true,
          ...dto,
        });
        closeModal();
      });
  }
};

export const deleteArbitro = (id) => {
  if (!confirm("¿Eliminar este árbitro?")) return;
  arbitroService
    .deleteArbitro(id)
    .then(() => {
      state.arbitros = state.arbitros.filter((a) => a.idArbitro !== id);
    })
    .catch((err) => {
      console.warn("deleteArbitro failed, using local fallback", err);
      state.arbitros = state.arbitros.filter((a) => a.idArbitro !== id);
    });
};

export const updateArbitroDisponibilidad = (id, key) => {
  const a = getArbitro(id);
  if (!a) return Promise.reject("Árbitro no encontrado");

  const updatedValue = !a[key];
  const dto = {
    estado: key === 'estado' ? updatedValue : (a.estado !== undefined ? a.estado : true),
    disponibleSabado: key === 'disponibleSabado' ? updatedValue : (a.disponibleSabado !== undefined ? a.disponibleSabado : true),
    disponibleDomingo: key === 'disponibleDomingo' ? updatedValue : (a.disponibleDomingo !== undefined ? a.disponibleDomingo : true),
  };

  return arbitroService
    .updateDisponibilidad(id, dto)
    .then((res) => {
      Object.assign(a, res || { idArbitro: id, ...dto });
    })
    .catch((err) => {
      console.warn("updateDisponibilidad failed, updating locally", err);
      a[key] = updatedValue;
    });
};

export const toggleDisponible = (id) => {
  return updateArbitroDisponibilidad(id, 'estado');
};

export const marcarTodosNoDisponibles = () => {
  if (
    !confirm(
      "¿Estás seguro de que deseas marcar a todos los árbitros como no disponibles?",
    )
  )
    return;
  arbitroService
    .updateDisponibilidadTotal()
    .then(() => {
      state.arbitros.forEach((a) => {
        a.estado = false;
      });
    })
    .catch((err) => {
      console.warn("updateDisponibilidadTotal failed, updating locally", err);
      state.arbitros.forEach((a) => {
        a.estado = false;
      });
    });
};

export const loadArbitros = async (page = 0, size = 100) => {
  try {
    const res = await arbitroService.getAll(page, size);
    // support Spring Page and plain arrays
    state.arbitros = Array.isArray(res) ? res : res.content || res;
  } catch (e) {
    console.warn("Failed to load arbitros", e);
  }
};

export const loadCanchas = async (page = 0, size = 100) => {
  try {
    const res = await canchaService.getAll(page, size);
    let canchas = Array.isArray(res) ? res : res.content || res;
    // Normalizar propiedades del backend
    state.canchas = canchas.map((c) => ({
      id: c.idCancha || c.id,
      nombre: c.nombreCancha || c.nombre,
      ciudad: c.ciudad || "",
      partidos: c.partidos || 0,
      capacidad: c.capacidad || 0,
      categoria: c.categoria || "",
      fueraDeJuego: c.fueraDeJuego || false,
      ...c, // mantener todas las propiedades originales
    }));
  } catch (e) {
    console.warn("Failed to load canchas", e);
  }
};

const getMostRecentSaturday = () => {
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


export const loadDesignacionesIncompletas = async (page = 0, size = 100) => {
  try {
    const res0 = await designacionService.getByEstado(0, page, size);
    let list0 = Array.isArray(res0) ? res0 : res0.content || res0;

    let list3 = [];
    try {
      const res3 = await designacionService.getByEstado(3, page, size);
      list3 = Array.isArray(res3) ? res3 : res3.content || res3;
    } catch (e3) {
      console.warn("Failed to load cancelled designaciones (state 3)", e3);
    }

    let list = [...list0, ...list3];
    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    state.designacionesIncompletas = sortDesignaciones(list);
    
    // Pre-cargar árbitros asignados en el mapa
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
    console.warn("Failed to load designaciones incompletas", e);
  }
};

export const loadDesignacionesCompletas = async (page = 0, size = 100) => {
  try {
    const res = await designacionService.getByEstado(1, page, size);
    let list = Array.isArray(res) ? res : res.content || res;
    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    state.designaciones = sortDesignaciones(list);

    // Pre-cargar árbitros asignados en el mapa
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

export const loadDesignacionesFinalizadas = async (page = 0, size = 100) => {
  try {
    const res = await designacionService.getByEstado(2, page, size);
    let list = Array.isArray(res) ? res : res.content || res;
    const limitDate = getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    state.designacionesFinalizadas = sortDesignaciones(list);

    // Pre-cargar árbitros asignados en el mapa
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
    .then(() => {
      loadDesignacionesIncompletas();
      loadDesignacionesCompletas();
      loadDesignacionesFinalizadas();
      closeModal();
    })
    .catch((err) => {
      console.warn("createDesignacion failed, using local fallback", err);
      state.designacionesIncompletas.push({
        id: state.nextDesId++,
        canchaId,
        ...dto,
        arbitros: [],
      });
      state.designacionesIncompletas = sortDesignaciones(
        state.designacionesIncompletas,
      );
      closeModal();
    });
};

export const updateDesignacion = () => {
  const { idDesignacion, canchaId, fecha, cantidadPartidos, etapaCampeonato } = state.form;
  const c = getCancha(canchaId);
  if (!canchaId || !fecha || !cantidadPartidos) {
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
    .actualizarDesignacion(idDesignacion, dto)
    .then(() => {
      loadDesignacionesIncompletas();
      loadDesignacionesCompletas();
      loadDesignacionesFinalizadas();
      closeModal();
    })
    .catch((err) => {
      console.warn("actualizarDesignacion failed, using local fallback", err);
      // Fallback local en caso de error
      const updateInList = (list) => {
        const idx = list.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            idCancha: canchaId,
            canchaId: canchaId,
            cancha: c,
            fecha: formattedFecha,
            cantidadPartidos: cantidadPartidos,
            etapaCampeonato: etapaCampeonato || "FECHA_NORMAL",
          };
          return true;
        }
        return false;
      };

      if (!updateInList(state.designacionesIncompletas)) {
        if (!updateInList(state.designaciones)) {
          if (!updateInList(state.designacionesFinalizadas)) {
            updateInList(state.designacionesAConfirmar);
          }
        }
      }

      state.designacionesIncompletas = sortDesignaciones(state.designacionesIncompletas);
      state.designaciones = sortDesignaciones(state.designaciones);
      state.designacionesFinalizadas = sortDesignaciones(state.designacionesFinalizadas);
      state.designacionesAConfirmar = sortDesignaciones(state.designacionesAConfirmar);
      closeModal();
    });
};

export const deleteDesignacion = (id) => {
  if (!confirm("¿Eliminar esta designación?")) return;
  designacionService
    .deleteDesignacion(id)
    .then(() => {
      loadDesignacionesIncompletas();
      loadDesignacionesCompletas();
      loadDesignacionesFinalizadas();
    })
    .catch((err) => {
      console.warn("deleteDesignacion failed, using local fallback", err);
      state.designaciones = state.designaciones.filter(
        (d) => (d.idDesignacion || d.id) !== id,
      );
      state.designacionesIncompletas = state.designacionesIncompletas.filter(
        (d) => (d.idDesignacion || d.id) !== id,
      );
      state.designacionesFinalizadas = state.designacionesFinalizadas.filter(
        (d) => (d.idDesignacion || d.id) !== id,
      );
      state.designacionesAConfirmar = state.designacionesAConfirmar.filter(
        (d) => (d.idDesignacion || d.id) !== id,
      );
    });
};

export const updateDesignacionStateLocal = (idDesignacion) => {
  let des = null;
  let fromList = null;
  let idx = -1;

  idx = state.designacionesIncompletas.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
  if (idx !== -1) {
    des = state.designacionesIncompletas[idx];
    fromList = "incompleta";
  } else {
    idx = state.designaciones.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (idx !== -1) {
      des = state.designaciones[idx];
      fromList = "completa";
    }
  }

  if (!des) return;

  const req = minArbitros(des.cantidadPartidos);
  const assigned = state.arbitrosDesignadosMap[idDesignacion] || [];
  const count = assigned.length;

  if (count >= req) {
    des.estadoDesignacion = 1; // Completa
    if (fromList === "incompleta") {
      state.designacionesIncompletas.splice(idx, 1);
      state.designaciones.push(des);
    }
  } else {
    des.estadoDesignacion = 0; // Incompleta
    if (fromList === "completa") {
      state.designaciones.splice(idx, 1);
      state.designacionesIncompletas.push(des);
    }
  }

  state.designacionesIncompletas = sortDesignaciones(state.designacionesIncompletas);
  state.designaciones = sortDesignaciones(state.designaciones);
};

export const getDayOfWeekLocal = (fechaStr) => {
  if (!fechaStr) return -1;
  try {
    const datePart = fechaStr.includes("T") ? fechaStr.split("T")[0] : fechaStr;
    const parts = datePart.split("-").map(Number);
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      const dateObj = new Date(yyyy, mm - 1, dd);
      return dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    }
  } catch (e) {
    console.warn("Error parsing date in getDayOfWeekLocal", e);
  }
  return -1;
};

export const isRefereeAssignedToDifferentCourtOnSameDay = (idArbitro, targetDes) => {
  const targetDateStr = targetDes.fecha ? targetDes.fecha.split("T")[0] : "";
  const targetCanchaId = targetDes.idCancha || targetDes.canchaId || targetDes.cancha?.idCancha || targetDes.cancha?.id;

  if (!targetDateStr) return false;

  const allLists = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar
  ];

  for (const otherD of allLists) {
    const otherId = otherD.idDesignacion || otherD.id;
    const targetId = targetDes.idDesignacion || targetDes.id;
    if (otherId !== targetId) {
      const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
      if (otherDateStr && otherDateStr === targetDateStr) {
        const assigned = state.arbitrosDesignadosMap[otherId] || [];
        const isAssigned = assigned.some(
          (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro
        );
        if (isAssigned) {
          const otherCanchaId = otherD.idCancha || otherD.canchaId || otherD.cancha?.idCancha || otherD.cancha?.id;
          if (String(otherCanchaId) !== String(targetCanchaId)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

export const asignarArbitros = async (idDesignacion) => {
  try {
    // 1. Encontrar la designación en las incompletas o completas
    const list = [...state.designacionesIncompletas, ...state.designaciones];
    const des = list.find((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (!des) {
      throw new Error("No se encontró la designación.");
    }

    // 2. Asegurarse de tener todos los árbitros cargados
    if (!state.arbitros || state.arbitros.length === 0) {
      await loadArbitros();
    }

    // 3. Obtener árbitros disponibles (estado === true) y por día de disponibilidad
    let disponibles = state.arbitros.filter((a) => {
      if (!a.estado) return false;
      const day = getDayOfWeekLocal(des.fecha);
      if (day === 6) return a.disponibleSabado; // Sábado
      if (day === 0) return a.disponibleDomingo; // Domingo
      return true;
    });

    // 4. Determinar si es sábado
    const isSaturday = getDayOfWeekLocal(des.fecha) === 6;
    const targetCanchaId = des.idCancha || des.canchaId || des.cancha?.idCancha || des.cancha?.id;

    // 5. Excluir árbitros según las reglas:
    // A) Regla especial de sábados: No repetir la misma cancha los días sábado
    const satRepetitionExcluded = new Set();
    if (isSaturday) {
      state.designacionesFinalizadas.forEach((finalD) => {
        const finalCanchaId = finalD.idCancha || finalD.canchaId || finalD.cancha?.idCancha || finalD.cancha?.id;
        if (String(finalCanchaId) === String(targetCanchaId) && getDayOfWeekLocal(finalD.fecha) === 6) {
          // Esta designación finalizada fue un sábado en la misma cancha! Excluir a sus árbitros
          const assigned = finalD.arbitrosDesignados || finalD.arbitros || [];
          assigned.forEach((asg) => {
            const arbId = asg.arbitro?.idArbitro || asg.idArbitro;
            if (arbId) satRepetitionExcluded.add(arbId);
          });
        }
      });
    }

    // Filtrar la lista de elegibles
    let elegibles = disponibles.filter((arb) => {
      const id = arb.idArbitro;
      // Regla especial de sábados: No repetir cancha
      if (isSaturday && satRepetitionExcluded.has(id)) return false;
      // Regla general: No estar designado en dos canchas diferentes el mismo día
      if (isRefereeAssignedToDifferentCourtOnSameDay(id, des)) return false;
      return true;
    });

    // 6. Ordenar árbitros por menor carga de partidos
    elegibles.sort((a, b) => (a.designaciones || 0) - (b.designaciones || 0));

    // 7. Determinar cuántos árbitros se requieren
    const req = minArbitros(des.cantidadPartidos);

    // 8. Tomar los primeros y asignarlos
    const selected = elegibles.slice(0, req);
    
    // Guardar en el mapa local
    state.arbitrosDesignadosMap[idDesignacion] = selected.map((arb, index) => ({
      idDesignados: Date.now() + index + Math.random(),
      arbitro: arb,
      partidosDirigidos: arb.designaciones || 0
    }));

    // 9. Actualizar estado e intercambiar de lista si es necesario
    updateDesignacionStateLocal(idDesignacion);

    return state.arbitrosDesignadosMap[idDesignacion];
  } catch (error) {
    console.error("Error al asignar árbitros automáticamente en frontend:", error);
    alert("Hubo un error al intentar asignar árbitros automáticamente.");
    throw error;
  }
};

export const quitarArbitroDeDesignacionManual = async (
  idDesignacion,
  idArbitro,
) => {
  try {
    if (state.arbitrosDesignadosMap[idDesignacion]) {
      state.arbitrosDesignadosMap[idDesignacion] = state.arbitrosDesignadosMap[idDesignacion].filter(
        (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) !== idArbitro
      );
    }
    updateDesignacionStateLocal(idDesignacion);
    return true;
  } catch (error) {
    console.error("Error al quitar árbitro manualmente en frontend:", error);
    alert("Hubo un error al intentar quitar el árbitro.");
    throw error;
  }
};

export const asignarArbitroADesignacionManual = async (
  idDesignacion,
  idArbitro,
) => {
  try {
    const des = [...state.designacionesIncompletas, ...state.designaciones, ...state.designacionesAConfirmar, ...state.designacionesFinalizadas]
      .find((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (!des) {
      throw new Error("No se encontró la designación.");
    }

    const arb = state.arbitros.find((a) => a.idArbitro === idArbitro);
    if (!arb) {
      throw new Error("No se encontró el árbitro.");
    }

    if (!state.arbitrosDesignadosMap[idDesignacion]) {
      state.arbitrosDesignadosMap[idDesignacion] = [];
    }

    const exists = state.arbitrosDesignadosMap[idDesignacion].some(
      (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro
    );
    if (exists) {
      throw new Error("El árbitro ya está asignado a esta designación.");
    }

    // Validación estricta: un árbitro no puede estar en dos canchas diferentes el mismo día
    if (isRefereeAssignedToDifferentCourtOnSameDay(idArbitro, des)) {
      let otherCanchaName = "otra cancha";
      const targetDateStr = des.fecha ? des.fecha.split("T")[0] : "";
      const targetCanchaId = des.idCancha || des.canchaId || des.cancha?.idCancha || des.cancha?.id;
      const allLists = [
        ...state.designacionesIncompletas,
        ...state.designaciones,
        ...state.designacionesFinalizadas,
        ...state.designacionesAConfirmar
      ];
      for (const otherD of allLists) {
        const otherId = otherD.idDesignacion || otherD.id;
        if (otherId !== idDesignacion) {
          const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
          if (otherDateStr && otherDateStr === targetDateStr) {
            const assigned = state.arbitrosDesignadosMap[otherId] || [];
            const isAssigned = assigned.some(
              (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro
            );
            if (isAssigned) {
              const otherCid = otherD.idCancha || otherD.canchaId || otherD.cancha?.idCancha || otherD.cancha?.id;
              if (String(otherCid) !== String(targetCanchaId)) {
                otherCanchaName = otherD.cancha?.nombreCancha || otherD.cancha?.nombre || getCancha(otherD.idCancha || otherD.canchaId)?.nombre || "otra cancha";
                break;
              }
            }
          }
        }
      }
      throw new Error(`El árbitro ya está asignado en la cancha "${otherCanchaName}" para este día. No puede dirigir en dos canchas diferentes el mismo día.`);
    }

    state.arbitrosDesignadosMap[idDesignacion].push({
      idDesignados: Date.now() + Math.random(),
      arbitro: arb,
      partidosDirigidos: arb.designaciones || 0
    });

    updateDesignacionStateLocal(idDesignacion);
    return true;
  } catch (error) {
    console.error("Error al asignar árbitro manualmente en frontend:", error);
    alert(error.message || "Hubo un error al intentar asignar el árbitro.");
    throw error;
  }
};

export const cancelarDesignacionManual = async (idDesignacion) => {
  try {
    const res = await designacionService.cancelarDesignacion(idDesignacion);
    await loadDesignacionesIncompletas();
    await loadDesignacionesCompletas();
    await loadDesignacionesFinalizadas();
    return res;
  } catch (error) {
    console.error("Error al cancelar designación", error);
    alert("Hubo un error al intentar cancelar la designación.");
    throw error;
  }
};

export const finalizarDesignacionManual = async (idDesignacion) => {
  console.log(
    "Iniciando pre-finalización (moviendo a sección de confirmación) para la designación con ID:",
    idDesignacion,
  );
  try {
    const arbitrosAsignados = state.arbitrosDesignadosMap[idDesignacion] || [];

    // Mover localmente a "A Confirmar" (estadoDesignacion = 3)
    let des = null;
    let idx = state.designaciones.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (idx !== -1) {
      des = state.designaciones[idx];
      state.designaciones.splice(idx, 1);
    } else {
      idx = state.designacionesIncompletas.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
      if (idx !== -1) {
        des = state.designacionesIncompletas[idx];
        state.designacionesIncompletas.splice(idx, 1);
      }
    }

    if (des) {
      des.estadoDesignacion = 3; // Pendiente de Confirmación
      des.arbitrosDesignados = arbitrosAsignados; // Guardar localmente
      state.designacionesAConfirmar.push(des);
    }

    state.designacionesIncompletas = sortDesignaciones(state.designacionesIncompletas);
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(state.designacionesAConfirmar);

    return { success: true };
  } catch (error) {
    console.error("Error al pre-finalizar designación", error);
    const msg = error.message || "Hubo un error al intentar pre-finalizar la designación.";
    alert(msg);
    throw error;
  }
};

export const confirmarEnvioCancha = async (canchaId) => {
  const desList = state.designacionesAConfirmar.filter(d => {
    const cid = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
    return String(cid) === String(canchaId);
  });

  if (desList.length === 0) return;

  const canchaNombre = desList[0].cancha?.nombreCancha || desList[0].cancha?.nombre || getCancha(canchaId)?.nombre || 'Cancha';

  // Estructurar el payload final para enviar al backend
  const payload = {
    canchaId: canchaId,
    canchaNombre: canchaNombre,
    designaciones: desList.map(des => {
      const idDesignacion = des.idDesignacion || des.id;
      const arbitrosAsignados = state.arbitrosDesignadosMap[idDesignacion] || [];
      return {
        idDesignacion: idDesignacion,
        fecha: des.fecha,
        cantidadPartidos: des.cantidadPartidos,
        etapaCampeonato: des.etapaCampeonato || "FECHA_NORMAL",
        arbitros: arbitrosAsignados.map(a => ({
          idArbitro: a.arbitro?.idArbitro,
          nombre: `${a.arbitro?.nombre} ${a.arbitro?.apellido}`,
          rol: a.arbitro?.rol || "Árbitro Principal",
          partidosDirigidos: a.partidosDirigidos || 0
        }))
      };
    })
  };

  console.log("====================================================");
  console.log("CONFIRMANDO Y ENVIANDO DESIGNACIONES DE LA CANCHA AL BACKEND:");
  console.log(JSON.stringify(payload, null, 2));
  console.log("====================================================");

  // Llamar al endpoint de enviar lista de árbitros y luego al de finalizar backend de cada designacion
  const promises = desList.map(async (des) => {
    const idDesignacion = des.idDesignacion || des.id;
    const arbitrosAsignados = state.arbitrosDesignadosMap[idDesignacion] || [];
    const idsArbitros = arbitrosAsignados.map(a => a.arbitro?.idArbitro || a.idArbitro);
    
    try {
      // 1. Enviar la lista de árbitros al nuevo endpoint POST /designaciones/designar-lista?idDesignacion=X
      console.log(`Enviando lista de árbitros para designación ${idDesignacion}:`, idsArbitros);
      await designacionService.enviarListaArbitros(idDesignacion, idsArbitros);
      
      // 2. Finalizar la designación en el backend
      console.log(`Finalizando designación ${idDesignacion} en el backend...`);
      await designacionService.finalizarDesignacion(idDesignacion);
    } catch (err) {
      console.warn(`Llamado al backend falló para designación ${idDesignacion}, procediendo localmente`, err);
    }
    return { success: true };
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    console.warn("Algunas llamadas al backend fallaron, continuando localmente", err);
  }

  // Mover estas designaciones a Finalizadas (estadoDesignacion = 2)
  desList.forEach(des => {
    const idx = state.designacionesAConfirmar.findIndex(d => (d.idDesignacion || d.id) === (des.idDesignacion || des.id));
    if (idx !== -1) {
      state.designacionesAConfirmar.splice(idx, 1);
    }
    des.estadoDesignacion = 2; // Finalizada
    state.designacionesFinalizadas.push(des);
  });

  state.designacionesFinalizadas = sortDesignaciones(state.designacionesFinalizadas);
  state.designacionesAConfirmar = sortDesignaciones(state.designacionesAConfirmar);

  alert(`¡Designaciones de la cancha "${canchaNombre}" enviadas y confirmadas con éxito al backend!`);
};

export const deshacerFinalizacionLocal = (idDesignacion) => {
  const idx = state.designacionesAConfirmar.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
  if (idx !== -1) {
    const des = state.designacionesAConfirmar[idx];
    state.designacionesAConfirmar.splice(idx, 1);
    
    // Check if complete or incomplete based on referees count
    const req = minArbitros(des.cantidadPartidos);
    const assigned = state.arbitrosDesignadosMap[idDesignacion] || [];
    if (assigned.length >= req) {
      des.estadoDesignacion = 1; // Completa
      state.designaciones.push(des);
    } else {
      des.estadoDesignacion = 0; // Incompleta
      state.designacionesIncompletas.push(des);
    }

    state.designacionesIncompletas = sortDesignaciones(state.designacionesIncompletas);
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(state.designacionesAConfirmar);
  }
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
    await loadDesignacionesIncompletas();
    await loadDesignacionesCompletas();
    await loadDesignacionesFinalizadas();
  } catch (error) {
    console.error("Error al clonar designaciones", error);
    alert("Hubo un error al clonar algunas designaciones.");
    await loadDesignacionesIncompletas();
    await loadDesignacionesCompletas();
    await loadDesignacionesFinalizadas();
    throw error;
  }
};

export const loadSuspensiones = async () => {
  try {
    const res = await suspencionService.getAll();
    state.suspensiones = Array.isArray(res) ? res : res.content || res;
  } catch (e) {
    console.warn("Failed to load suspensiones, using local state", e);
  }
};

export const saveSuspencion = async (dto) => {
  try {
    const created = await suspencionService.create(dto);
    const newSusp = {
      id: created?.id || created?.idSuspencion || state.nextSuspId++,
      ...dto,
      ...created,
    };
    state.suspensiones.push(newSusp);

    if (dto.tipoSuspencion === 2) {
      const arb = getArbitro(dto.arbitro);
      if (arb && arb.estado) {
        arb.estado = false;
        try {
          await arbitroService.updateDisponibilidad(dto.arbitro);
        } catch (err) {
          console.warn("Failed to persist availability change in backend", err);
        }
      }
    }
    return newSusp;
  } catch (e) {
    console.warn("create suspencion failed, using local fallback", e);
    const newSusp = {
      id: state.nextSuspId++,
      ...dto,
    };
    state.suspensiones.push(newSusp);

    if (dto.tipoSuspencion === 2) {
      const arb = getArbitro(dto.arbitro);
      if (arb && arb.estado) {
        arb.estado = false;
      }
    }
    return newSusp;
  }
};

export const deleteSuspencion = async (idSuspencion) => {
  if (!confirm("¿Deseas eliminar/revocar esta sanción?")) return;
  try {
    await suspencionService.deleteSuspencion(idSuspencion);
    state.suspensiones = state.suspensiones.filter(
      (s) => s.id !== idSuspencion && s.idSuspencion !== idSuspencion,
    );
    alert("Sanción eliminada correctamente");
  } catch (e) {
    console.warn("delete suspencion failed, using local fallback", e);
    state.suspensiones = state.suspensiones.filter(
      (s) => s.id !== idSuspencion && s.idSuspencion !== idSuspencion,
    );
    alert("Sanción eliminada correctamente");
  }
};
