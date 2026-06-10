import { state } from "./state";
import { getArbitro } from "./helpers";
import { closeModal } from "./modal";
import arbitroService from "../services/arbitroService";

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
    disponibleDomingo:
      disponibleDomingo !== undefined ? disponibleDomingo : true,
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
        loadArbitros();
        loadArbitrosNoDisponibles();
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
        loadArbitros();
        loadArbitrosNoDisponibles();
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
      state.arbitrosNoDisponibles = (state.arbitrosNoDisponibles || []).filter(
        (a) => a.idArbitro !== id,
      );
    })
    .catch((err) => {
      console.warn("deleteArbitro failed, using local fallback", err);
      state.arbitros = state.arbitros.filter((a) => a.idArbitro !== id);
      state.arbitrosNoDisponibles = (state.arbitrosNoDisponibles || []).filter(
        (a) => a.idArbitro !== id,
      );
    });
};

export const updateArbitroDisponibilidad = (id, key) => {
  const a = getArbitro(id);
  if (!a) return Promise.reject("Árbitro no encontrado");

  const updatedValue = !a[key];
  const dto = {
    estado:
      key === "estado"
        ? updatedValue
        : a.estado !== undefined
          ? a.estado
          : true,
    disponibleSabado:
      key === "disponibleSabado"
        ? updatedValue
        : a.disponibleSabado !== undefined
          ? a.disponibleSabado
          : true,
    disponibleDomingo:
      key === "disponibleDomingo"
        ? updatedValue
        : a.disponibleDomingo !== undefined
          ? a.disponibleDomingo
          : true,
  };

  return arbitroService
    .updateDisponibilidad(id, dto)
    .then((res) => {
      Object.assign(a, res || { idArbitro: id, ...dto });
      loadArbitros();
      loadArbitrosNoDisponibles();
    })
    .catch((err) => {
      console.warn("updateDisponibilidad failed, updating locally", err);
      a[key] = updatedValue;
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
    return;
  arbitroService
    .updateDisponibilidadTotal()
    .then(() => {
      state.arbitros.forEach((a) => {
        a.estado = false;
      });
      loadArbitros();
      loadArbitrosNoDisponibles();
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
    state.arbitros = Array.isArray(res) ? res : res.content || res;
  } catch (e) {
    console.warn("Failed to load arbitros", e);
  }
};
export const loadArbitrosNoDisponibles = async (page = 0, size = 100) => {
  try {
    const res = await arbitroService.getNoDisponibles(page, size);
    state.arbitrosNoDisponibles = Array.isArray(res) ? res : res.content || res;
  } catch (e) {
    console.warn("Failed to load arbitros no disponibles", e);
  }
};
