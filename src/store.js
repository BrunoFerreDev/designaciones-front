import { reactive, computed } from "vue";
import arbitroService from "./services/arbitroService";
import canchaService from "./services/canchaService";
import designacionService from "./services/designacionService";

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
  view: "dashboard",
  canchas: [],
  arbitros: [],
  designaciones: [],
  designacionesIncompletas: [],
  designacionesFinalizadas: [],
  designacionesArbitros: [],
  modal: null,
  nextCanchaId: 4,
  nextArbId: 9,
  nextDesId: 3,
  form: {},
  selectedArbitros: [],
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
      return timeA - timeB;
    }
    const nameA = a.cancha?.nombreCancha || "";
    const nameB = b.cancha?.nombreCancha || "";
    return nameA.localeCompare(nameB);
  });
};

// Actions
export const setView = (v) => {
  state.view = v;
};

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
      nombre: "",
      apellido: "",
      whatsapp: "",
    };
  } else if (type === "addDesignacion") {
    state.form = { cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL" }; // defaults para designación
  } else if (type === "manageReferees" && id) {
    state.form = { idDesignacion: id };
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

export const toggleDisponible = (id) => {
  // call backend to toggle availability, then update local state
  arbitroService
    .updateDisponibilidad(id)
    .then(() => {
      const a = getArbitro(id);
      if (a) a.estado = !a.estado;
    })
    .catch((err) => {
      console.warn("updateDisponibilidad failed, toggling locally", err);
      const a = getArbitro(id);
      if (a) a.estado = !a.estado;
    });
};

export const marcarTodosNoDisponibles = () => {
  if (
    !confirm(
      "¿Estás seguro de que deseas marcar a todos los árbitros como no disponibles?"
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

export const loadDesignacionesIncompletas = async (page = 0, size = 100) => {
  try {
    const res = await designacionService.getByEstado(0, page, size);
    state.designacionesIncompletas = sortDesignaciones(
      Array.isArray(res) ? res : res.content || res
    );
  } catch (e) {
    console.warn("Failed to load designaciones incompletas", e);
  }
};

export const loadDesignacionesCompletas = async (page = 0, size = 100) => {
  try {
    const res = await designacionService.getByEstado(1, page, size);
    state.designaciones = sortDesignaciones(
      Array.isArray(res) ? res : res.content || res
    );
  } catch (e) {
    console.warn("Failed to load designaciones completas", e);
  }
};

export const loadDesignacionesFinalizadas = async (page = 0, size = 100) => {
  try {
    const res = await designacionService.getByEstado(2, page, size);
    state.designacionesFinalizadas = sortDesignaciones(
      Array.isArray(res) ? res : res.content || res
    );
  } catch (e) {
    console.warn("Failed to load designaciones finalizadas", e);
  }
};
export const loadArbitrosDesignados = async (idDesignacion) => {
  try {
    const res = await designacionService.getDesignados(idDesignacion);
    return Array.isArray(res) ? res : res.data || res;
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
      state.designacionesIncompletas = sortDesignaciones(state.designacionesIncompletas);
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
    });
};

export const asignarArbitros = async (idDesignacion) => {
  try {
    const res =
      await designacionService.asignarArbitrosAutomaticamente(idDesignacion);
    loadDesignacionesIncompletas();
    loadDesignacionesCompletas();
    return res;
  } catch (error) {
    console.error("Error al asignar árbitros automáticamente", error);
    alert("Hubo un error al intentar asignar árbitros automáticamente.");
    throw error;
  }
};

export const quitarArbitroDeDesignacionManual = async (
  idDesignacion,
  idArbitro,
) => {
  try {
    const res = await designacionService.quitarArbitroManual(
      idDesignacion,
      idArbitro,
    );
    await loadDesignacionesIncompletas();
    await loadDesignacionesCompletas();
    await loadDesignacionesFinalizadas();
    return res;
  } catch (error) {
    console.error("Error al quitar árbitro manualmente", error);
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Hubo un error al intentar quitar el árbitro.";
    alert(msg);
    throw error;
  }
};

export const asignarArbitroADesignacionManual = async (
  idDesignacion,
  idArbitro,
) => {
  try {
    const res = await designacionService.asignarArbitroManual(
      idDesignacion,
      idArbitro,
    );
    await loadDesignacionesIncompletas();
    await loadDesignacionesCompletas();
    await loadDesignacionesFinalizadas();
    return res;
  } catch (error) {
    console.error("Error al asignar árbitro manualmente", error);
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Hubo un error al intentar asignar el árbitro.";
    alert(msg);
    throw error;
  }
};

export const finalizarDesignacionManual = async (idDesignacion) => {
  console.log(
    "Iniciando finalización para la designación con ID:",
    idDesignacion,
  );
  try {
    const res = await designacionService.finalizarDesignacion(idDesignacion);
    console.log("Respuesta de finalización exitosa:", res);
    await loadDesignacionesIncompletas();
    await loadDesignacionesCompletas();
    await loadDesignacionesFinalizadas();
    return res;
  } catch (error) {
    console.error("Error al finalizar designación manualmente", error);
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Hubo un error al intentar finalizar la designación.";
    alert(msg);
    throw error;
  }
};
