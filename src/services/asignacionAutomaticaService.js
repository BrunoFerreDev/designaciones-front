import { state } from "../store/state.js";
import {
  getCancha,
  minArbitros,
  getDayOfWeekLocal,
  getLocalDateString,
  isArbitroActivo,
} from "../store/helpers.js";

/**
 * Verifica si un árbitro tiene categoría o rol de Asistente
 */
export const isAsistente = (arb) => {
  if (!arb) return false;
  const cat = String(arb.categoria || "")
    .toUpperCase()
    .trim();
  if (cat === "ASISTENTE") return true;
  const rol = String(arb.rol || "")
    .toLowerCase()
    .trim();
  return rol.includes("asistente");
};

/**
 * Categorías ordenadas por jerarquía, de mayor a menor según definición del backend
 */
export const CATEGORIAS_JERARQUIA = [
  "AVANZADO",
  "INTERMEDIO",
  "PRINCIPAL_1",
  "PRINCIPAL_2",
  "PRINCIPAL_3",
  "PRINCIPAL_4",
  "ASISTENTE",
  "INICIAL",
];

export const getJerarquiaNivel = (cat) => {
  if (!cat) return -1;
  const norm = String(cat).toUpperCase().trim().replace(/ /g, "_");
  const idx = CATEGORIAS_JERARQUIA.indexOf(norm);
  if (idx === -1) return -1;
  return CATEGORIAS_JERARQUIA.length - idx;
};

/**
 * Verifica si un árbitro tiene categoría como mínimo Principal 1
 * Por jerarquía: AVANZADO, INTERMEDIO o PRINCIPAL_1 cumplen este requisito.
 */
export const isMinimoPrincipal1 = (arb) => {
  if (!arb) return false;
  const cat = String(arb.categoria || "")
    .toUpperCase()
    .trim()
    .replace(/ /g, "_");
  return (
    cat === "AVANZADO" ||
    cat === "INTERMEDIO" ||
    cat === "PRINCIPAL_1"
  );
};

export const isPrincipal1 = isMinimoPrincipal1;

/**
 * Verifica si un árbitro es Héctor Mendoza (excepción histórica)
 */
export const isHectorMendoza = (arb) => {
  if (!arb) return false;
  const nombreCompleto = `${arb.nombre || ""} ${arb.apellido || ""}`.trim();
  const normalized = nombreCompleto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return normalized === "hector mendoza";
};

/**
 * Obtiene el conjunto de IDs de árbitros que dirigieron en una cancha el fin de semana anterior.
 * Se considera fin de semana anterior un partido finalizado en la misma cancha
 * con fecha entre 5 y 9 días antes de la fecha destino.
 */
export const getArbitrosCanchaFindeAnterior = (
  targetCanchaId,
  targetFechaStr,
  designacionesHistoricas = state.designacionesFinalizadas,
) => {
  const excludedIds = new Set();
  if (!targetCanchaId || !targetFechaStr) return excludedIds;

  const targetDateStr = getLocalDateString(targetFechaStr);
  const targetDate = new Date(targetDateStr + "T12:00:00");
  if (isNaN(targetDate.getTime())) return excludedIds;

  (designacionesHistoricas || []).forEach((histD) => {
    const histCanchaId =
      histD.idCancha ||
      histD.canchaId ||
      histD.cancha?.idCancha ||
      histD.cancha?.id;

    if (String(histCanchaId) !== String(targetCanchaId)) return;

    const histDateStr = getLocalDateString(histD.fecha);
    if (!histDateStr) return;

    const histDate = new Date(histDateStr + "T12:00:00");
    if (isNaN(histDate.getTime())) return;

    // Diferencia en días
    const diffTime = targetDate.getTime() - histDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Si ocurrió entre 5 y 9 días antes (fin de semana anterior consecutivo)
    if (diffDays >= 5 && diffDays <= 9) {
      const assigned =
        state.arbitrosDesignadosMap[histD.idDesignacion || histD.id] ||
        histD.arbitrosDesignados ||
        histD.arbitros ||
        [];

      assigned.forEach((asg) => {
        const arbId = asg.arbitro?.idArbitro || asg.idArbitro || asg.id;
        if (arbId) {
          const arbObj = state.arbitros.find((a) => a.idArbitro === arbId);
          if (arbObj && isHectorMendoza(arbObj)) {
            return; // Excepción para Héctor Mendoza
          }
          excludedIds.add(Number(arbId));
        }
      });
    }
  });

  return excludedIds;
};

/**
 * Ejecuta el algoritmo de asignación automática para una lista de designaciones (o todas las incompletas).
 * 
 * Reglas cumplidas:
 * 1. Disponibilidad según día (Sábado: disponibleSabado, Domingo: disponibleDomingo, árbitro activo, sin doble partido el mismo día).
 * 2. Solo un asistente por cancha (máximo 1).
 * 3. No repetir cancha fines de corrido (excluye árbitros del fin de semana previo en esa cancha).
 * 4. Como mínimo un árbitro de categoría Principal 1 en todas las canchas.
 * 5. Balance de carga (prioriza árbitros con menor cantidad de partidos dirigidos).
 *
 * @param {Array} designaciones - Lista de designaciones a procesar.
 * @param {Object} options - Opciones de configuración.
 * @returns {Object} { asignacionesPorDesignacion: Object, advertencias: Array, totalAsignadas: Number }
 */
export const ejecutarAsignacionAutomatica = (
  designaciones,
  options = {},
) => {
  const desList = Array.isArray(designaciones) ? [...designaciones] : [];
  if (desList.length === 0) {
    return {
      asignacionesPorDesignacion: {},
      advertencias: ["No se proporcionaron designaciones para procesar."],
      totalAsignadas: 0,
    };
  }

  const advertencias = [];
  const asignacionesPorDesignacion = {};

  // Árbitros activos en el sistema
  const todosActivos = (state.arbitros || []).filter(isArbitroActivo);

  // Mapa para rastrear asignaciones en el mismo día durante esta ejecución
  // fechaStr (YYYY-MM-DD) -> Set de idArbitro asignados
  const arbitrosAsignadosPorDia = {};

  // Registrar árbitros que ya estén asignados previamente a otras designaciones activas en esa misma fecha
  const allActiveDesignaciones = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar,
    ...(state.designacionesAceptadas || []),
  ];

  const inputIdsSet = new Set(
    desList.map((d) => String(d.idDesignacion || d.id)),
  );

  allActiveDesignaciones.forEach((otherD) => {
    const otherId = String(otherD.idDesignacion || otherD.id);
    if (inputIdsSet.has(otherId)) return; // Se reasignará en esta tanda

    const dStr = getLocalDateString(otherD.fecha);
    if (!dStr) return;

    if (!arbitrosAsignadosPorDia[dStr]) {
      arbitrosAsignadosPorDia[dStr] = new Set();
    }

    const assigned =
      state.arbitrosDesignadosMap[otherId] ||
      otherD.arbitrosDesignados ||
      otherD.arbitros ||
      [];

    assigned.forEach((asg) => {
      const arbId = asg.arbitro?.idArbitro || asg.idArbitro;
      if (arbId) {
        arbitrosAsignadosPorDia[dStr].add(Number(arbId));
      }
    });
  });

  // Agrupar designaciones a procesar por fecha
  const designacionesPorFecha = {};
  desList.forEach((des) => {
    const dStr = getLocalDateString(des.fecha);
    if (!designacionesPorFecha[dStr]) {
      designacionesPorFecha[dStr] = [];
    }
    designacionesPorFecha[dStr].push(des);
  });

  // Procesar día por día
  Object.keys(designacionesPorFecha).forEach((dateStr) => {
    const desDelDia = designacionesPorFecha[dateStr];
    if (!arbitrosAsignadosPorDia[dateStr]) {
      arbitrosAsignadosPorDia[dateStr] = new Set();
    }
    const asignadosHoy = arbitrosAsignadosPorDia[dateStr];

    // Determinar si es sábado, domingo u otro día
    const dayOfWeek = getDayOfWeekLocal(dateStr);
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;

    // Filtrar árbitros disponibles según el día de la semana
    const disponiblesParaEsteDia = todosActivos.filter((arb) => {
      if (isSaturday && !arb.disponibleSabado) return false;
      if (isSunday && !arb.disponibleDomingo) return false;
      return true;
    });

    // Estructura de asignación para cada cancha de este día
    const canchasDelDia = desDelDia.map((des) => {
      const idDes = des.idDesignacion || des.id;
      const targetCanchaId =
        des.idCancha || des.canchaId || des.cancha?.idCancha || des.cancha?.id;
      const canchaObj = getCancha(Number(targetCanchaId)) || des.cancha;
      const canchaNombre =
        des.cancha?.nombreCancha || canchaObj?.nombre || "Cancha";
      const req = minArbitros(des.cantidadPartidos || 0);

      // Regla 3: árbitros excluidos por haber dirigido en esta cancha el fin de semana anterior
      const excluidosPorRepeticion = getArbitrosCanchaFindeAnterior(
        targetCanchaId,
        des.fecha,
      );

      return {
        idDesignacion: idDes,
        des,
        targetCanchaId,
        canchaNombre,
        req,
        excluidosPorRepeticion,
        seleccionados: [],
      };
    });

    // Función auxiliar para ordenar árbitros por menor carga de partidos
    const ordenarPorCarga = (list) => {
      return [...list].sort(
        (a, b) => (a.designaciones || 0) - (b.designaciones || 0),
      );
    };

    // =========================================================================
    // FASE 1: REGLA 4 - Como mínimo 1 árbitro categoría Principal 1 o superior
    // (AVANZADO, INTERMEDIO o PRINCIPAL_1) por cancha
    // =========================================================================
    canchasDelDia.forEach((cancha) => {
      // Candidatos con nivel mínimo Principal 1 disponibles, no asignados hoy, y no repetidos en esta cancha
      const candidatosP1 = disponiblesParaEsteDia.filter((arb) => {
        const arbId = Number(arb.idArbitro);
        if (asignadosHoy.has(arbId)) return false;
        if (cancha.excluidosPorRepeticion.has(arbId)) return false;
        return isMinimoPrincipal1(arb);
      });

      const ordenadosP1 = ordenarPorCarga(candidatosP1);

      if (ordenadosP1.length > 0) {
        const elegido = ordenadosP1[0];
        const arbId = Number(elegido.idArbitro);
        cancha.seleccionados.push(elegido);
        asignadosHoy.add(arbId);
      } else {
        advertencias.push(
          `Fecha ${dateStr} - ${cancha.canchaNombre}: No hay árbitros disponibles con categoría como mínimo Principal 1 (Avanzado, Intermedio o Principal 1) sin conflicto de repetición o disponibilidad.`,
        );
      }
    });

    // =========================================================================
    // FASE 2: REGLA 2 - Solo un asistente por cancha (máximo 1)
    // Asignar hasta 1 asistente a aquellas canchas que aún tengan vacantes
    // =========================================================================
    canchasDelDia.forEach((cancha) => {
      if (cancha.seleccionados.length >= cancha.req) return;

      const yaTieneAsistente = cancha.seleccionados.some(isAsistente);
      if (yaTieneAsistente) return;

      // Candidatos Asistente disponibles, no asignados hoy, y no repetidos
      const candidatosAsistente = disponiblesParaEsteDia.filter((arb) => {
        const arbId = Number(arb.idArbitro);
        if (asignadosHoy.has(arbId)) return false;
        if (cancha.excluidosPorRepeticion.has(arbId)) return false;
        return isAsistente(arb);
      });

      const ordenadosAsistente = ordenarPorCarga(candidatosAsistente);

      if (ordenadosAsistente.length > 0) {
        const elegido = ordenadosAsistente[0];
        const arbId = Number(elegido.idArbitro);
        cancha.seleccionados.push(elegido);
        asignadosHoy.add(arbId);
      }
    });

    // =========================================================================
    // FASE 3: COMPLETAR CUPOS RESTANTES HASTA minArbitros
    // REGLA 2: ¡No asignar un segundo asistente! Solo árbitros que NO sean asistentes
    // =========================================================================
    canchasDelDia.forEach((cancha) => {
      while (cancha.seleccionados.length < cancha.req) {
        const yaTieneAsistente = cancha.seleccionados.some(isAsistente);

        // Candidatos generales: si ya tiene asistente, EXCLUIR asistentes
        const candidatos = disponiblesParaEsteDia.filter((arb) => {
          const arbId = Number(arb.idArbitro);
          if (asignadosHoy.has(arbId)) return false;
          if (cancha.excluidosPorRepeticion.has(arbId)) return false;
          if (yaTieneAsistente && isAsistente(arb)) return false;
          return true;
        });

        const ordenados = ordenarPorCarga(candidatos);

        if (ordenados.length > 0) {
          const elegido = ordenados[0];
          const arbId = Number(elegido.idArbitro);
          cancha.seleccionados.push(elegido);
          asignadosHoy.add(arbId);
        } else {
          advertencias.push(
            `Fecha ${dateStr} - ${cancha.canchaNombre}: No hay suficientes árbitros disponibles para cubrir el mínimo requerido (${cancha.req}). Faltaron ${cancha.req - cancha.seleccionados.length} árbitro(s).`,
          );
          break; // No hay más árbitros disponibles para esta cancha
        }
      }

      // Guardar en el resultado final
      asignacionesPorDesignacion[cancha.idDesignacion] = {
        idDesignacion: cancha.idDesignacion,
        designacion: cancha.des,
        canchaNombre: cancha.canchaNombre,
        fecha: cancha.des.fecha,
        requeridos: cancha.req,
        arbitros: cancha.seleccionados.map((arb, idx) => ({
          idDesignados: Date.now() + idx + Math.random(),
          arbitro: arb,
          partidosDirigidos: arb.designaciones || 0,
        })),
        cumplePrincipal1: cancha.seleccionados.some(isPrincipal1),
        cantidadAsistentes: cancha.seleccionados.filter(isAsistente).length,
      };
    });
  });

  return {
    asignacionesPorDesignacion,
    advertencias,
    totalAsignadas: Object.keys(asignacionesPorDesignacion).length,
  };
};

export default {
  isAsistente,
  isPrincipal1,
  isHectorMendoza,
  getArbitrosCanchaFindeAnterior,
  ejecutarAsignacionAutomatica,
};
