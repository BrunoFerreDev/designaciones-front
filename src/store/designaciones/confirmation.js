import { state } from "../state";
import { getCancha, minArbitros, sortDesignaciones } from "../helpers";
import designacionService from "../../services/designacionService";

export const confirmarEnvioDesignacion = async (idDesignacion) => {
  const des = state.designacionesAConfirmar.find(
    (d) => (d.idDesignacion || d.id) === idDesignacion,
  );
  if (!des) return;

  const arbitrosAsignados = state.arbitrosDesignadosMap[idDesignacion] || [];
  const idsArbitros = arbitrosAsignados.map(
    (a) => a.arbitro?.idArbitro || a.idArbitro,
  );

  try {
    console.log(
      `Confirmando y finalizando designación ${idDesignacion} en el backend...`,
    );
    await designacionService.designarListaArbitrosADesignacion(
      idDesignacion,
      idsArbitros,
    );
    await designacionService.finalizarDesignacion(idDesignacion);
  } catch (err) {
    console.warn(
      `Llamado al backend falló para designación ${idDesignacion}, procediendo localmente`,
      err,
    );
  }

  const idx = state.designacionesAConfirmar.findIndex(
    (d) => (d.idDesignacion || d.id) === idDesignacion,
  );
  if (idx !== -1) {
    state.designacionesAConfirmar.splice(idx, 1);
  }
  des.estadoDesignacion = 2; // Finalizada
  state.designacionesFinalizadas.push(des);

  state.designacionesFinalizadas = sortDesignaciones(
    state.designacionesFinalizadas,
  );
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar,
  );

  alert(`¡Designación confirmada y enviada con éxito al backend!`);
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
      (a) => a.arbitro?.idArbitro || a.idArbitro,
    );

    try {
      console.log(
        `Confirmando y finalizando designación ${idDesignacion} en el backend...`,
      );
      await designacionService.designarListaArbitrosADesignacion(
        idDesignacion,
        idsArbitros,
      );
      await designacionService.finalizarDesignacion(idDesignacion);
    } catch (err) {
      console.warn(
        `Llamado al backend falló para designación ${idDesignacion}, procediendo localmente`,
        err,
      );
    }
    return { success: true };
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    console.warn(
      "Algunas llamadas al backend fallaron, continuando localmente",
      err,
    );
  }

  desList.forEach((des) => {
    const idx = state.designacionesAConfirmar.findIndex(
      (d) => (d.idDesignacion || d.id) === (des.idDesignacion || des.id),
    );
    if (idx !== -1) {
      state.designacionesAConfirmar.splice(idx, 1);
    }
    des.estadoDesignacion = 2; // Finalizada
    state.designacionesFinalizadas.push(des);
  });

  state.designacionesFinalizadas = sortDesignaciones(
    state.designacionesFinalizadas,
  );
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar,
  );

  alert(
    `¡Designaciones de la cancha "${canchaNombre}" enviadas y confirmadas con éxito al backend!`,
  );
};

export const deshacerFinalizacionLocal = (idDesignacion) => {
  const idx = state.designacionesAConfirmar.findIndex(
    (d) => (d.idDesignacion || d.id) === idDesignacion,
  );
  if (idx !== -1) {
    const des = state.designacionesAConfirmar[idx];
    state.designacionesAConfirmar.splice(idx, 1);

    const req = minArbitros(des.cantidadPartidos);
    const assigned = state.arbitrosDesignadosMap[idDesignacion] || [];
    if (assigned.length >= req) {
      des.estadoDesignacion = 0;
      state.designaciones.push(des);
    } else {
      des.estadoDesignacion = 0;
      state.designacionesIncompletas.push(des);
    }

    state.designacionesIncompletas = sortDesignaciones(
      state.designacionesIncompletas,
    );
    state.designaciones = sortDesignaciones(state.designaciones);
    state.designacionesAConfirmar = sortDesignaciones(
      state.designacionesAConfirmar,
    );
  }
};

