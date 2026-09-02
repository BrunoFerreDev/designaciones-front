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
import { ejecutarAsignacionAutomatica } from "../../services/asignacionAutomaticaService";

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

    const { asignacionesPorDesignacion, advertencias } =
      ejecutarAsignacionAutomatica([des]);

    const resultado = asignacionesPorDesignacion[idDesignacion];
    if (!resultado || !resultado.arbitros || resultado.arbitros.length === 0) {
      throw new Error(
        "No se pudieron asignar árbitros para esta designación debido a falta de disponibilidad o conflictos de reglas.",
      );
    }

    state.arbitrosDesignadosMap[idDesignacion] = resultado.arbitros;

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
      }
    }

    if (desObj) {
      desObj.estadoDesignacion = 0; // Sigue pendiente de aceptar
      const existsInCompletas = state.designaciones.some(
        (d) => (d.idDesignacion || d.id) === idDesignacion,
      );
      if (!existsInCompletas) {
        state.designaciones.push(desObj);
      }
      // Quitar de aConfirmar si estuviese
      const idxConf = state.designacionesAConfirmar.findIndex(
        (d) => (d.idDesignacion || d.id) === idDesignacion,
      );
      if (idxConf !== -1) {
        state.designacionesAConfirmar.splice(idxConf, 1);
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

    if (advertencias && advertencias.length > 0) {
      console.warn("Advertencias al asignar árbitros:", advertencias);
      alert(advertencias.join("\n"));
    }

    return state.arbitrosDesignadosMap[idDesignacion];
  } catch (error) {
    console.error(
      "Error al asignar árbitros automáticamente en frontend:",
      error,
    );
    alert(error.message || "Hubo un error al intentar asignar árbitros automáticamente.");
    throw error;
  }
};

export const asignarLoteDesignacionesAutomaticas = async (designacionesList) => {
  try {
    await loadArbitros();

    const { asignacionesPorDesignacion, advertencias } =
      ejecutarAsignacionAutomatica(designacionesList);

    const idsProcesados = Object.keys(asignacionesPorDesignacion);

    idsProcesados.forEach((idDes) => {
      const info = asignacionesPorDesignacion[idDes];
      if (info && info.arbitros) {
        state.arbitrosDesignadosMap[idDes] = info.arbitros;
      }

      // Mover de incompletas a completadas (state.designaciones), puramente en frontend
      let desObj = null;
      let idx = state.designacionesIncompletas.findIndex(
        (d) => String(d.idDesignacion || d.id) === String(idDes),
      );
      if (idx !== -1) {
        desObj = state.designacionesIncompletas[idx];
        state.designacionesIncompletas.splice(idx, 1);
      } else {
        idx = state.designaciones.findIndex(
          (d) => String(d.idDesignacion || d.id) === String(idDes),
        );
        if (idx !== -1) {
          desObj = state.designaciones[idx];
        }
      }

      if (desObj) {
        desObj.estadoDesignacion = 0; // Sigue pendiente de aceptar por el usuario
        const existsInCompletas = state.designaciones.some(
          (d) => String(d.idDesignacion || d.id) === String(idDes),
        );
        if (!existsInCompletas) {
          state.designaciones.push(desObj);
        }
        // Quitar de aConfirmar si estuviese
        const idxConf = state.designacionesAConfirmar.findIndex(
          (d) => String(d.idDesignacion || d.id) === String(idDes),
        );
        if (idxConf !== -1) {
          state.designacionesAConfirmar.splice(idxConf, 1);
        }
      }
    });

    state.designacionesIncompletas = sortDesignaciones(
      state.designacionesIncompletas,
    );
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(
      state.designacionesAConfirmar,
    );
    persistDesignacionesStorage(state);

    return {
      asignacionesPorDesignacion,
      advertencias,
      totalProcesadas: idsProcesados.length,
    };
  } catch (error) {
    console.error("Error al asignar lote de designaciones:", error);
    throw error;
  }
};

export const limpiarArbitrosDesignacion = async (idDesignacion) => {
  try {
    const list = [
      ...state.designacionesIncompletas,
      ...state.designaciones,
      ...state.designacionesAConfirmar,
      ...(state.designacionesAceptadas || []),
    ];
    let des = list.find((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (!des) {
      throw new Error("No se encontró la designación.");
    }

    const assigned =
      state.arbitrosDesignadosMap[idDesignacion] ||
      des.arbitrosDesignados ||
      des.arbitros ||
      [];

    // Intentar desvincular del backend si ya estaban guardados
    if (assigned.length > 0) {
      try {
        await designacionService.limpiarArbitrosDesignacion(
          idDesignacion,
          assigned,
        );
      } catch (err) {
        console.warn("Limpieza en backend falló, continuando localmente:", err);
      }
    }

    // 1. Limpiar estructuras en memoria reactiva
    state.arbitrosDesignadosMap[idDesignacion] = [];
    des.arbitrosDesignados = [];
    des.arbitros = [];
    des.estadoDesignacion = 0; // Vuelve a pendiente e incompleta

    // 2. Mover de vuelta a designacionesIncompletas
    const fromLists = [
      state.designaciones,
      state.designacionesAConfirmar,
      state.designacionesAceptadas,
    ];
    fromLists.forEach((l) => {
      const idx = l.findIndex(
        (d) => (d.idDesignacion || d.id) === idDesignacion,
      );
      if (idx !== -1) {
        l.splice(idx, 1);
      }
    });

    const existsInInc = state.designacionesIncompletas.some(
      (d) => (d.idDesignacion || d.id) === idDesignacion,
    );
    if (!existsInInc) {
      state.designacionesIncompletas.push(des);
    }

    state.designacionesIncompletas = sortDesignaciones(
      state.designacionesIncompletas,
    );
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(
      state.designacionesAConfirmar,
    );
    state.designacionesAceptadas = sortDesignaciones(
      state.designacionesAceptadas,
    );
    persistDesignacionesStorage(state);

    return true;
  } catch (error) {
    console.error("Error al limpiar árbitros de designación:", error);
    alert(error.message || "Hubo un error al limpiar los árbitros.");
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

