import { state } from "./state";
import { getArbitro, isArbitroActivo } from "./helpers";
import { closeModal } from "./modal";
import {
  persistArbitrosStorage,
  updateArbitroInStorage,
  removeArbitroFromStorage,
} from "./storage";
import arbitroService from "../services/arbitroService";

export const saveArbitro = () => {
  const {
    idArbitro,
    nombre,
    apellido,
    whatsapp,
    estado,
    estadoSistema,
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
  const isActivo =
    estadoSistema !== undefined
      ? estadoSistema
      : estado !== undefined
        ? estado
        : true;

  const dto = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    rol: "Árbitro Principal",
    whatsapp: whatsapp?.trim() || "",
    estadoSistema: isActivo,
    estado: isActivo,
    disponibleSabado: disponibleSabado !== undefined ? disponibleSabado : true,
    disponibleDomingo:
      disponibleDomingo !== undefined ? disponibleDomingo : true,
    categoria: categoria || "INCIAL",
    talleCamiseta: talleCamiseta || "M",
    talleShort: talleShort || "M",
  };

  const isEdit = !!idArbitro;

  if (isEdit) {
    const a = getArbitro(idArbitro);
    if (a) {
      Object.assign(a, dto);
      updateArbitroInStorage(state, a);
    }
    closeModal();

    arbitroService
      .updateArbitro(idArbitro, dto)
      .then((updated) => {
        if (updated) {
          const arb = getArbitro(idArbitro) || a;
          if (arb) {
            Object.assign(arb, updated);
            updateArbitroInStorage(state, arb);
          }
        }
      })
      .catch((err) => {
        console.warn("updateArbitro backend failed, kept local state", err);
      });
  } else {
    arbitroService
      .createArbitro(dto)
      .then((created) => {
        if (created && (created.idArbitro || created.id)) {
          const newArb = {
            idArbitro: created.idArbitro || created.id,
            ...dto,
            ...created,
          };
          updateArbitroInStorage(state, newArb);
        } else {
          const fallback = {
            idArbitro: state.nextArbId++,
            designaciones: 0,
            estado: true,
            ...dto,
          };
          updateArbitroInStorage(state, fallback);
        }
        closeModal();
      })
      .catch((err) => {
        console.warn("createArbitro failed, using local fallback", err);
        const fallback = {
          idArbitro: state.nextArbId++,
          designaciones: 0,
          estado: true,
          ...dto,
        };
        updateArbitroInStorage(state, fallback);
        closeModal();
      });
  }
};

export const deleteArbitro = (id) => {
  if (!confirm("¿Eliminar este árbitro?")) return;
  removeArbitroFromStorage(state, id);
  arbitroService
    .deleteArbitro(id)
    .catch((err) => {
      console.warn("deleteArbitro backend failed, removed locally", err);
    });
};

export const toggleEstadoArbitro = (id) => {
  const a = getArbitro(id);
  if (!a) return Promise.reject("Árbitro no encontrado");

  const currentEstado = isArbitroActivo(a);
  const newEstado = !currentEstado;

  // Actualización optimista local
  a.estadoSistema = newEstado;
  a.estado = newEstado;
  updateArbitroInStorage(state, a);

  return arbitroService
    .toggleEstado(id)
    .then((res) => {
      if (res && typeof res === "object") {
        Object.assign(a, res);
        updateArbitroInStorage(state, a);
      }
    })
    .catch((err) => {
      console.warn("toggleEstado failed, keeping local state", err);
    });
};

export const updateArbitroDisponibilidad = (id, key) => {
  if (key === "estado" || key === "estadoSistema") {
    return toggleEstadoArbitro(id);
  }

  const a = getArbitro(id);
  if (!a) return Promise.reject("Árbitro no encontrado");

  const currentEstado = isArbitroActivo(a);
  const currentSabado = a.disponibleSabado !== false;
  const currentDomingo = a.disponibleDomingo !== false;

  const newSabado =
    key === "disponibleSabado" ? !currentSabado : currentSabado;
  const newDomingo =
    key === "disponibleDomingo" ? !currentDomingo : currentDomingo;

  const dto = {
    estadoSistema: currentEstado,
    estado: currentEstado,
    disponibleSabado: newSabado,
    disponibleDomingo: newDomingo,
  };

  // Actualización optimista local
  a.disponibleSabado = newSabado;
  a.disponibleDomingo = newDomingo;
  updateArbitroInStorage(state, a);

  return arbitroService
    .updateDisponibilidad(id, dto)
    .then((res) => {
      if (res && typeof res === "object") {
        Object.assign(a, res);
        updateArbitroInStorage(state, a);
      }
    })
    .catch((err) => {
      console.warn("updateDisponibilidad failed, keeping local state", err);
    });
};

export const toggleDisponible = (id) => {
  return toggleEstadoArbitro(id);
};

export const marcarTodosNoDisponibles = () => {
  if (
    !confirm(
      "¿Estás seguro de que deseas marcar a todos los árbitros como no disponibles?",
    )
  )
    return;

  state.arbitros.forEach((a) => {
    a.estado = false;
    a.estadoSistema = false;
  });
  persistArbitrosStorage(state);

  arbitroService
    .updateDisponibilidadTotal()
    .then(() => {
      loadArbitros();
      loadArbitrosNoDisponibles();
    })
    .catch((err) => {
      console.warn("updateDisponibilidadTotal failed, updating locally", err);
    });
};

export const loadArbitros = async (page = 0, size = 100) => {
  try {
    const res = await arbitroService.getAll(page, size);
    state.arbitros = Array.isArray(res) ? res : res.content || res;
    persistArbitrosStorage(state);
  } catch (e) {
    console.warn("Failed to load arbitros", e);
  }
};

export const loadArbitrosNoDisponibles = async (page = 0, size = 100) => {
  try {
    const res = await arbitroService.getNoDisponibles(page, size);
    state.arbitrosNoDisponibles = Array.isArray(res) ? res : res.content || res;
    persistArbitrosStorage(state);
  } catch (e) {
    console.warn("Failed to load arbitros no disponibles", e);
  }
};
