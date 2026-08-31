import { state } from "../state";
import { formatLocalDateTime } from "../helpers";
import { updateDesignacionInStorage } from "../storage";
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
  return cambiarEstadoDesignacionManual(
    idDesignacion,
    {
      estadoDesignacion: 1,
      detalle: detalle || "Jornada aceptada y confirmada",
    },
    reloadFn,
  );
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

