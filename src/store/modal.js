import { state, ROLES_ARB } from "./state";
import { getCancha, getArbitro } from "./helpers";

export const openModal = (type, id = null, data = null) => {
  state.modal = { type, id, data };
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
  } else if ((type === "manageReferees" || type === "updateFees") && id) {
    state.form = { idDesignacion: id };
  } else if (type === "editDesignacion" && id) {
    const list = [
      ...state.designacionesIncompletas,
      ...state.designaciones,
      ...state.designacionesFinalizadas,
      ...state.designacionesAConfirmar,
    ];
    let des = list.find((d) => (d.idDesignacion || d.id) === id);
    if (!des && data) {
      des = data;
    }
    if (des) {
      const canchaId =
        des.idCancha ||
        des.canchaId ||
        (des.cancha ? des.cancha.idCancha || des.cancha.id : null);
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
        etapaCampeonato:
          des.etapaCampeonato || des.etapaTorneo || "FECHA_NORMAL",
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
