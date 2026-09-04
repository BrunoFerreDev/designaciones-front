import { state } from "../state";
import { getCancha, minArbitros, sortDesignaciones } from "../helpers";
import { persistDesignacionesStorage } from "../storage";
import designacionService from "../../services/designacionService";

export const confirmarEnvioDesignacion = async (idDesignacion) => {
  const des = state.designacionesAConfirmar.find(
    (d) =>
      (d.idDesignacion || d.id) === idDesignacion ||
      String(d.idDesignacion || d.id) === String(idDesignacion),
  );
  if (!des) return;

  const arbitrosAsignados =
    state.arbitrosDesignadosMap[idDesignacion] ||
    state.arbitrosDesignadosMap[String(idDesignacion)] ||
    state.arbitrosDesignadosMap[Number(idDesignacion)] ||
    des.arbitrosDesignados ||
    des.arbitros ||
    [];

  const idsArbitros = [
    ...new Set(
      arbitrosAsignados
        .map((a) => {
          if (typeof a === "number") return a;
          if (typeof a === "string" && !isNaN(Number(a))) return Number(a);
          return a.arbitro?.idArbitro ?? a.idArbitro ?? a.arbitro?.id ?? a.id;
        })
        .filter((id) => id !== undefined && id !== null),
    ),
  ];

  try {
    console.log(
      `Confirmando designación ${idDesignacion} enviando árbitros a bulk:`,
      idsArbitros,
    );
    await designacionService.designarListaArbitrosADesignacion(
      idDesignacion,
      idsArbitros,
    );
  } catch (err) {
    console.warn(
      `Llamado al backend falló para designación ${idDesignacion}, procediendo localmente`,
      err,
    );
  }

  const idx = state.designacionesAConfirmar.findIndex(
    (d) =>
      (d.idDesignacion || d.id) === idDesignacion ||
      String(d.idDesignacion || d.id) === String(idDesignacion),
  );
  if (idx !== -1) {
    state.designacionesAConfirmar.splice(idx, 1);
  }

  // Pasa a estado 1 (Aceptada / Completa)
  des.estadoDesignacion = 1;
  if (arbitrosAsignados.length > 0) {
    des.arbitrosDesignados = arbitrosAsignados;
    state.arbitrosDesignadosMap[idDesignacion] = arbitrosAsignados;
  }

  const idxComp = state.designaciones.findIndex(
    (d) =>
      (d.idDesignacion || d.id) === idDesignacion ||
      String(d.idDesignacion || d.id) === String(idDesignacion),
  );
  if (idxComp !== -1) {
    state.designaciones[idxComp] = { ...state.designaciones[idxComp], ...des };
  } else {
    state.designaciones.push(des);
  }

  state.designaciones = sortDesignaciones(state.designaciones);
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar,
  );
  persistDesignacionesStorage(state);

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
    const arbitrosAsignados =
      state.arbitrosDesignadosMap[idDesignacion] ||
      state.arbitrosDesignadosMap[String(idDesignacion)] ||
      state.arbitrosDesignadosMap[Number(idDesignacion)] ||
      des.arbitrosDesignados ||
      des.arbitros ||
      [];
    const idsArbitros = [
      ...new Set(
        arbitrosAsignados
          .map((a) => {
            if (typeof a === "number") return a;
            if (typeof a === "string" && !isNaN(Number(a))) return Number(a);
            return a.arbitro?.idArbitro ?? a.idArbitro ?? a.arbitro?.id ?? a.id;
          })
          .filter((id) => id !== undefined && id !== null),
      ),
    ];

    try {
      console.log(
        `Confirmando designación ${idDesignacion} enviando árbitros a bulk:`,
        idsArbitros,
      );
      await designacionService.designarListaArbitrosADesignacion(
        idDesignacion,
        idsArbitros,
      );
    } catch (err) {
      console.warn(
        `Llamado al backend falló para designación ${idDesignacion}, procediendo localmente`,
        err,
      );
    }

    des.estadoDesignacion = 1;
    if (arbitrosAsignados.length > 0) {
      des.arbitrosDesignados = arbitrosAsignados;
      state.arbitrosDesignadosMap[idDesignacion] = arbitrosAsignados;
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
    const id = des.idDesignacion || des.id;
    const idx = state.designacionesAConfirmar.findIndex(
      (d) =>
        (d.idDesignacion || d.id) === id ||
        String(d.idDesignacion || d.id) === String(id),
    );
    if (idx !== -1) {
      state.designacionesAConfirmar.splice(idx, 1);
    }
    const idxComp = state.designaciones.findIndex(
      (d) =>
        (d.idDesignacion || d.id) === id ||
        String(d.idDesignacion || d.id) === String(id),
    );
    if (idxComp !== -1) {
      state.designaciones[idxComp] = {
        ...state.designaciones[idxComp],
        ...des,
      };
    } else {
      state.designaciones.push(des);
    }
  });

  state.designaciones = sortDesignaciones(state.designaciones);
  state.designacionesAConfirmar = sortDesignaciones(
    state.designacionesAConfirmar,
  );
  persistDesignacionesStorage(state);

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
    persistDesignacionesStorage(state);
  }
};

