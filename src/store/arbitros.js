import { state } from "./state";
import { getArbitro, addToast } from "./helpers";
import { closeModal } from "./modal";
import arbitroService from "../services/arbitroService";
import { clearCache, reloadAllDesignaciones } from "./designaciones/loader";

const refetchAll = async () => {
  clearCache();
  await Promise.all([
    loadArbitros(0, 100, { force: true }),
    reloadAllDesignaciones({ force: true })
  ]);
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
    estadoSistema,
  } = state.form;
  if (!nombre || !apellido) {
    addToast("Ingresá nombre y apellido.", "error");
    return Promise.reject("Nombre y apellido obligatorios");
  }
  const dto = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    rol: "Árbitro Principal",
    whatsapp: whatsapp?.trim() || "",
    estado: estado !== undefined ? estado : true,
    disponibleSabado: disponibleSabado !== undefined ? disponibleSabado : true,
    disponibleDomingo:
      disponibleDomingo !== undefined ? disponibleDomingo : true,
    categoria: categoria || "INCIAL",
    talleCamiseta: talleCamiseta || "M",
    talleShort: talleShort || "M",
    estadoSistema: estadoSistema !== undefined ? estadoSistema : true,
  };

  const isEdit = !!idArbitro;

  if (isEdit) {
    return arbitroService
      .updateArbitro(idArbitro, dto)
      .then((updated) => {
        const a = getArbitro(idArbitro);
        if (a) {
          Object.assign(a, { ...dto, ...(updated || {}) });
        }
        addToast("Árbitro actualizado con éxito.");
        closeModal();
        refetchAll();
      })
      .catch((err) => {
        console.warn("updateArbitro failed, updating locally", err);
        const a = getArbitro(idArbitro);
        if (a) {
          Object.assign(a, dto);
        }
        addToast("Árbitro actualizado localmente.");
        closeModal();
      });
  } else {
    return arbitroService
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
        addToast("Árbitro creado con éxito.");
        closeModal();
        refetchAll();
      })
      .catch((err) => {
        console.warn("createArbitro failed, using local fallback", err);
        state.arbitros.push({
          idArbitro: state.nextArbId++,
          designaciones: 0,
          estado: true,
          ...dto,
        });
        addToast("Árbitro creado localmente.");
        closeModal();
      });
  }
};

export const deleteArbitro = (id) => {
  if (!confirm("¿Eliminar este árbitro?")) return Promise.reject("Eliminación cancelada");
  return arbitroService
    .deleteArbitro(id)
    .then(() => {
      state.arbitros = state.arbitros.filter((a) => a.idArbitro !== id);
      state.arbitrosNoDisponibles = (state.arbitrosNoDisponibles || []).filter(
        (a) => a.idArbitro !== id,
      );
      addToast("Árbitro eliminado con éxito.");
      refetchAll();
    })
    .catch((err) => {
      console.warn("deleteArbitro failed, using local fallback", err);
      state.arbitros = state.arbitros.filter((a) => a.idArbitro !== id);
      state.arbitrosNoDisponibles = (state.arbitrosNoDisponibles || []).filter(
        (a) => a.idArbitro !== id,
      );
      addToast("Árbitro eliminado localmente.");
    });
};

export const updateArbitroDisponibilidad = (id, key) => {
  const a = getArbitro(id);
  if (!a) return Promise.reject("Árbitro no encontrado");

  if (a.estadoSistema === false) {
    addToast("No se puede modificar la disponibilidad de un árbitro fuera del sistema.", "error");
    return Promise.reject("Árbitro fuera del sistema");
  }

  const previousValue = a[key];
  const updatedValue = !previousValue;

  // Optimistic UI: actualizar estado reactivo inmediatamente
  a[key] = updatedValue;

  // Actualizar arreglos de filtro de disponibilidad si cambió sábado/domingo
  const isNowAvailable = a.disponibleSabado || a.disponibleDomingo;
  if (isNowAvailable) {
    if (!state.arbitros.some((arb) => arb.idArbitro === id)) {
      state.arbitros.push(a);
    }
    state.arbitrosNoDisponibles = (state.arbitrosNoDisponibles || []).filter((arb) => arb.idArbitro !== id);
  } else {
    if (!state.arbitrosNoDisponibles.some((arb) => arb.idArbitro === id)) {
      state.arbitrosNoDisponibles.push(a);
    }
    state.arbitros = state.arbitros.filter((arb) => arb.idArbitro !== id);
  }

  const dto = {
    estado: key === "estado" ? updatedValue : a.estado !== undefined ? a.estado : true,
    disponibleSabado: key === "disponibleSabado" ? updatedValue : a.disponibleSabado !== undefined ? a.disponibleSabado : true,
    disponibleDomingo: key === "disponibleDomingo" ? updatedValue : a.disponibleDomingo !== undefined ? a.disponibleDomingo : true,
  };

  return arbitroService
    .updateDisponibilidad(id, dto, { loaderType: "silent" })
    .then((res) => {
      if (res) Object.assign(a, res);
      addToast("Disponibilidad de árbitro actualizada.");
      refetchAll();
    })
    .catch((err) => {
      console.warn("updateDisponibilidad failed, reverting optimistic UI", err);
      // Revertir en caso de falla de red
      a[key] = previousValue;
      loadArbitros(0, 100, { loaderType: "silent", force: true });
      addToast("Error al guardar en servidor, cambio revertido.", "error");
    });
};

export const toggleDisponible = (id) => {
  return updateArbitroDisponibilidad(id, "estado");
};

export const marcarTodosNoDisponibles = () => {
  if (
    !confirm(
      "¿Estás seguro de que deseas marcar a todos los árbitros como no disponibles?",
    )
  )
    return Promise.reject("Operación cancelada");
  return arbitroService
    .updateDisponibilidadTotal({ loaderType: "topbar" })
    .then(() => {
      state.arbitros.forEach((a) => {
        a.estado = false;
      });
      addToast("Todos los árbitros marcados como no disponibles.");
      refetchAll();
    })
    .catch((err) => {
      console.warn("updateDisponibilidadTotal failed, updating locally", err);
      state.arbitros.forEach((a) => {
        a.estado = false;
      });
      addToast("Todos los árbitros marcados como no disponibles localmente.");
    });
};

export const toggleEstadoSistema = (id) => {
  const a = getArbitro(id);
  if (!a) return Promise.reject("Árbitro no encontrado");

  const currentVal = a.estadoSistema !== false;
  const updatedValue = !currentVal;

  // Optimistic UI
  a.estadoSistema = updatedValue;

  const dto = {
    nombre: a.nombre,
    apellido: a.apellido,
    rol: a.rol || "Árbitro Principal",
    whatsapp: a.whatsapp || "",
    estado: a.estado !== undefined ? a.estado : true,
    disponibleSabado: a.disponibleSabado !== undefined ? a.disponibleSabado : true,
    disponibleDomingo: a.disponibleDomingo !== undefined ? a.disponibleDomingo : true,
    categoria: a.categoria || "INCIAL",
    talleCamiseta: a.talleCamiseta || "M",
    talleShort: a.talleShort || "M",
    estadoSistema: updatedValue,
  };

  return arbitroService
    .updateArbitro(id, dto, { loaderType: "silent" })
    .then((updated) => {
      Object.assign(a, { ...dto, ...(updated || {}) });
      addToast("Estado en sistema actualizado.");
      refetchAll();
    })
    .catch((err) => {
      console.warn("updateArbitro failed, reverting optimistic update", err);
      a.estadoSistema = currentVal;
      addToast("Error al actualizar estado en sistema.", "error");
    });
};

export const loadArbitros = async (page = 0, size = 100, config = { loaderType: "topbar" }) => {
  const force = config.force === true;
  const cacheKey = "cached_arbitros";
  const cached = sessionStorage.getItem(cacheKey);

  if (!force && cached) {
    try {
      const list = JSON.parse(cached);
      state.arbitros = list.filter((a) => a.disponibleSabado || a.disponibleDomingo);
      state.arbitrosNoDisponibles = list.filter((a) => !a.disponibleSabado && !a.disponibleDomingo);
      return;
    } catch (e) {
      console.warn("Failed to load cached arbitros", e);
    }
  }

  try {
    const res = await arbitroService.getAll(page, size, config);
    const list = Array.isArray(res) ? res : res.content || res;

    sessionStorage.setItem(cacheKey, JSON.stringify(list));
    console.log(list);

    state.arbitros = list.filter((a) => a.disponibleSabado || a.disponibleDomingo);
    state.arbitrosNoDisponibles = list.filter((a) => !a.disponibleSabado && !a.disponibleDomingo);
  } catch (e) {
    console.warn("Failed to load arbitros", e);
  }
};

export const loadArbitrosNoDisponibles = async (page = 0, size = 100) => {
  // No-op: los árbitros no disponibles ya se cargan y filtran en loadArbitros
};
