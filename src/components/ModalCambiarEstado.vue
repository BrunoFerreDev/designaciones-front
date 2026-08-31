<template>
  <div class="modal-content animate-fade-in">
    <!-- Header -->
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--color-border-tertiary);
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;
      "
    >
      <div>
        <h3
          style="
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text-primary);
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
          "
        >
          🔄 Cambiar Estado de Designación
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

    <!-- Non-Editable Alert -->
    <div
      v-if="isBlockedNotEditable"
      class="alert mb-4"
      style="
        background: #fef3c7;
        color: #92400e;
        border: 0.5px solid #fde68a;
        padding: 10px 12px;
        font-size: 12px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      "
    >
      <i class="ti ti-lock" style="font-size: 16px"></i>
      <span
        >Esta designación está marcada como
        <strong>solo lectura (editable: false)</strong>. No se permite cambiar
        su estado.</span
      >
    </div>

    <!-- Error Alert if any -->
    <div
      v-if="errorMessage"
      class="alert alert-red mb-4"
      style="
        background: #fcebeb;
        color: #a32d2d;
        border: 0.5px solid #f5c2c2;
        padding: 10px 12px;
        font-size: 12px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      "
    >
      <i class="ti ti-alert-circle" style="font-size: 16px"></i>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Seleccionar Nuevo Estado -->
    <div
      class="form-group mb-4"
      :style="{
        opacity: isBlockedNotEditable ? 0.6 : 1,
        pointerEvents: isBlockedNotEditable ? 'none' : 'auto',
      }"
    >
      <label
        class="form-label"
        style="
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
          display: block;
        "
      >
        Selecciona el nuevo estado:
      </label>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <label
          v-for="st in ESTADOS_DESIGNACION"
          :key="st.id"
          class="state-option-card"
          :style="{
            borderColor:
              selectedState === st.id
                ? st.color
                : 'var(--color-border-tertiary)',
            backgroundColor:
              selectedState === st.id
                ? st.bg
                : 'var(--color-background-primary)',
          }"
        >
          <input
            type="radio"
            name="estadoDesignacion"
            :value="st.id"
            :disabled="isBlockedNotEditable"
            v-model.number="selectedState"
            style="margin-top: 2px; accent-color: #10b981"
          />
          <div style="flex: 1">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <span
                style="font-weight: 600; font-size: 13px"
                :style="{ color: st.color }"
              >
                {{ st.label }}
              </span>
              <span
                class="badge"
                :class="st.badge"
                style="font-size: 9px; padding: 1px 6px"
              >
                Estado {{ st.id }}
              </span>
            </div>
            <p
              style="
                font-size: 11px;
                color: var(--color-text-secondary);
                margin: 2px 0 0;
              "
            >
              {{ getStateDescription(st.id) }}
            </p>
          </div>
        </label>
      </div>
    </div>

    <!-- Detalle / Observación -->
    <div
      class="form-group mb-4"
      :style="{
        opacity: isBlockedNotEditable ? 0.6 : 1,
        pointerEvents: isBlockedNotEditable ? 'none' : 'auto',
      }"
    >
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        "
      >
        <label
          class="form-label"
          style="font-weight: 600; font-size: 13px; margin-bottom: 0"
        >
          📝 Detalle u Observación:
        </label>
        <span style="font-size: 11px; color: var(--color-text-secondary)">
          (Se enviará en el DTO al backend)
        </span>
      </div>
      <textarea
        v-model="detalle"
        :disabled="isBlockedNotEditable"
        class="form-input"
        rows="3"
        placeholder="Ej: Jornada finalizada con normalidad / Suspendida por lluvias al minuto 35..."
        style="
          resize: vertical;
          font-size: 13px;
          padding: 8px 12px;
          width: 100%;
          border-radius: 8px;
        "
      ></textarea>

      <!-- Botones de sugerencia rápida -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px">
        <button
          type="button"
          v-for="sug in quickSuggestions"
          :key="sug"
          :disabled="isBlockedNotEditable"
          @click="detalle = sug"
          class="btn"
          style="
            padding: 2px 8px;
            font-size: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            color: #475569;
          "
        >
          {{ sug }}
        </button>
      </div>
    </div>

    <!-- Editable Checkbox -->
    <div
      class="form-group mb-4"
      :style="{
        opacity: isBlockedNotEditable ? 0.6 : 1,
        pointerEvents: isBlockedNotEditable ? 'none' : 'auto',
      }"
    >
      <label
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-text-primary);
          cursor: pointer;
          user-select: none;
        "
      >
        <input
          type="checkbox"
          v-model="editable"
          :disabled="isBlockedNotEditable"
          style="accent-color: #10b981"
        />
        <span>Permitir edición posterior (editable)</span>
      </label>
    </div>

    <!-- Modal Footer -->
    <div
      class="modal-footer"
      style="
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid var(--color-border-tertiary);
        padding-top: 1rem;
        margin-top: 0.5rem;
      "
    >
      <button class="btn" @click="closeModal" :disabled="saving">
        {{ isBlockedNotEditable ? "Cerrar" : "Cancelar" }}
      </button>
      <button
        v-if="!isBlockedNotEditable"
        class="btn primary"
        @click="handleSave"
        :disabled="saving || isBlockedNotEditable"
        style="
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        "
      >
        <i
          v-if="saving"
          class="ti ti-loader"
          style="animation: spin 1s linear infinite"
        ></i>
        <i v-else class="ti ti-check"></i>
        <span>{{ saving ? "Guardando..." : "Confirmar Estado" }}</span>
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
  cambiarEstadoDesignacionManual,
  ESTADOS_DESIGNACION,
} from "../store";

const designacionId = computed(() => state.modal?.id);

const designacion = computed(() => {
  const id = designacionId.value;
  if (!id) return null;
  const list = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar,
    ...(state.designacionesAceptadas || []),
  ];
  let found = list.find((d) => (d.idDesignacion || d.id) === id);
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

const selectedState = ref(0);
const detalle = ref("");
const editable = ref(true);
const saving = ref(false);
const errorMessage = ref("");

const getStateDescription = (estadoId) => {
  switch (estadoId) {
    case 0:
      return "Jornada pendiente de asignar árbitros mínimos requeridos.";
    case 1:
      return "Jornada confirmada con árbitros designados para disputarse.";
    case 2:
      return "Jornada terminada exitosamente. Se registra en estadísticas.";
    case 3:
      return "Jornada cancelada por motivos climáticos, de predio o fuerza mayor.";
    case 4:
      return "Jornada que comenzó pero fue interrumpida/suspendida durante el juego.";
    default:
      return "";
  }
};

const quickSuggestions = computed(() => {
  switch (selectedState.value) {
    case 1:
      return [
        "Jornada aceptada y confirmada",
        "Árbitros notificados con éxito",
      ];
    case 2:
      return [
        "Jornada disputada con normalidad",
        "Partidos finalizados sin novedades",
      ];
    case 3:
      return [
        "Cancelada por inclemencias climáticas",
        "Cancelada por fuerza mayor",
        "Cancha no disponible",
      ];
    case 4:
      return [
        "Suspendida por lluvia en el 2do partido",
        "Suspendida por falta de luz",
        "Suspendida por incidentes",
      ];
    default:
      return ["Pendiente de completar asignación"];
  }
});

onMounted(() => {
  const d = designacion.value || state.modal?.data || {};
  if (state.modal?.data?.targetState !== undefined) {
    selectedState.value = Number(state.modal.data.targetState);
  } else if (d.estadoDesignacion !== undefined) {
    selectedState.value = Number(d.estadoDesignacion);
  }
  detalle.value =
    d.detalleDesignacion ||
    d.detalle ||
    d.observacion ||
    d.observaciones ||
    d.motivo ||
    state.form?.detalleDesignacion ||
    state.form?.detalle ||
    "";
  editable.value = d.editable !== undefined ? d.editable : true;
});

const isBlockedNotEditable = computed(() => {
  return designacion.value?.editable === false;
});

const handleSave = async () => {
  if (!designacionId.value || isBlockedNotEditable.value) return;
  errorMessage.value = "";
  saving.value = true;
  try {
    const d = designacion.value || {};
    const canchaId =
      d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;

    await cambiarEstadoDesignacionManual(designacionId.value, {
      idCancha: canchaId,
      fecha: d.fecha,
      cantidadPartidos: d.cantidadPartidos || 1,
      etapaCampeonato: d.etapaCampeonato || d.etapaTorneo || "FECHA_NORMAL",
      detalle: detalle.value.trim(),
      detalleDesignacion: detalle.value.trim(),
      editable: editable.value,
      estadoDesignacion: selectedState.value,
    });
    closeModal();
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    let msg = "No se pudo actualizar el estado de la designación.";
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
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
}

.state-option-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.state-option-card:hover {
  transform: translateY(-1px);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
