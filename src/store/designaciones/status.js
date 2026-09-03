import { state } from "../state";
import { formatLocalDateTime, sortDesignaciones } from "../helpers";
import { updateDesignacionInStorage, persistDesignacionesStorage } from "../storage";
import designacionService from "../../services/designacionService";

export const cambiarEstadoDesignacionManual = async (
  idDesignacion,
  payload = {},
  reloadFn = null,
) => {
  const list = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar,
    ...(state.designacionesAceptadas || []),
  ];
  let des = list.find((d) => (d.idDesignacion || d.id) === idDesignacion);
  if (
    !des &&
    state.modal?.data &&
    (state.modal.data.idDesignacion || state.modal.data.id) === idDesignacion
  ) {
    des = state.modal.data;
  }

  if (des && des.editable === false) {
    throw new Error(
      "No se puede modificar el estado: la designación está marcada como no editable.",
    );
  }

  const canchaId =
    payload.idCancha ||
    des?.idCancha ||
    des?.canchaId ||
    des?.cancha?.idCancha ||
    des?.cancha?.id;
  const fecha = payload.fecha || des?.fecha;
  const formattedFecha = formatLocalDateTime(fecha);
  const cantidadPartidos =
    payload.cantidadPartidos !== undefined
      ? payload.cantidadPartidos
      : des?.cantidadPartidos || 1;
  const etapaCampeonato =
    payload.etapaCampeonato ||
    des?.etapaCampeonato ||
    des?.etapaTorneo ||
    "FECHA_NORMAL";
  const detalle =
    payload.detalleDesignacion !== undefined
      ? payload.detalleDesignacion
      : payload.detalle !== undefined
        ? payload.detalle
        : des?.detalleDesignacion || des?.detalle || "";
  const editable =
    payload.editable !== undefined
      ? payload.editable
      : des?.editable !== false;
  const estadoDesignacion =
    payload.estadoDesignacion !== undefined
      ? Number(payload.estadoDesignacion)
      : des?.estadoDesignacion || 0;

  const dto = {
    idCancha: Number(canchaId),
    fecha: formattedFecha,
    cantidadPartidos: Number(cantidadPartidos),
    etapaCampeonato: etapaCampeonato,
    detalle: detalle,
    detalleDesignacion: detalle,
    editable: editable,
    estadoDesignacion: estadoDesignacion,
  };

  // Actualización optimista de la entidad puntual y persistencia en LocalStorage
  updateDesignacionInStorage(state, {
    idDesignacion,
    id: idDesignacion,
    canchaId: Number(canchaId),
    cancha: des?.cancha,
    ...dto,
  });

  try {
    const res = await designacionService.actualizarDesignacion(
      idDesignacion,
      dto,
    );
    if (res && typeof res === "object") {
      updateDesignacionInStorage(state, res);
    }
    if (reloadFn) {
      await reloadFn();
    }
    return res || { success: true };
  } catch (error) {
    console.error("Error al actualizar estado de designación en backend:", error);
    throw error;
  }
};

export const cancelarDesignacionManual = async (
  idDesignacion,
  detalle = "",
  reloadFn = null,
) => {
  return cambiarEstadoDesignacionManual(
    idDesignacion,
    {
      estadoDesignacion: 3,
      detalle: detalle || "Jornada cancelada",
    },
    reloadFn,
  );
};

export const aceptarDesignacionManual = async (
  idDesignacion,
  detalle = "",
  reloadFn = null,
) => {
  const list = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar,
    ...(state.designacionesAceptadas || []),
  ];
  let des = list.find((d) => (d.idDesignacion || d.id) === idDesignacion);

  // 1. Enviar los árbitros asignados en frontend al backend
  const assigned =
    state.arbitrosDesignadosMap[idDesignacion] ||
    des?.arbitrosDesignados ||
    des?.arbitros ||
    [];
  const idsArbitros = assigned
    .map((a) => a.arbitro?.idArbitro || a.idArbitro)
    .filter(Boolean);

  if (idsArbitros.length > 0) {
    try {
      console.log(
        `Enviando ${idsArbitros.length} árbitros al backend para designación ${idDesignacion}...`,
      );
      await designacionService.designarListaArbitrosADesignacion(
        idDesignacion,
        idsArbitros,
      );
    } catch (errArb) {
      console.warn("Fallo al enviar lista de árbitros al backend:", errArb);
    }
  }

  // 2. Enviar aceptación al backend
  try {
    await designacionService.aceptarDesignacion(idDesignacion);
  } catch (errAceptar) {
    console.warn(
      "Fallo endpoint aceptarDesignacion, usando actualizarDesignacion:",
      errAceptar,
    );
    try {
      const canchaId =
        des?.idCancha || des?.canchaId || des?.cancha?.idCancha || des?.cancha?.id;
      await designacionService.actualizarDesignacion(idDesignacion, {
        idCancha: Number(canchaId),
        fecha: formatLocalDateTime(des?.fecha),
        cantidadPartidos: Number(des?.cantidadPartidos || 1),
        etapaCampeonato: des?.etapaCampeonato || "FECHA_NORMAL",
        detalle: detalle || "Jornada aceptada y confirmada",
        detalleDesignacion: detalle || "Jornada aceptada y confirmada",
        editable: des?.editable !== false,
        estadoDesignacion: 1,
      });
    } catch (e2) {
      console.warn("Fallback actualizarDesignacion también falló:", e2);
    }
  }

  // 3. Mover a designacionesAceptadas en frontend
  const fromLists = [
    state.designacionesIncompletas,
    state.designaciones,
    state.designacionesAConfirmar,
  ];
  fromLists.forEach((l) => {
    const idx = l.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (idx !== -1) {
      des = l[idx];
      l.splice(idx, 1);
    }
  });

  if (des) {
    des.estadoDesignacion = 1;
    const exists = state.designacionesAceptadas.some(
      (d) => (d.idDesignacion || d.id) === idDesignacion,
    );
    if (!exists) {
      state.designacionesAceptadas.push(des);
    }
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

  if (reloadFn) {
    await reloadFn();
  }

  return { success: true };
};

export const aceptarLoteDesignaciones = async (designacionesList) => {
  const list = Array.isArray(designacionesList) ? designacionesList : [];
  if (list.length === 0) return;

  const promises = list.map(async (d) => {
    const id = d.idDesignacion || d.id;
    return aceptarDesignacionManual(id);
  });

  return Promise.all(promises);
};

export const finalizarDesignacionManual = async (
  idDesignacion,
  detalle = "",
  reloadFn = null,
) => {
  return cambiarEstadoDesignacionManual(
    idDesignacion,
    {
      estadoDesignacion: 2,
      detalle: detalle || "Jornada finalizada con normalidad",
    },
    reloadFn,
  );
};

export const reprogramarDesignacionManual = async (
  idDesignacion,
  reloadFn = null,
) => {
  try {
    await designacionService.reprogramarDesignacion(idDesignacion);
    if (reloadFn) {
      await reloadFn();
    }
    return { success: true };
  } catch (error) {
    console.error("Error al reprogramar designación", error);
    alert("Hubo un error al intentar reprogramar la designación.");
    throw error;
  }
};

