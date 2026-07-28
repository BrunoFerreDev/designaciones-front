import { state } from "../state";
import {
  getCancha,
  minArbitros,
  sortDesignaciones,
  getDayOfWeekLocal,
  isRefereeAssignedToDifferentCourtOnSameDay,
  addToast,
} from "../helpers";
import { closeModal } from "../modal";
import { loadArbitros } from "../arbitros";
import designacionService from "../../services/designacionService";
import { reloadAllDesignaciones } from "./loader";

export const saveDesignacion = () => {
  const { canchaId, fecha, cantidadPartidos, etapaCampeonato } = state.form;
  const c = getCancha(canchaId);
  if (!c || !fecha || !cantidadPartidos) {
    addToast("Completá cancha, fecha y cantidad de partidos.", "error");
    return Promise.reject("Campos obligatorios vacíos");
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

  return designacionService
    .createDesignacion(dto)
    .then(() => {
      addToast("Designación creada con éxito.");
      reloadAllDesignaciones();
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
        state.designacionesIncompletas
      );
      addToast("Designación creada localmente.");
      closeModal();
    });
};

export const updateDesignacion = () => {
  const { idDesignacion, canchaId, fecha, cantidadPartidos, etapaCampeonato, detalle, editable, estadoDesignacion } =
    state.form;
  const c = getCancha(canchaId);
  if (!canchaId || !fecha || !cantidadPartidos) {
    addToast("Completá cancha, fecha y cantidad de partidos.", "error");
    return Promise.reject("Campos obligatorios vacíos");
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
    detalle: detalle || "",
    editable: editable !== undefined ? editable : true,
  };

  if (estadoDesignacion !== undefined) {
    dto.estadoDesignacion = estadoDesignacion;
  }

  return designacionService
    .actualizarDesignacion(idDesignacion, dto)
    .then(() => {
      addToast("Designación actualizada con éxito.");
      reloadAllDesignaciones();
      closeModal();
    })
    .catch((err) => {
      console.warn("actualizarDesignacion failed, using local fallback", err);
      const updateInList = (list) => {
        const idx = list.findIndex(
          (d) => (d.idDesignacion || d.id) === idDesignacion
        );
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            idCancha: canchaId,
            canchaId: canchaId,
            cancha: c,
            fecha: formattedFecha,
            cantidadPartidos: cantidadPartidos,
            etapaCampeonato: etapaCampeonato || "FECHA_NORMAL",
            detalle: detalle || "",
            editable: editable !== undefined ? editable : true,
            estadoDesignacion: estadoDesignacion !== undefined ? estadoDesignacion : list[idx].estadoDesignacion,
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

      state.designacionesIncompletas = sortDesignaciones(
        state.designacionesIncompletas
      );
      state.designaciones = sortDesignaciones(state.designaciones);
      state.designacionesFinalizadas = sortDesignaciones(
        state.designacionesFinalizadas
      );
      state.designacionesAConfirmar = sortDesignaciones(
        state.designacionesAConfirmar
      );
      addToast("Designación actualizada localmente.");
      closeModal();
    });
};

export const deleteDesignacion = (id) => {
  if (!confirm("¿Eliminar esta designación?")) return Promise.reject("Eliminación cancelada");
  return designacionService
    .deleteDesignacion(id)
    .then(() => {
      addToast("Designación eliminada con éxito.");
      reloadAllDesignaciones();
    })
    .catch((err) => {
      console.warn("deleteDesignacion failed, using local fallback", err);
      state.designaciones = state.designaciones.filter(
        (d) => (d.idDesignacion || d.id) !== id
      );
      state.designacionesIncompletas = state.designacionesIncompletas.filter(
        (d) => (d.idDesignacion || d.id) !== id
      );
      state.designacionesFinalizadas = state.designacionesFinalizadas.filter(
        (d) => (d.idDesignacion || d.id) !== id
      );
      state.designacionesAConfirmar = state.designacionesAConfirmar.filter(
        (d) => (d.idDesignacion || d.id) !== id
      );
      addToast("Designación eliminada localmente.");
    });
};

export const updateDesignacionStateLocal = (idDesignacion) => {
  let des = null;
  let fromList = null;
  let idx = -1;

  idx = state.designacionesIncompletas.findIndex(
    (d) => (d.idDesignacion || d.id) === idDesignacion
  );
  if (idx !== -1) {
    des = state.designacionesIncompletas[idx];
    fromList = "incompleta";
  } else {
    idx = state.designaciones.findIndex(
      (d) => (d.idDesignacion || d.id) === idDesignacion
    );
    if (idx !== -1) {
      des = state.designaciones[idx];
      fromList = "completa";
    } else {
      idx = state.designacionesAConfirmar.findIndex(
        (d) => (d.idDesignacion || d.id) === idDesignacion
      );
      if (idx !== -1) {
        des = state.designacionesAConfirmar[idx];
        fromList = "confirmar";
      }
    }
  }

  if (!des) return;

  const req = minArbitros(des.cantidadPartidos);
  const assigned = state.arbitrosDesignadosMap[idDesignacion] || [];
  const count = assigned.length;

  if (count >= req) {
    des.estadoDesignacion = 1; // 1: Completa
    if (fromList === "incompleta") {
      state.designacionesIncompletas.splice(idx, 1);
      state.designaciones.push(des);
    }
  } else {
    des.estadoDesignacion = 0; // 0: Pendiente a completar
    if (fromList === "completa") {
      state.designaciones.splice(idx, 1);
      state.designacionesIncompletas.push(des);
    } else if (fromList === "confirmar") {
      state.designacionesAConfirmar.splice(idx, 1);
      state.designacionesIncompletas.push(des);
    }
  }

  state.designacionesIncompletas = sortDesignaciones(
    state.designacionesIncompletas
  );
  state.designaciones = sortDesignaciones(state.designaciones);
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar
  );
};

export const asignarArbitros = async (idDesignacion) => {
  try {
    const list = [
      ...state.designacionesIncompletas,
      ...state.designaciones,
      ...state.designacionesAConfirmar,
    ];
    const des = list.find((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (!des) {
      throw new Error("No se encontró la designación.");
    }

    await loadArbitros();

    let disponibles = state.arbitros.filter((a) => {
      if (a.estado === false) return false;
      const day = getDayOfWeekLocal(des.fecha);
      if (day === 6) return a.disponibleSabado;
      if (day === 0) return a.disponibleDomingo;
      return true;
    });

    const isSaturday = getDayOfWeekLocal(des.fecha) === 6;
    const targetCanchaId =
      des.idCancha || des.canchaId || des.cancha?.idCancha || des.cancha?.id;

    const satRepetitionExcluded = new Set();
    if (isSaturday) {
      state.designacionesFinalizadas.forEach((finalD) => {
        const finalCanchaId =
          finalD.idCancha ||
          finalD.canchaId ||
          finalD.cancha?.idCancha ||
          finalD.cancha?.id;
        if (
          String(finalCanchaId) === String(targetCanchaId) &&
          getDayOfWeekLocal(finalD.fecha) === 6
        ) {
          const assigned = finalD.arbitrosDesignados || finalD.arbitros || [];
          assigned.forEach((asg) => {
            const arbId = asg.arbitro?.idArbitro || asg.idArbitro;
            if (arbId) {
              const arbObj = state.arbitros.find((a) => a.idArbitro === arbId);
              if (arbObj) {
                const nombreCompleto =
                  `${arbObj.nombre || ""} ${arbObj.apellido || ""}`.trim();
                const normalized = nombreCompleto
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase();
                if (normalized === "hector mendoza") {
                  return;
                }
              }
              satRepetitionExcluded.add(arbId);
            }
          });
        }
      });
    }

    let elegibles = disponibles.filter((arb) => {
      const id = arb.idArbitro;
      if (isSaturday && satRepetitionExcluded.has(id)) return false;
      if (isRefereeAssignedToDifferentCourtOnSameDay(id, des)) return false;
      return true;
    });

    elegibles.sort((a, b) => (a.designaciones || 0) - (b.designaciones || 0));

    const req = minArbitros(des.cantidadPartidos);
    const selected = elegibles.slice(0, req);

    state.arbitrosDesignadosMap[idDesignacion] = selected.map((arb, index) => ({
      idDesignados: Date.now() + index + Math.random(),
      arbitro: arb,
      partidosDirigidos: arb.designaciones || 0,
    }));

    let desObj = null;
    let idx = state.designacionesIncompletas.findIndex(
      (d) => (d.idDesignacion || d.id) === idDesignacion
    );
    if (idx !== -1) {
      desObj = state.designacionesIncompletas[idx];
      state.designacionesIncompletas.splice(idx, 1);
    } else {
      idx = state.designaciones.findIndex(
        (d) => (d.idDesignacion || d.id) === idDesignacion
      );
      if (idx !== -1) {
        desObj = state.designaciones[idx];
        state.designaciones.splice(idx, 1);
      }
    }

    if (desObj) {
      const existsInConfirmar = state.designacionesAConfirmar.some(
        (d) => (d.idDesignacion || d.id) === idDesignacion
      );
      if (!existsInConfirmar) {
        state.designacionesAConfirmar.push(desObj);
      }
    }

    state.designacionesIncompletas = sortDesignaciones(
      state.designacionesIncompletas
    );
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(
      state.designacionesAConfirmar
    );

    return state.arbitrosDesignadosMap[idDesignacion];
  } catch (error) {
    console.error(
      "Error al asignar árbitros automáticamente en frontend:",
      error
    );
    alert("Hubo un error al intentar asignar árbitros automáticamente.");
    throw error;
  }
};

export const quitarArbitroDeDesignacionManual = async (
  idDesignacion,
  idArbitro
) => {
  try {
    try {
      await designacionService.quitarArbitroManual(idDesignacion, idArbitro);
    } catch (e) {
      console.warn("Backend remove failed, proceeding locally", e);
    }
    if (state.arbitrosDesignadosMap[idDesignacion]) {
      state.arbitrosDesignadosMap[idDesignacion] = state.arbitrosDesignadosMap[
        idDesignacion
      ].filter(
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
  tipo = 1
) => {
  try {
    const des =
      [
        ...state.designacionesIncompletas,
        ...state.designaciones,
        ...state.designacionesAConfirmar,
        ...state.designacionesFinalizadas,
        ...(state.designacionesCanceladas || []),
      ].find((d) => (d.idDesignacion || d.id) === idDesignacion) ||
      (state.modal?.data &&
      (state.modal.data.idDesignacion || state.modal.data.id) === idDesignacion
        ? state.modal.data
        : null);

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

    if (
      tipo !== 0 &&
      isRefereeAssignedToDifferentCourtOnSameDay(idArbitro, des)
    ) {
      let otherCanchaName = "otra cancha";
      const targetDateStr = des.fecha ? des.fecha.split("T")[0] : "";
      const targetCanchaId =
        des.idCancha || des.canchaId || des.cancha?.idCancha || des.cancha?.id;
      const allLists = [
        ...state.designacionesIncompletas,
        ...state.designaciones,
        ...state.designacionesFinalizadas,
        ...state.designacionesAConfirmar,
        ...(state.designacionesCanceladas || []),
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
              const otherCid =
                otherD.idCancha ||
                otherD.canchaId ||
                otherD.cancha?.idCancha ||
                otherD.cancha?.id;
              if (String(otherCid) !== String(targetCanchaId)) {
                otherCanchaName =
                  otherD.cancha?.nombreCancha ||
                  otherD.cancha?.nombre ||
                  getCancha(otherD.idCancha || otherD.canchaId)?.nombre ||
                  "otra cancha";
                break;
              }
            }
          }
        }
      }
      throw new Error(
        `El árbitro ya está asignado en la cancha "${otherCanchaName}" para este día. No puede dirigir en dos canchas diferentes el mismo día.`
      );
    }

    const isSaturdayVal = getDayOfWeekLocal(des.fecha) === 6;
    if (isSaturdayVal) {
      const nombreCompleto = `${arb.nombre || ""} ${arb.apellido || ""}`.trim();
      const normalized = nombreCompleto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const isHectorMendoza = normalized === "hector mendoza";

      if (!isHectorMendoza) {
        const targetCanchaId =
          des.idCancha ||
          des.canchaId ||
          des.cancha?.idCancha ||
          des.cancha?.id;
        const isExcluded = state.designacionesFinalizadas.some((finalD) => {
          const finalCanchaId =
            finalD.idCancha ||
            finalD.canchaId ||
            finalD.cancha?.idCancha ||
            finalD.cancha?.id;
          if (
            String(finalCanchaId) === String(targetCanchaId) &&
            getDayOfWeekLocal(finalD.fecha) === 6
          ) {
            const assigned = finalD.arbitrosDesignados || finalD.arbitros || [];
            return assigned.some(
              (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro
            );
          }
          return false;
        });

        if (isExcluded) {
          const canchaNombre =
            des.cancha?.nombreCancha ||
            des.cancha?.nombre ||
            getCancha(targetCanchaId)?.nombre ||
            "esta cancha";
          throw new Error(
            `El árbitro ya estuvo asignado en la cancha "${canchaNombre}" el sábado anterior. No puede repetir la misma cancha en sábados consecutivos.`
          );
        }
      }
    }

    try {
      await designacionService.asignarArbitroManual(
        idDesignacion,
        idArbitro,
        tipo
      );
    } catch (e) {
      console.warn("Backend assign failed", e);
      throw e;
    }

    state.arbitrosDesignadosMap[idDesignacion].push({
      idDesignados: Date.now() + Math.random(),
      arbitro: arb,
      partidosDirigidos: arb.designaciones || 0,
    });

    updateDesignacionStateLocal(idDesignacion);
    return true;
  } catch (error) {
    console.error("Error al asignar árbitro manualmente en frontend:", error);
    addToast(error.message || "Hubo un error al intentar asignar el árbitro.", "error");
    throw error;
  }
};

export const cancelarDesignacionManual = async (idDesignacion) => {
  try {
    const res = await designacionService.cancelarDesignacion(idDesignacion);
    await reloadAllDesignaciones();
    addToast("Jornada cancelada con éxito.");
    return res;
  } catch (error) {
    console.warn("Cancelar backend failed, using local fallback", error);
    let des = null;
    let idx = state.designaciones.findIndex(
      (d) => (d.idDesignacion || d.id) === idDesignacion
    );
    if (idx !== -1) {
      des = state.designaciones[idx];
      state.designaciones.splice(idx, 1);
    } else {
      idx = state.designacionesIncompletas.findIndex(
        (d) => (d.idDesignacion || d.id) === idDesignacion
      );
      if (idx !== -1) {
        des = state.designacionesIncompletas[idx];
        state.designacionesIncompletas.splice(idx, 1);
      }
    }

    if (des) {
      des.estadoDesignacion = 3; // Cancelada
      state.designacionesCanceladas.push(des);
    }

    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesIncompletas = sortDesignaciones(state.designacionesIncompletas);
    state.designacionesCanceladas = sortDesignaciones(state.designacionesCanceladas);
    addToast("Jornada cancelada localmente.");
    return { success: true };
  }
};

export const aceptarDesignacionManual = async (idDesignacion) => {
  try {
    await designacionService.aceptarDesignacion(idDesignacion);
    await reloadAllDesignaciones();
    addToast("Designación aceptada con éxito.");
    return { success: true };
  } catch (error) {
    console.warn("Aceptar backend failed, using local fallback", error);
    let des = null;
    let idx = state.designacionesIncompletas.findIndex(
      (d) => (d.idDesignacion || d.id) === idDesignacion
    );
    if (idx !== -1) {
      des = state.designacionesIncompletas[idx];
      state.designacionesIncompletas.splice(idx, 1);
    }

    if (des) {
      des.estadoDesignacion = 1; // Completa
      state.designaciones.push(des);
    }

    state.designacionesIncompletas = sortDesignaciones(
      state.designacionesIncompletas
    );
    state.designaciones = sortDesignaciones(state.designaciones);
    addToast("Designación completada localmente.");
    return { success: true };
  }
};

export const finalizarDesignacionManual = async (idDesignacion) => {
  try {
    await designacionService.finalizarDesignacion(idDesignacion);
    await reloadAllDesignaciones();
    addToast("Jornada finalizada con éxito.");
    return { success: true };
  } catch (error) {
    console.warn("Finalizar backend failed, using local fallback", error);
    let des = null;
    let idx = state.designaciones.findIndex(
      (d) => (d.idDesignacion || d.id) === idDesignacion
    );
    if (idx !== -1) {
      des = state.designaciones[idx];
      state.designaciones.splice(idx, 1);
    }

    if (des) {
      des.estadoDesignacion = 2; // Finalizada
      state.designacionesFinalizadas.push(des);
    }

    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesFinalizadas = sortDesignaciones(
      state.designacionesFinalizadas
    );
    addToast("Jornada finalizada localmente.");
    return { success: true };
  }
};

export const reprogramarDesignacionManual = async (idDesignacion) => {
  try {
    await designacionService.reprogramarDesignacion(idDesignacion);
    await reloadAllDesignaciones();
    addToast("Designación reprogramada con éxito.");
    return { success: true };
  } catch (error) {
    console.error("Error al reprogramar designación", error);
    addToast("Hubo un error al intentar reprogramar la designación.", "error");
    throw error;
  }
};

export const confirmarEnvioDesignacion = async (idDesignacion) => {
  const des = state.designacionesAConfirmar.find(
    (d) => (d.idDesignacion || d.id) === idDesignacion
  );
  if (!des) return;

  const arbitrosAsignados = state.arbitrosDesignadosMap[idDesignacion] || [];
  const idsArbitros = arbitrosAsignados.map(
    (a) => a.arbitro?.idArbitro || a.idArbitro
  );

  try {
    await designacionService.designarListaArbitrosADesignacion(
      idDesignacion,
      idsArbitros
    );
    await designacionService.finalizarDesignacion(idDesignacion);
  } catch (err) {
    console.warn(
      `Llamado al backend falló para designación ${idDesignacion}, procediendo localmente`,
      err
    );
  }

  const idx = state.designacionesAConfirmar.findIndex(
    (d) => (d.idDesignacion || d.id) === idDesignacion
  );
  if (idx !== -1) {
    state.designacionesAConfirmar.splice(idx, 1);
  }
  des.estadoDesignacion = 2;
  state.designacionesFinalizadas.push(des);

  state.designacionesFinalizadas = sortDesignaciones(
    state.designacionesFinalizadas
  );
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar
  );

  addToast("Designación confirmada y enviada con éxito al backend!");
};

export const confirmarEnvioCancha = async (canchaId) => {
  const desList = state.designacionesAConfirmar.filter((d) => {
    const cid = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
    return String(cid) === String(canchaId);
  });

  if (desList.length === 0) return;

  const canchaNombre =
    desList[0].cancha?.nombreCancha ||
    desList[0].cancha?.nombre ||
    getCancha(canchaId)?.nombre ||
    "Cancha";

  const promises = desList.map(async (des) => {
    const idDesignacion = des.idDesignacion || des.id;
    const arbitrosAsignados = state.arbitrosDesignadosMap[idDesignacion] || [];
    const idsArbitros = arbitrosAsignados.map(
      (a) => a.arbitro?.idArbitro || a.idArbitro
    );

    try {
      await designacionService.designarListaArbitrosADesignacion(
        idDesignacion,
        idsArbitros
      );
      await designacionService.finalizarDesignacion(idDesignacion);
    } catch (err) {
      console.warn(
        `Llamado al backend falló para designación ${idDesignacion}, procediendo localmente`,
        err
      );
    }
    return { success: true };
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    console.warn(
      "Algunas llamadas al backend fallaron, continuando localmente",
      err
    );
  }

  desList.forEach((des) => {
    const idx = state.designacionesAConfirmar.findIndex(
      (d) => (d.idDesignacion || d.id) === (des.idDesignacion || des.id)
    );
    if (idx !== -1) {
      state.designacionesAConfirmar.splice(idx, 1);
    }
    des.estadoDesignacion = 2;
    state.designacionesFinalizadas.push(des);
  });

  state.designacionesFinalizadas = sortDesignaciones(
    state.designacionesFinalizadas
  );
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar
  );

  addToast(`¡Designaciones de la cancha "${canchaNombre}" enviadas y confirmadas con éxito!`);
};

export const deshacerFinalizacionLocal = (idDesignacion) => {
  const idx = state.designacionesAConfirmar.findIndex(
    (d) => (d.idDesignacion || d.id) === idDesignacion
  );
  if (idx !== -1) {
    const des = state.designacionesAConfirmar[idx];
    state.designacionesAConfirmar.splice(idx, 1);

    const req = minArbitros(des.cantidadPartidos);
    const assigned = state.arbitrosDesignadosMap[idDesignacion] || [];
    if (assigned.length >= req) {
      des.estadoDesignacion = 1;
      state.designaciones.push(des);
    } else {
      des.estadoDesignacion = 0;
      state.designacionesIncompletas.push(des);
    }

    state.designacionesIncompletas = sortDesignaciones(
      state.designacionesIncompletas
    );
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(
      state.designacionesAConfirmar
    );
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
    await reloadAllDesignaciones();
    addToast("Designaciones clonadas con éxito.");
  } catch (error) {
    console.error("Error al clonar designaciones", error);
    addToast("Hubo un error al clonar algunas designaciones.", "error");
    await reloadAllDesignaciones();
    throw error;
  }
};

export const actualizarMontoPercibidoStore = async (
  idDesignacion,
  idDesignado,
  nuevoMonto
) => {
  try {
    await designacionService.actualizarMontoPercibido(idDesignado, nuevoMonto);
    if (state.arbitrosDesignadosMap[idDesignacion]) {
      const list = state.arbitrosDesignadosMap[idDesignacion];
      const found = list.find((a) => (a.idDesignados || a.id) == idDesignado);
      if (found) {
        found.montoPercibido = nuevoMonto;
      }
    }
    return true;
  } catch (error) {
    console.error("Error al actualizar monto percibido:", error);
    throw error;
  }
};

export const actualizarMontoATodosStore = async (
  idDesignacion,
  montoPorArbitro
) => {
  try {
    await designacionService.actualizarMontoATodos(
      idDesignacion,
      montoPorArbitro
    );
    if (state.arbitrosDesignadosMap[idDesignacion]) {
      state.arbitrosDesignadosMap[idDesignacion].forEach((a) => {
        a.montoPercibido = montoPorArbitro;
      });
    }
    return true;
  } catch (error) {
    console.error("Error al actualizar monto total:", error);
    throw error;
  }
};
