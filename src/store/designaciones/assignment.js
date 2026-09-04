import { state } from "../state";
import {
  getCancha,
  minArbitros,
  sortDesignaciones,
  getDayOfWeekLocal,
  isRefereeAssignedToDifferentCourtOnSameDay,
  isArbitroActivo,
} from "../helpers";
import { persistDesignacionesStorage } from "../storage";
import { loadArbitros } from "../arbitros";
import designacionService from "../../services/designacionService";

export const updateDesignacionStateLocal = (idDesignacion) => {
  let des = null;
  let fromList = null;
  let idx = -1;

  idx = state.designacionesIncompletas.findIndex(
    (d) => (d.idDesignacion || d.id) === idDesignacion,
  );
  if (idx !== -1) {
    des = state.designacionesIncompletas[idx];
    fromList = "incompleta";
  } else {
    idx = state.designaciones.findIndex(
      (d) => (d.idDesignacion || d.id) === idDesignacion,
    );
    if (idx !== -1) {
      des = state.designaciones[idx];
      fromList = "completa";
    } else {
      idx = state.designacionesAConfirmar.findIndex(
        (d) => (d.idDesignacion || d.id) === idDesignacion,
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
    des.estadoDesignacion = 0;
    if (fromList === "incompleta") {
      state.designacionesIncompletas.splice(idx, 1);
      state.designaciones.push(des);
    }
  } else {
    des.estadoDesignacion = 0;
    if (fromList === "completa") {
      state.designaciones.splice(idx, 1);
      state.designacionesIncompletas.push(des);
    } else if (fromList === "confirmar") {
      state.designacionesAConfirmar.splice(idx, 1);
      state.designacionesIncompletas.push(des);
    }
  }

  state.designacionesIncompletas = sortDesignaciones(
    state.designacionesIncompletas,
  );
  state.designaciones = sortDesignaciones(state.designaciones);
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar,
  );
  persistDesignacionesStorage(state);
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
      if (!isArbitroActivo(a)) return false;
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
      (d) => (d.idDesignacion || d.id) === idDesignacion,
    );
    if (idx !== -1) {
      desObj = state.designacionesIncompletas[idx];
      state.designacionesIncompletas.splice(idx, 1);
    } else {
      idx = state.designaciones.findIndex(
        (d) => (d.idDesignacion || d.id) === idDesignacion,
      );
      if (idx !== -1) {
        desObj = state.designaciones[idx];
        state.designaciones.splice(idx, 1);
      }
    }

    if (desObj) {
      const existsInConfirmar = state.designacionesAConfirmar.some(
        (d) => (d.idDesignacion || d.id) === idDesignacion,
      );
      if (!existsInConfirmar) {
        desObj.aConfirmar = true;
        state.designacionesAConfirmar.push(desObj);
      }
    }

    state.designacionesIncompletas = sortDesignaciones(
      state.designacionesIncompletas,
    );
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(
      state.designacionesAConfirmar,
    );
    persistDesignacionesStorage(state);

    return state.arbitrosDesignadosMap[idDesignacion];
  } catch (error) {
    console.error(
      "Error al asignar árbitros automáticamente en frontend:",
      error,
    );
    alert("Hubo un error al intentar asignar árbitros automáticamente.");
    throw error;
  }
};

export const quitarArbitroDeDesignacionManual = async (
  idDesignacion,
  idArbitro,
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
        (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) !== idArbitro,
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
  tipo = 1,
) => {
  try {
    const des =
      [
        ...state.designacionesIncompletas,
        ...state.designaciones,
        ...state.designacionesAConfirmar,
        ...state.designacionesFinalizadas,
        ...(state.designacionesAceptadas || []),
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
    if (!isArbitroActivo(arb)) {
      throw new Error("El árbitro se encuentra deshabilitado en el sistema.");
    }

    if (!state.arbitrosDesignadosMap[idDesignacion]) {
      state.arbitrosDesignadosMap[idDesignacion] = [];
    }

    const exists = state.arbitrosDesignadosMap[idDesignacion].some(
      (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro,
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
        ...(state.designacionesAceptadas || []),
      ];
      for (const otherD of allLists) {
        const otherId = otherD.idDesignacion || otherD.id;
        if (otherId !== idDesignacion) {
          const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
          if (otherDateStr && otherDateStr === targetDateStr) {
            const assigned = state.arbitrosDesignadosMap[otherId] || [];
            const isAssigned = assigned.some(
              (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro,
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
        `El árbitro ya está asignado en la cancha "${otherCanchaName}" para este día. No puede dirigir en dos canchas diferentes el mismo día.`,
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
              (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro,
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
            `El árbitro ya estuvo asignado en la cancha "${canchaNombre}" el sábado anterior. No puede repetir la misma cancha en sábados consecutivos.`,
          );
        }
      }
    }

    try {
      await designacionService.asignarArbitroManual(
        idDesignacion,
        idArbitro,
        tipo,
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
    console.error("Error al asignar árbitro manualmente:", error);
    throw error;
  }
};

export const forzarAsignarArbitroADesignacionManual = async (
  idDesignacion,
  idArbitro,
) => {
  try {
    const des =
      [
        ...state.designacionesIncompletas,
        ...state.designaciones,
        ...state.designacionesAConfirmar,
        ...state.designacionesFinalizadas,
        ...(state.designacionesAceptadas || []),
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
    if (!isArbitroActivo(arb)) {
      throw new Error("El árbitro se encuentra deshabilitado en el sistema.");
    }

    if (!state.arbitrosDesignadosMap[idDesignacion]) {
      state.arbitrosDesignadosMap[idDesignacion] = [];
    }

    const exists = state.arbitrosDesignadosMap[idDesignacion].some(
      (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro,
    );
    if (exists) {
      throw new Error("El árbitro ya está asignado a esta designación.");
    }

    await designacionService.forzarAsignarArbitro(idDesignacion, idArbitro);

    state.arbitrosDesignadosMap[idDesignacion].push({
      idDesignados: Date.now() + Math.random(),
      arbitro: arb,
      partidosDirigidos: arb.designaciones || 0,
    });

    updateDesignacionStateLocal(idDesignacion);
    return true;
  } catch (error) {
    console.error("Error al forzar asignación de árbitro:", error);
    throw error;
  }
};

