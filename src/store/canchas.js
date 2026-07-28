import { state } from "./state";
import { getCancha, addToast } from "./helpers";
import { closeModal } from "./modal";
import canchaService from "../services/canchaService";

export const saveCancha = () => {
  const { nombreCancha, categoria, fueraDeJuego, estado } = state.form;
  if (!nombreCancha) {
    addToast("Completá el nombre de la cancha.", "error");
    return Promise.reject("Nombre de la cancha obligatorio");
  }
  const dto = {
    nombreCancha: nombreCancha.trim(),
    categoria: categoria || "ELITE",
    fueraDeJuego: fueraDeJuego !== undefined ? fueraDeJuego : false,
    estado: estado !== undefined ? estado : true,
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
        partidos: 0,
        ciudad: "",
        capacidad: 0,
        ...dto,
      });
      addToast("Cancha agregada localmente.");
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
  addToast("Cancha actualizada con éxito.");
  closeModal();
};

export const deleteCancha = (id) => {
  if (!confirm("¿Eliminar esta cancha?")) return;
  state.canchas = state.canchas.filter((c) => c.id !== id);
  state.designaciones = state.designaciones.filter((d) => d.canchaId !== id);
  addToast("Cancha eliminada con éxito.");
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
  } catch (e) {
    console.warn("Failed to load canchas", e);
  }
};
