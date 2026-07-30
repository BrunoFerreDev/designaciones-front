import { state } from "./state";
import { getCancha, addToast } from "./helpers";
import { closeModal } from "./modal";
import canchaService from "../services/canchaService";

export const saveCancha = async () => {
  const { nombreCancha, categoria, fueraDeJuego, estado, necesitaViaje } = state.form;
  if (!nombreCancha) {
    addToast("Completá el nombre de la cancha.", "error");
    return Promise.reject("Nombre de la cancha obligatorio");
  }
  const dto = {
    nombreCancha: nombreCancha.trim(),
    categoria: categoria || "ELITE",
    fueraDeJuego: fueraDeJuego !== undefined ? fueraDeJuego : false,
    estado: estado !== undefined ? estado : true,
    necesitaViaje: necesitaViaje !== undefined ? necesitaViaje : false,
  };
  return canchaService
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
          necesitaViaje:
            created.necesitaViaje !== undefined
              ? created.necesitaViaje
              : dto.necesitaViaje,
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
          necesitaViaje: dto.necesitaViaje,
          partidos: 0,
          ciudad: "",
          capacidad: 0,
          ...dto,
        });
      }
      addToast("Cancha agregada con éxito.");
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
        necesitaViaje: dto.necesitaViaje,
        partidos: 0,
        ciudad: "",
        capacidad: 0,
        ...dto,
      });
      addToast("Cancha agregada localmente.");
      closeModal();
    });
};

export const saveEditCancha = async (id) => {
  const c = getCancha(id);
  if (!c) return Promise.reject("Cancha no encontrada");
  const nombreCancha = state.form.nombreCancha || state.form.nombre;
  const dto = {
    nombreCancha: nombreCancha?.trim() || c.nombreCancha || c.nombre,
    categoria: state.form.categoria || c.categoria || "ELITE",
    fueraDeJuego:
      state.form.fueraDeJuego !== undefined
        ? state.form.fueraDeJuego
        : c.fueraDeJuego,
    estado: state.form.estado !== undefined ? state.form.estado : c.estado,
    necesitaViaje:
      state.form.necesitaViaje !== undefined
        ? state.form.necesitaViaje
        : c.necesitaViaje,
  };
  return canchaService
    .updateCancha(id, dto)
    .then((updated) => {
      c.nombreCancha = updated.nombreCancha || dto.nombreCancha;
      c.nombre = c.nombreCancha;
      c.categoria = updated.categoria || dto.categoria;
      c.fueraDeJuego =
        updated.fueraDeJuego !== undefined
          ? updated.fueraDeJuego
          : dto.fueraDeJuego;
      c.estado = updated.estado !== undefined ? updated.estado : dto.estado;
      c.necesitaViaje =
        updated.necesitaViaje !== undefined
          ? updated.necesitaViaje
          : dto.necesitaViaje;
      addToast("Cancha actualizada con éxito.");
      closeModal();
    })
    .catch((err) => {
      console.warn("updateCancha failed, using local fallback", err);
      c.nombreCancha = dto.nombreCancha;
      c.nombre = c.nombreCancha;
      c.categoria = dto.categoria;
      c.fueraDeJuego = dto.fueraDeJuego;
      c.estado = dto.estado;
      c.necesitaViaje = dto.necesitaViaje;
      addToast("Cancha actualizada localmente.");
      closeModal();
    });
};

export const deleteCancha = (id) => {
  const c = getCancha(id);
  if (!c) return;
  const accion = c.estado ? "desactivar" : "activar";
  if (!confirm(`¿Estás seguro de que querés ${accion} esta cancha?`)) return;

  return canchaService
    .toggleEstado(id)
    .then((res) => {
      c.estado = res && res.estado !== undefined ? res.estado : !c.estado;
      addToast(`Cancha ${c.estado ? "activada" : "desactivada"} con éxito.`);
    })
    .catch((err) => {
      console.warn("toggleEstado failed, fallback local toggle", err);
      c.estado = !c.estado;
      addToast(`Cancha ${c.estado ? "activada" : "desactivada"} localmente.`);
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
      necesitaViaje: c.necesitaViaje || false,
      ...c,
    }));
    return state.canchas.sort((a, b) => b.necesitaViaje - a.necesitaViaje);
  } catch (e) {
    console.warn("Failed to load canchas", e);
  }
};
