import { state } from "./state";
import { getCancha } from "./helpers";
import { closeModal } from "./modal";
import {
  persistCanchasStorage,
  updateCanchaInStorage,
  removeCanchaFromStorage,
} from "./storage";
import canchaService from "../services/canchaService";

export const saveCancha = () => {
  const { nombreCancha, categoria, fueraDeJuego, estado } = state.form;
  if (!nombreCancha) {
    alert("Completá el nombre de la cancha.");
    return;
  }
  const dto = {
    nombreCancha: nombreCancha.trim(),
    categoria: categoria || "ELITE",
    fueraDeJuego: fueraDeJuego !== undefined ? fueraDeJuego : false,
    estado: estado !== undefined ? estado : true,
  };
  canchaService
    .createCancha(dto)
    .then((created) => {
      if (created && (created.idCancha || created.id)) {
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
        updateCanchaInStorage(state, newCancha);
      } else {
        const id = state.nextCanchaId++;
        const fallback = {
          id,
          nombre: dto.nombreCancha,
          categoria: dto.categoria,
          fueraDeJuego: dto.fueraDeJuego,
          estado: dto.estado,
          partidos: 0,
          ciudad: "",
          capacidad: 0,
          ...dto,
        };
        updateCanchaInStorage(state, fallback);
      }
      closeModal();
    })
    .catch((err) => {
      console.warn("createCancha failed, using local fallback", err);
      const id = state.nextCanchaId++;
      const fallback = {
        id,
        nombre: dto.nombreCancha,
        categoria: dto.categoria,
        fueraDeJuego: dto.fueraDeJuego,
        estado: dto.estado,
        partidos: 0,
        ciudad: "",
        capacidad: 0,
        ...dto,
      };
      updateCanchaInStorage(state, fallback);
      closeModal();
    });
};

export const saveEditCancha = (id) => {
  const c = getCancha(id);
  if (!c) return;
  const nombreCancha = state.form.nombreCancha || state.form.nombre;
  const dto = {
    nombreCancha: nombreCancha?.trim() || c.nombreCancha || c.nombre,
    categoria: state.form.categoria || c.categoria || "ELITE",
    fueraDeJuego:
      state.form.fueraDeJuego !== undefined
        ? state.form.fueraDeJuego
        : c.fueraDeJuego,
    estado: state.form.estado !== undefined ? state.form.estado : c.estado,
  };

  // Optimistic local update
  Object.assign(c, {
    nombre: dto.nombreCancha,
    nombreCancha: dto.nombreCancha,
    categoria: dto.categoria,
    fueraDeJuego: dto.fueraDeJuego,
    estado: dto.estado,
  });
  updateCanchaInStorage(state, c);
  closeModal();

  canchaService
    .updateCancha(id, dto)
    .then((updated) => {
      if (updated) {
        Object.assign(c, updated);
        updateCanchaInStorage(state, c);
      }
    })
    .catch((err) => {
      console.warn("updateCancha failed on backend, kept local state", err);
    });
};

export const toggleCanchaEstado = (id) => {
  const c = getCancha(id);
  if (!c) return Promise.reject("Cancha no encontrada");

  const currentEstado = c.estado !== undefined ? Boolean(c.estado) : true;
  c.estado = !currentEstado;
  updateCanchaInStorage(state, c);

  return canchaService
    .toggleEstado(id)
    .then((res) => {
      if (res && typeof res === "object") {
        Object.assign(c, res);
        updateCanchaInStorage(state, c);
      }
      return c;
    })
    .catch((err) => {
      console.warn("toggleEstado failed, keeping local toggle", err);
      return c;
    });
};

export const deleteCancha = (id) => {
  if (!confirm("¿Eliminar esta cancha?")) return;
  removeCanchaFromStorage(state, id);
  state.designaciones = state.designaciones.filter(
    (d) => d.canchaId !== id && d.idCancha !== id,
  );
  canchaService
    .deleteCancha(id)
    .catch((err) => {
      console.warn("deleteCancha backend failed, removed locally", err);
    });
};

export const loadCanchas = async (page = 0, size = 100) => {
  try {
    const res = await canchaService.getAll(page, size);
    let canchas = Array.isArray(res) ? res : res.content || res;
    state.canchas = canchas.map((c) => ({
      id: c.idCancha || c.id,
      nombre: c.nombreCancha || c.nombre,
      ciudad: c.ciudad || "",
      partidos: c.partidos || 0,
      capacidad: c.capacidad || 0,
      categoria: c.categoria || "",
      fueraDeJuego: c.fueraDeJuego || false,
      ...c,
    }));
    persistCanchasStorage(state);
  } catch (e) {
    console.warn("Failed to load canchas", e);
  }
};
