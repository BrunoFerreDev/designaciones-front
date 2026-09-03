<template>
  <div style="display: flex; flex-direction: column; gap: 1.25rem">
    <!-- Header -->
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--color-border-tertiary);
        padding-bottom: 0.75rem;
      "
    >
      <div>
        <div class="modal-title" style="display: flex; align-items: center; gap: 8px">
          <i class="ti ti-wand" style="color: #7c3aed; font-size: 22px"></i>
          Designación Automática de Árbitros
        </div>
        <div
          style="
            font-size: 12px;
            color: var(--color-text-secondary);
            margin-top: 2px;
          "
        >
          Asignación inteligente aplicando reglas de disponibilidad, categorías y descanso de canchas.
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

    <!-- Reglas de Negocio en Tarjetas / Badges -->
    <div
      style="
        background: #faf5ff;
        border: 1px solid #e9d5ff;
        border-radius: 8px;
        padding: 12px;
      "
    >
      <div
        style="
          font-size: 12px;
          font-weight: 600;
          color: #6b21a8;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        "
      >
        <i class="ti ti-shield-check" style="font-size: 16px"></i>
        Reglas de asignación activas:
      </div>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 8px;
          font-size: 11px;
          color: #581c87;
        "
      >
        <div style="display: flex; align-items: center; gap: 6px">
          <i class="ti ti-calendar-check" style="color: #9333ea"></i>
          <span><strong>1. Disponibilidad:</strong> Sáb y Dom según horario</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px">
          <i class="ti ti-user-x" style="color: #9333ea"></i>
          <span><strong>2. Asistentes:</strong> Máximo 1 por cancha</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px">
          <i class="ti ti-rotate-2" style="color: #9333ea"></i>
          <span><strong>3. No repetir cancha:</strong> Fines seguidos</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px">
          <i class="ti ti-crown" style="color: #9333ea"></i>
          <span><strong>4. Jerarquía:</strong> Mínimo 1 Principal 1 o superior</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px">
          <i class="ti ti-trophy" style="color: #9333ea"></i>
          <span><strong>5. Cruces/Semis/Final:</strong> Sin asistentes ni iniciales</span>
        </div>
      </div>
    </div>

    <!-- Lista de Designaciones Pendientes -->
    <div>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        "
      >
        <div style="font-size: 13px; font-weight: 600; color: var(--color-text-primary)">
          📋 Canchas a designar ({{ incompleteList.length }})
        </div>
        <label
          v-if="incompleteList.length > 0"
          style="
            font-size: 12px;
            color: var(--color-text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          "
        >
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
          />
          <span>Seleccionar todas</span>
        </label>
      </div>

      <div
        v-if="incompleteList.length === 0"
        style="
          padding: 24px;
          text-align: center;
          background: var(--color-background-secondary);
          border-radius: 8px;
          color: var(--color-text-secondary);
          font-size: 13px;
        "
      >
        <i class="ti ti-circle-check" style="font-size: 32px; color: #10b981"></i>
        <div style="margin-top: 8px; font-weight: 500">
          No hay designaciones pendientes de completar.
        </div>
      </div>

      <div
        v-else
        style="
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        "
      >
        <div
          v-for="d in incompleteList"
          :key="d.idDesignacion || d.id"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: #ffffff;
            border: 1px solid var(--color-border-tertiary);
            border-radius: 6px;
            font-size: 12px;
          "
        >
          <label
            style="
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              flex: 1;
            "
          >
            <input
              type="checkbox"
              :value="d.idDesignacion || d.id"
              v-model="selectedIds"
            />
            <div>
              <div style="font-weight: 600; color: var(--color-text-primary)">
                🏟️ {{ getCanchaName(d) }}
              </div>
              <div style="font-size: 11px; color: var(--color-text-secondary)">
                📅 {{ formatFecha(d.fecha) }} · ⚽ {{ d.cantidadPartidos }} partidos (Mín. {{ minArbitros(d.cantidadPartidos) }} árbitros)
              </div>
            </div>
          </label>
          <span
            class="badge"
            :class="getDayBadgeClass(d.fecha)"
            style="font-size: 10px; padding: 2px 6px"
          >
            {{ getDayLabel(d.fecha) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Botón para ejecutar cálculo -->
    <div
      v-if="incompleteList.length > 0 && !previewCalculated"
      style="display: flex; justify-content: flex-end"
    >
      <button
        class="btn primary"
        @click="calcularAsignaciones"
        :disabled="selectedIds.length === 0 || loading"
        style="
          background: #7c3aed;
          border-color: #6d28d9;
          display: flex;
          align-items: center;
          gap: 6px;
        "
      >
        <i v-if="loading" class="ti ti-loader" style="animation: spin 1s linear infinite"></i>
        <i v-else class="ti ti-sparkles"></i>
        <span>{{ loading ? "Calculando..." : `Generar asignaciones (${selectedIds.length})` }}</span>
      </button>
    </div>

    <!-- Vista previa de resultados si ya se calculó -->
    <div v-if="previewCalculated" class="animate-fade-in">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        "
      >
        <div style="font-size: 13px; font-weight: 600; color: var(--color-text-primary)">
          ✨ Vista previa de la asignación generada
        </div>
        <button
          class="btn"
          @click="recalcular"
          style="font-size: 11px; padding: 3px 8px; gap: 4px"
        >
          <i class="ti ti-refresh"></i> Recalcular
        </button>
      </div>

      <!-- Alertas si hubo alguna advertencia -->
      <div
        v-if="warnings.length > 0"
        class="alert alert-warning"
        style="margin-bottom: 12px; font-size: 11px; line-height: 1.4"
      >
        <div style="font-weight: 600; margin-bottom: 4px">
          ⚠️ Avisos de asignación:
        </div>
        <ul style="padding-left: 16px; margin: 0">
          <li v-for="(w, idx) in warnings" :key="idx">{{ w }}</li>
        </ul>
      </div>

      <!-- Resultados cancha por cancha -->
      <div
        style="
          max-height: 320px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-right: 4px;
        "
      >
        <div
          v-for="(asg, idDes) in previewResults"
          :key="idDes"
          style="
            background: #ffffff;
            border: 1px solid var(--color-border-secondary);
            border-radius: 8px;
            padding: 10px 14px;
          "
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            "
          >
            <div>
              <span style="font-weight: 600; font-size: 13px">
                🏟️ {{ asg.canchaNombre }}
              </span>
              <span style="font-size: 11px; color: var(--color-text-secondary); margin-left: 8px">
                {{ formatFecha(asg.fecha) }}
              </span>
            </div>
            <div style="display: flex; gap: 6px; align-items: center">
              <span
                v-if="asg.cumplePrincipal1"
                class="badge badge-green"
                style="font-size: 10px"
              >
                👑 Mínimo P1 OK
              </span>
              <span
                v-else
                class="badge badge-amber"
                style="font-size: 10px"
              >
                ⚠️ Sin Principal 1 o sup.
              </span>
              <span
                class="badge"
                :class="asg.cantidadAsistentes <= 1 ? 'badge-blue' : 'badge-red'"
                style="font-size: 10px"
              >
                👤 {{ asg.cantidadAsistentes }} Asistente{{ asg.cantidadAsistentes === 1 ? '' : 's' }}
              </span>
            </div>
          </div>

          <!-- Árbitros designados -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px">
            <div
              v-for="item in asg.arbitros"
              :key="item.arbitro?.idArbitro"
              style="
                background: var(--color-background-secondary);
                border: 1px solid var(--color-border-tertiary);
                border-radius: 6px;
                padding: 4px 8px;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <i
                v-if="isPrincipal1(item.arbitro)"
                class="ti ti-crown"
                style="color: #f59e0b"
                title="Principal 1"
              ></i>
              <i
                v-else-if="isAsistente(item.arbitro)"
                class="ti ti-flag"
                style="color: #3b82f6"
                title="Asistente"
              ></i>
              <i
                v-else
                class="ti ti-user"
                style="color: #10b981"
              ></i>
              <strong style="color: var(--color-text-primary)">
                {{ item.arbitro?.nombre }} {{ item.arbitro?.apellido }}
              </strong>
              <span
                class="badge"
                :class="getCategoryBadgeClass(item.arbitro?.categoria)"
                style="font-size: 9px; padding: 1px 4px"
              >
                {{ getCategoryLabel(item.arbitro?.categoria) }}
              </span>
              <span style="font-size: 10px; color: var(--color-text-secondary)">
                ({{ item.arbitro?.designaciones || 0 }} part.)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div
      class="modal-footer"
      style="
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid var(--color-border-tertiary);
        padding-top: 0.75rem;
        margin-top: 0;
      "
    >
      <button class="btn" @click="closeModal" :disabled="saving">
        Cancelar
      </button>
      <button
        v-if="previewCalculated"
        class="btn primary"
        @click="confirmarYAplicar"
        :disabled="saving || Object.keys(previewResults).length === 0"
        style="background: #10b981; border-color: #059669; display: flex; align-items: center; gap: 6px"
      >
        <i v-if="saving" class="ti ti-loader" style="animation: spin 1s linear infinite"></i>
        <i v-else class="ti ti-check"></i>
        <span>{{ saving ? "Guardando..." : "Confirmar y Guardar Asignaciones" }}</span>
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
  minArbitros,
  formatFecha,
  getDayOfWeekLocal,
  loadArbitros,
  asignarLoteDesignacionesAutomaticas,
} from "../store";
import {
  ejecutarAsignacionAutomatica,
  isPrincipal1,
  isAsistente,
} from "../services/asignacionAutomaticaService";
import {
  getCategoryLabel,
  getCategoryBadgeClass,
} from "../composables/useArbitroStatsFormatters";

const loading = ref(false);
const saving = ref(false);
const previewCalculated = ref(false);
const previewResults = ref({});
const warnings = ref([]);
const selectedIds = ref([]);

const incompleteList = computed(() => state.designacionesIncompletas || []);

const isAllSelected = computed(
  () =>
    incompleteList.value.length > 0 &&
    selectedIds.value.length === incompleteList.value.length,
);

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = incompleteList.value.map(
      (d) => d.idDesignacion || d.id,
    );
  }
};

onMounted(async () => {
  if (!state.arbitros || state.arbitros.length === 0) {
    await loadArbitros();
  }
  // Por defecto seleccionar todas las pendientes
  selectedIds.value = incompleteList.value.map(
    (d) => d.idDesignacion || d.id,
  );
});

const getCanchaName = (d) => {
  const cid = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
  const c = getCancha(Number(cid)) || d.cancha;
  return d.cancha?.nombreCancha || c?.nombre || c?.nombreCancha || "Cancha";
};

const getDayLabel = (fechaStr) => {
  const day = getDayOfWeekLocal(fechaStr);
  if (day === 6) return "Sábado";
  if (day === 0) return "Domingo";
  return "Semana";
};

const getDayBadgeClass = (fechaStr) => {
  const day = getDayOfWeekLocal(fechaStr);
  if (day === 6) return "badge-blue";
  if (day === 0) return "badge-amber";
  return "badge-gray";
};

const calcularAsignaciones = async () => {
  loading.value = true;
  warnings.value = [];
  try {
    const targets = incompleteList.value.filter((d) =>
      selectedIds.value.includes(d.idDesignacion || d.id),
    );

    const res = ejecutarAsignacionAutomatica(targets);
    previewResults.value = res.asignacionesPorDesignacion;
    warnings.value = res.advertencias || [];
    previewCalculated.value = true;
  } catch (err) {
    console.error("Error al calcular asignaciones:", err);
    alert("Error al calcular asignaciones automáticas.");
  } finally {
    loading.value = false;
  }
};

const recalcular = () => {
  previewCalculated.value = false;
  calcularAsignaciones();
};

const confirmarYAplicar = async () => {
  saving.value = true;
  try {
    const targets = incompleteList.value.filter((d) =>
      selectedIds.value.includes(d.idDesignacion || d.id),
    );

    await asignarLoteDesignacionesAutomaticas(targets);

    closeModal();
    alert(
      "¡Asignaciones generadas en frontend! Han quedado en 'Pendientes de Aceptar (Completadas)' para que las revises. Luego puedes hacer clic en 'Aceptar' para enviarlas al backend.",
    );
  } catch (err) {
    console.error("Error al confirmar asignaciones:", err);
    alert("Hubo un error al guardar las asignaciones.");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.badge-purple {
  background: #f3e8ff;
  color: #7e22ce;
}
</style>

