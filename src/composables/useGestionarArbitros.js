import { ref, computed } from "vue";
import {
  state,
  getCancha,
  minArbitros,
  getDayOfWeekLocal,
  loadArbitrosDesignados,
  loadArbitros,
  quitarArbitroDeDesignacionManual,
  limpiarArbitrosDesignacion,
  asignarArbitroADesignacionManual,
  forzarAsignarArbitroADesignacionManual,
  isRefereeAssignedToDifferentCourtOnSameDay,
  isArbitroActivo,
} from "../store";

export function useGestionarArbitros(options = {}) {
  const isHistorico = options.isHistorico || false;

  const designacionId = computed(() => state.modal?.id);

  const designacion = computed(() => {
    const id = designacionId.value;
    if (!id) return null;

    const found =
      state.designaciones.find((d) => (d.idDesignacion || d.id) === id) ||
      state.designacionesIncompletas.find(
        (d) => (d.idDesignacion || d.id) === id,
      ) ||
      state.designacionesFinalizadas.find(
        (d) => (d.idDesignacion || d.id) === id,
      ) ||
      state.designacionesAConfirmar.find(
        (d) => (d.idDesignacion || d.id) === id,
      ) ||
      (state.designacionesAceptadas &&
        state.designacionesAceptadas.find(
          (d) => (d.idDesignacion || d.id) === id,
        ));
    if (found) return found;

    if (
      state.modal?.data &&
      (state.modal.data.idDesignacion || state.modal.data.id) === id
    ) {
      return state.modal.data;
    }
    return null;
  });

  const canchaName = computed(() => {
    const d = designacion.value;
    if (!d) return "Cancha";
    return (
      d.cancha?.nombreCancha ||
      getCancha(d.idCancha || d.canchaId)?.nombre ||
      "Cancha Desconocida"
    );
  });

  const requiredCount = computed(() => {
    const d = designacion.value;
    if (!d) return 0;
    return minArbitros(d.cantidadPartidos || 0);
  });

  const assignedReferees = ref([]);
  const availableReferees = ref([]);
  const selectedRefereeId = ref(null);
  const filterByDay = ref(true);
  const canForceAssign = ref(false);
  const refereeIdToForce = ref(null);
  const forcing = ref(false);
  const loadingAssigned = ref(false);
  const loadingAvailable = ref(false);
  const assigning = ref(false);
  const errorMessage = ref("");

  const isComplete = computed(() => {
    return assignedReferees.value.length >= requiredCount.value;
  });

  const isSaturday = computed(() => {
    if (!designacion.value) return false;
    return getDayOfWeekLocal(designacion.value.fecha) === 6;
  });

  const isSunday = computed(() => {
    if (!designacion.value) return false;
    return getDayOfWeekLocal(designacion.value.fecha) === 0;
  });

  const getAvailabilityText = (arb) => {
    if (arb.disponibleSabado && arb.disponibleDomingo) return "Sáb y Dom";
    if (arb.disponibleSabado) return "Sáb";
    if (arb.disponibleDomingo) return "Dom";
    return "Ninguno";
  };

  const loadAssigned = async () => {
    if (!designacionId.value) return;
    loadingAssigned.value = true;
    try {
      assignedReferees.value = await loadArbitrosDesignados(designacionId.value);
    } catch (error) {
      console.error("Error cargando asignaciones:", error);
    } finally {
      loadingAssigned.value = false;
    }
  };

  const loadAvailable = async () => {
    loadingAvailable.value = true;
    try {
      await loadArbitros();
      if (isHistorico) {
        availableReferees.value = state.arbitros.filter(isArbitroActivo);
      } else {
        availableReferees.value = state.arbitros.filter(
          (a) =>
            isArbitroActivo(a) &&
            (a.disponibleSabado || a.disponibleDomingo),
        );
      }
    } catch (error) {
      console.error("Error cargando árbitros disponibles:", error);
    } finally {
      loadingAvailable.value = false;
    }
  };

  const filteredAvailableReferees = computed(() => {
    return availableReferees.value.filter((arb) => {
      if (!arb || !arb.idArbitro) return false;
      const isAlreadyAssigned = assignedReferees.value.some(
        (assigned) =>
          assigned &&
          (assigned.arbitro?.idArbitro || assigned.idArbitro) === arb.idArbitro,
      );
      if (isAlreadyAssigned) return false;

      if (!isHistorico && designacion.value) {
        if (
          isRefereeAssignedToDifferentCourtOnSameDay(
            arb.idArbitro,
            designacion.value,
          )
        ) {
          return false;
        }

        const day = getDayOfWeekLocal(designacion.value.fecha);
        if (filterByDay.value) {
          if (day === 6 && !arb.disponibleSabado) return false;
          if (day === 0 && !arb.disponibleDomingo) return false;
        }
      }
      return true;
    });
  });

  const assignReferee = async () => {
    if (!selectedRefereeId.value || !designacionId.value) return;
    const targetArbId = selectedRefereeId.value;
    errorMessage.value = "";
    canForceAssign.value = false;
    refereeIdToForce.value = null;
    assigning.value = true;
    try {
      await asignarArbitroADesignacionManual(
        designacionId.value,
        targetArbId,
        isHistorico ? 0 : 1,
      );
      selectedRefereeId.value = null;
      await loadAssigned();
    } catch (error) {
      console.error(error);
      let msg = "No se pudo asignar el árbitro.";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          msg = error.response.data;
        } else if (typeof error.response.data === "object") {
          msg = error.response.data.message || error.response.data.error || msg;
        }
      } else {
        msg = error.message || msg;
      }
      errorMessage.value = msg;

      const lower = msg.toLowerCase();
      if (
        lower.includes("ya estuvo en esta cancha") ||
        lower.includes("última fecha") ||
        lower.includes("sábado anterior") ||
        lower.includes("no se puede asignar")
      ) {
        canForceAssign.value = true;
        refereeIdToForce.value = targetArbId;
      }
    } finally {
      assigning.value = false;
    }
  };

  const forceAssignReferee = async () => {
    if (!refereeIdToForce.value || !designacionId.value) return;
    errorMessage.value = "";
    forcing.value = true;
    try {
      await forzarAsignarArbitroADesignacionManual(
        designacionId.value,
        refereeIdToForce.value,
      );
      refereeIdToForce.value = null;
      canForceAssign.value = false;
      selectedRefereeId.value = null;
      await loadAssigned();
    } catch (error) {
      console.error("Error forzando asignación:", error);
      let msg = "No se pudo forzar la asignación del árbitro.";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          msg = error.response.data;
        } else if (typeof error.response.data === "object") {
          msg = error.response.data.message || error.response.data.error || msg;
        }
      } else {
        msg = error.message || msg;
      }
      errorMessage.value = msg;
    } finally {
      forcing.value = false;
    }
  };

  const removeReferee = async (idArbitro) => {
    if (!idArbitro || !designacionId.value) return;
    if (!confirm("¿Estás seguro de quitar este árbitro de la designación?"))
      return;
    errorMessage.value = "";
    try {
      await quitarArbitroDeDesignacionManual(designacionId.value, idArbitro);
      await loadAssigned();
    } catch (error) {
      console.error(error);
      let msg = "No se pudo quitar el árbitro.";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          msg = error.response.data;
        } else if (typeof error.response.data === "object") {
          msg = error.response.data.message || error.response.data.error || msg;
        }
      } else {
        msg = error.message || msg;
      }
      errorMessage.value = msg;
    }
  };

  const limpiarTodosArbitros = async () => {
    if (!designacionId.value || isBlockedNotEditable.value) return;
    errorMessage.value = "";
    try {
      await limpiarArbitrosDesignacion(designacionId.value);
      await loadAssigned();
    } catch (error) {
      console.error(error);
      errorMessage.value =
        error.message || "No se pudieron limpiar los árbitros.";
    }
  };

  return {
    designacionId,
    designacion,
    canchaName,
    requiredCount,
    assignedReferees,
    availableReferees,
    filteredAvailableReferees,
    selectedRefereeId,
    filterByDay,
    canForceAssign,
    refereeIdToForce,
    forcing,
    loadingAssigned,
    loadingAvailable,
    assigning,
    errorMessage,
    isComplete,
    isSaturday,
    isSunday,
    getAvailabilityText,
    loadAssigned,
    loadAvailable,
    assignReferee,
    forceAssignReferee,
    removeReferee,
    limpiarTodosArbitros,
  };
}

