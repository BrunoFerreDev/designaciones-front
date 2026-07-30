<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <!-- Modal Header -->
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--color-border-tertiary);
        padding-bottom: 1rem;
      "
    >
      <div>
        <h3
          style="
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text-primary);
            margin-bottom: 4px;
          "
        >
          👥 Gestionar Árbitrossss
        </h3>
        <div style="font-size: 12px; color: var(--color-text-secondary)">
          Cancha:
          <strong style="color: var(--color-text-primary)">{{
            canchaName
          }}</strong>
          · Fecha: {{ designacion?.fecha }}
        </div>
      </div>
      <button
        @click="closeModal"
        class="btn"
        style="
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--color-text-secondary);
        "
      >
        <i class="ti ti-x" style="font-size: 20px"></i>
      </button>
    </div>

    <!-- Info Alert (Requirement and Current Count) -->
    <div
      :class="isComplete ? 'alert alert-success' : 'alert alert-warning'"
      style="
        margin-bottom: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
      "
    >
      <i
        :class="isComplete ? 'ti ti-check' : 'ti ti-alert-triangle'"
        style="font-size: 18px"
      ></i>
      <div style="font-size: 12px; line-height: 1.4">
        <strong>{{
          isComplete ? "Designación Completa" : "Designación Incompleta"
        }}</strong
        ><br />
        Requiere mínimo <strong>{{ requiredCount }}</strong> árbitros.
        Actualmente hay
        <strong>{{ assignedReferees.length }}</strong> asignados.
      </div>
    </div>

    <!-- Error Alert if any -->
    <div
      v-if="errorMessage"
      class="alert alert-red"
      style="
        background: #fcebeb;
        color: #a32d2d;
        border: 0.5px solid #f5c2c2;
        padding: 12px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      "
    >
      <i class="ti ti-alert-circle" style="font-size: 18px"></i>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Section: Assigned Referees -->
    <div>
      <div
        style="
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <span>🏃‍♂️ Árbitros Asignados ({{ assignedReferees.length }})</span>
      </div>

      <div
        v-if="loadingAssigned"
        style="
          text-align: center;
          padding: 1.5rem;
          color: var(--color-text-secondary);
          font-size: 13px;
        "
      >
        <i
          class="ti ti-loader"
          style="
            font-size: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 6px;
          "
        ></i>
        Cargando asignaciones...
      </div>

      <div
        v-else-if="assignedReferees.length === 0"
        style="
          background: var(--color-background-secondary);
          border: 1px dashed var(--color-border-primary);
          border-radius: 8px;
          padding: 2rem 1rem;
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 12px;
        "
      >
        No hay árbitros asignados actualmente para esta fecha.<br />
        Usa el buscador inferior para añadir uno.
      </div>

      <div
        v-else
        style="
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 4px;
        "
      >
        <div
          v-for="arb in sortedAssignedReferees"
          :key="arb.idDesignados || arb.id"
          class="card"
          style="
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--color-background-primary);
            border-color: var(--color-border-tertiary);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
            transition: transform 0.2s;
          "
        >
          <div style="display: flex; align-items: center; gap: 10px">
            <div
              class="arb-avatar"
              style="
                width: 28px;
                height: 28px;
                font-size: 11px;
                background: #e1f5ee;
                color: #0f6e56;
              "
            >
              {{ arb.arbitro?.nombre?.charAt(0)
              }}{{ arb.arbitro?.apellido?.charAt(0) }}
            </div>
            <div>
              <div
                style="
                  font-size: 13px;
                  font-weight: 500;
                  color: var(--color-text-primary);
                "
              >
                {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
              </div>
              <div
                style="
                  font-size: 10px;
                  color: var(--color-text-secondary);
                  display: flex;
                  gap: 6px;
                  align-items: center;
                  margin-top: 2px;
                "
              >
                <span
                  class="badge badge-gray"
                  style="font-size: 9px; padding: 1px 5px"
                  >{{ arb.arbitro?.categoria }}</span
                >
                <span>·</span>
                <span>{{ arb.partidosDirigidos || 0 }} partidos dirigidos</span>
              </div>
            </div>
          </div>

          <button
            @click="removeReferee(arb.arbitro?.idArbitro)"
            class="btn danger"
            style="
              padding: 6px;
              border-radius: 6px;
              border: none;
              font-size: 14px;
            "
            title="Quitar de la designación"
          >
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Section: Assign New Referee -->
    <div
      style="
        border-top: 1px solid var(--color-border-tertiary);
        padding-top: 1.25rem;
      "
    >
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 8px;
        "
      >
        <div
          style="
            font-size: 13px;
            font-weight: 600;
            color: var(--color-text-secondary);
          "
        >
          ➕ Asignar Árbitro Disponible
        </div>
        <label
          style="
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--color-text-secondary);
            cursor: pointer;
            user-select: none;
          "
        >
          <input type="checkbox" v-model="filterByDay" />
          <span
            >Filtrar por día ({{
              isSaturday ? "Sáb" : isSunday ? "Dom" : "Otro"
            }})</span
          >
        </label>
      </div>

      <div style="display: flex; gap: 10px; align-items: center">
        <div style="flex: 1; position: relative">
          <select
            v-model="selectedRefereeId"
            class="form-input"
            style="height: 38px; font-size: 13px; padding-right: 24px"
            :disabled="loadingAvailable"
          >
            <option :value="null" disabled>
              Selecciona un árbitro disponible...
            </option>
            <option
              v-for="arb in filteredAvailableReferees"
              :key="arb.idArbitro"
              :value="arb.idArbitro"
            >
              {{ arb.nombre }} {{ arb.apellido }} ({{ arb.categoria }}) · [{{
                getAvailabilityText(arb)
              }}]
            </option>
          </select>
          <div
            v-if="loadingAvailable"
            style="position: absolute; right: 8px; top: 11px"
          >
            <i
              class="ti ti-loader"
              style="
                animation: spin 1s linear infinite;
                font-size: 16px;
                color: var(--color-text-secondary);
              "
            ></i>
          </div>
        </div>

        <button
          @click="assignReferee"
          class="btn primary"
          style="
            height: 38px;
            white-space: nowrap;
            padding: 0 16px;
            font-weight: 500;
          "
          :disabled="!selectedRefereeId || assigning"
        >
          <span v-if="assigning">
            <i
              class="ti ti-loader"
              style="animation: spin 1s linear infinite; margin-right: 4px"
            ></i>
          </span>
          <span v-else>Asignar</span>
        </button>
      </div>
      <div
        style="
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-top: 6px;
          padding-left: 2px;
        "
      >
        Solo se listan árbitros que están marcados como
        <strong style="color: #0f6e56">disponibles</strong> en el sistema y no
        están ya asignados en esta designación.
      </div>
    </div>

    <!-- Modal Footer -->
    <div
      class="modal-footer"
      style="
        margin-top: 0.5rem;
        border-top: 1px solid var(--color-border-tertiary);
        padding-top: 1rem;
      "
    >
      <button @click="closeModal" class="btn" style="padding: 8px 16px">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  state,
  closeModal,
  getCancha,
  loadArbitrosDesignados,
  quitarArbitroDeDesignacionManual,
  asignarArbitroADesignacionManual,
  isRefereeAssignedToDifferentCourtOnSameDay,
  minArbitros,
  getDayOfWeekLocal,
  loadArbitros,
} from "../store";
import arbitroService from "../services/arbitroService";

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
    (state.designacionesCanceladas &&
      state.designacionesCanceladas.find(
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

const isComplete = computed(() => {
  return assignedReferees.value.length >= requiredCount.value;
});

const assignedReferees = ref([]);
const ORDER_CAT = {
  AVANZADO: 1,
  INTERMEDIO: 2,
  PRINCIPAL_1: 3,
  PRINCIPAL_2: 4,
  PRINCIPAL_3: 5,
  PRINCIPAL_4: 6,
  ASISTENTE: 7,
  INCIAL: 8,
  INICIAL: 8
};
const sortedAssignedReferees = computed(() => {
  return [...assignedReferees.value].sort((a, b) => {
    const nameA = `${a.arbitro?.nombre || a.nombre || ""} ${a.arbitro?.apellido || a.apellido || ""}`.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const nameB = `${b.arbitro?.nombre || b.nombre || ""} ${b.arbitro?.apellido || b.apellido || ""}`.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (nameA === "hector mendoza" && nameB === "hector mendoza") return 0;
    if (nameA === "hector mendoza") return 1;
    if (nameB === "hector mendoza") return -1;

    const catA = String(a.arbitro?.categoria || a.categoria || "").trim().toUpperCase();
    const catB = String(b.arbitro?.categoria || b.categoria || "").trim().toUpperCase();

    const valA = ORDER_CAT[catA] !== undefined ? ORDER_CAT[catA] : 99;
    const valB = ORDER_CAT[catB] !== undefined ? ORDER_CAT[catB] : 99;

    return valA - valB;
  });
});
const availableReferees = ref([]);
const selectedRefereeId = ref(null);
const filterByDay = ref(true);

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

const loadingAssigned = ref(false);
const loadingAvailable = ref(false);
const assigning = ref(false);
const errorMessage = ref("");

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
    availableReferees.value = state.arbitros.filter(
      (a) => a && (a.disponibleSabado || a.disponibleDomingo) && a.estadoSistema !== false,
    );
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

    if (designacion.value) {
      if (
        isRefereeAssignedToDifferentCourtOnSameDay(
          arb.idArbitro,
          designacion.value,
        )
      ) {
        return false;
      }

      // Evitar repetir árbitro en la misma cancha en sábados consecutivos
      const day = getDayOfWeekLocal(designacion.value.fecha);
      if (day === 6) {
        const nombreCompleto = `${arb.nombre || ""} ${arb.apellido || ""}`.trim();
        const normalized = nombreCompleto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const isHectorMendoza = normalized === "hector mendoza";

        if (!isHectorMendoza) {
          const targetCanchaId =
            designacion.value.idCancha ||
            designacion.value.canchaId ||
            designacion.value.cancha?.idCancha ||
            designacion.value.cancha?.id;

          const isExcluded = state.designacionesFinalizadas.some((finalD) => {
            if (!finalD) return false;
            const finalCanchaId =
              finalD.idCancha ||
              finalD.canchaId ||
              finalD.cancha?.idCancha ||
              finalD.cancha?.idCancha;
            if (
              String(finalCanchaId) === String(targetCanchaId) &&
              getDayOfWeekLocal(finalD.fecha) === 6
            ) {
              const assigned = finalD.arbitrosDesignados || finalD.arbitros || [];
              return assigned.some(
                (asg) =>
                  asg &&
                  (asg.arbitro?.idArbitro || asg.idArbitro || asg) ===
                    arb.idArbitro,
              );
            }
            return false;
          });

          if (isExcluded) return false;
        }
      }

      // Filter by day of week if toggle is active
      if (filterByDay.value) {
        if (day === 6 && !arb.disponibleSabado) {
          return false;
        }
        if (day === 0 && !arb.disponibleDomingo) {
          return false;
        }
      }
    }
    return true;
  });
});

const assignReferee = async () => {
  if (!selectedRefereeId.value || !designacionId.value) return;
  errorMessage.value = "";
  assigning.value = true;
  try {
    await asignarArbitroADesignacionManual(
      designacionId.value,
      selectedRefereeId.value,
      1,
    );
    selectedRefereeId.value = null;
    // Refresh assignments list
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
  } finally {
    assigning.value = false;
  }
};

const removeReferee = async (idArbitro) => {
  if (!idArbitro || !designacionId.value) return;
  if (!confirm("¿Estás seguro de quitar este árbitro de la designación?"))
    return;
  errorMessage.value = "";
  try {
    await quitarArbitroDeDesignacionManual(designacionId.value, idArbitro);
    // Refresh assignments list
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

onMounted(() => {
  loadAssigned();
  loadAvailable();
});
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
