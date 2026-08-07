<template>
  <div class="modal-content animate-fade-in" style="max-height: 85vh; display: flex; flex-direction: column; gap: 1rem;">
    <!-- Title -->
    <div>
      <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px;">
        {{ modalTitle }}
      </h3>
      <div style="font-size: 12px; color: var(--color-text-secondary)">
        {{ modalSubtitle }}
      </div>
    </div>

    <!-- Main Container Grid -->
    <div class="edit-grid" style="display: flex; gap: 1.5rem; flex: 1; overflow-y: auto; padding-right: 4px; margin-top: 0.5rem;">
      
      <!-- Left Column: Designation parameters -->
      <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem; min-width: 280px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--color-text-secondary); border-bottom: 1.5px solid var(--color-border-tertiary); padding-bottom: 4px; margin-bottom: 4px;">
          🏟️ Parámetros del Partido
        </div>

        <!-- Selector de Cancha -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Cancha (🏟️)</label>
          <select v-model.number="state.form.canchaId" class="form-input" :disabled="isSaving">
            <option value="" disabled>Seleccionar cancha...</option>
            <option v-for="c in selectableCanchas" :key="c.id" :value="c.id">
              {{ c.nombre || c.nombreCancha }} ({{ c.ciudad || 'Sin ciudad' }})
            </option>
          </select>
        </div>

        <!-- Fecha y Hora -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Fecha y hora (📅)</label>
          <input v-model="state.form.fecha" class="form-input" type="datetime-local" :disabled="isSaving" />
        </div>

        <!-- Etapa de Campeonato -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Etapa del campeonato (🏆)</label>
          <select v-model="state.form.etapaCampeonato" class="form-input" :disabled="isSaving">
            <option value="FECHA_NORMAL">Fecha normal</option>
            <option value="FECHA_PICANTE">Fecha picante</option>
            <option value="CLASIFICACION">Clasificación</option>
            <option value="CRUCES">Cruces</option>
            <option value="SEMIFINAL">Semifinales</option>
            <option value="FINAL">Final</option>
          </select>
        </div>

        <!-- Cantidad de Partidos -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Cantidad de partidos a jugar (⚽)</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input
              v-model.number="state.form.cantidadPartidos"
              class="num-input"
              type="number"
              min="1"
              max="20"
              style="width: 80px; padding: 8px; border: 1.5px solid var(--color-border-tertiary); border-radius: 8px;"
              :disabled="isSaving"
            />
            <span style="font-size: 13px; color: var(--color-text-secondary)">partidos</span>
          </div>
        </div>

        <!-- Detalle de la designacion -->
        <div class="form-group" style="margin-bottom: 0; flex: 1; display: flex; flex-direction: column;">
          <label class="form-label">Detalle / Observaciones (💬)</label>
          <textarea
            v-model="state.form.detalle"
            class="form-input"
            rows="3"
            placeholder="Escribe alguna observación o comentario de la designación..."
            style="resize: none; flex: 1; min-height: 80px;"
            :disabled="isSaving"
          ></textarea>
        </div>
      </div>

      <!-- Right Column: Assigned Referees parameters -->
      <div style="flex: 1.2; display: flex; flex-direction: column; gap: 1rem; min-width: 320px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--color-text-secondary); border-bottom: 1.5px solid var(--color-border-tertiary); padding-bottom: 4px; margin-bottom: 4px;">
          👥 Árbitros Asignados ({{ assignedReferees.length }})
        </div>

        <!-- Arancel General por Árbitro -->
        <div v-if="!loadingReferees && assignedReferees.length > 0" class="form-group" style="margin-bottom: 0.5rem;">
          <label class="form-label">💰 Arancel por Árbitro ($)</label>
          <input
            type="number"
            v-model.number="montoGeneral"
            class="form-input"
            style="height: 38px;"
            step="0.01"
            min="0"
            placeholder="0.00"
            :disabled="isSaving"
          />
        </div>

        <!-- Loader if referees are fetching -->
        <div v-if="loadingReferees" style="text-align: center; padding: 3rem 0;">
          <i class="ti ti-loader spin" style="font-size: 24px; color: var(--color-primary); margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--color-text-secondary);">Cargando árbitros asignados...</div>
        </div>

        <!-- Empty Referees message -->
        <div v-else-if="assignedReferees.length === 0" style="padding: 2.5rem; text-align: center; border: 1.5px dashed var(--color-border-tertiary); border-radius: 12px; color: var(--color-text-secondary); font-size: 13px;">
          <i class="ti ti-users-off" style="font-size: 24px; display: block; margin-bottom: 8px; color: var(--color-text-secondary);"></i>
          No hay árbitros asignados a esta designación.
        </div>

        <!-- List of Referees Inputs -->
        <div v-else style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto; padding-right: 4px;">
          <div
            v-for="arb in assignedReferees"
            :key="arb.idDesignados || arb.id"
            class="card"
            style="padding: 10px 12px; background: var(--color-background-secondary); border-color: var(--color-border-primary); display: flex; flex-direction: column; gap: 8px;"
          >
            <!-- Referee name header -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
              <div style="font-weight: 600; font-size: 13px; color: var(--color-text-primary);">
                👤 {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
              </div>
              <span class="badge badge-gray text-[9px] px-1.5 py-0.5">
                {{ arb.arbitro?.rol || 'Árbitro' }}
              </span>
            </div>

            <!-- Parameters Inputs -->
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <!-- Partidos Dirigidos Input -->
              <div style="flex: 1; min-width: 120px;">
                <label style="font-size: 10px; font-weight: 600; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Partidos Dirigidos (Cantidad)</label>
                <input
                  type="number"
                  v-model.number="arb.partidosDirigidos"
                  class="form-input"
                  style="height: 32px; padding: 4px 8px; font-size: 12px;"
                  min="0"
                  max="20"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="modal-footer" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border-tertiary);">
      <button class="btn" @click="closeModal" :disabled="isSaving">Cancelar</button>
      <button
        class="btn primary"
        @click="handleSave"
        :disabled="isSaving || !state.form.canchaId || !state.form.fecha || !state.form.cantidadPartidos"
      >
        <i v-if="isSaving" class="ti ti-loader spin"></i>
        <span>{{ submitButtonLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  state,
  closeModal,
  updateDesignacion,
  loadArbitrosDesignados,
  reloadAllDesignaciones,
  addToast,
  finalizarDesignacionManual,
  cancelarDesignacionManual,
} from "../store";
import designadoService from "../services/designadoService";

const isSaving = ref(false);
const loadingReferees = ref(false);
const assignedReferees = ref([]);
const montoGeneral = ref(0);

const selectableCanchas = computed(() => {
  return state.canchas.filter((c) => c.estado !== false || c.id === state.form.canchaId);
});

const actionContext = computed(() => state.modal?.data?.action || "edit");

const modalTitle = computed(() => {
  if (actionContext.value === "finalizar") return "🏁 Finalizar Jornada";
  if (actionContext.value === "cancelar") return "🚫 Cancelar Jornada";
  if (actionContext.value === "suspender") return "⏸️ Suspender Jornada en Juego";
  return "📝 Editar Designación Completa";
});

const modalSubtitle = computed(() => {
  if (actionContext.value === "finalizar")
    return "Revisa los datos finales de los árbitros, sus aranceles y añade observaciones antes de finalizar la jornada.";
  if (actionContext.value === "cancelar")
    return "Especifica el motivo de la cancelación en el campo de observaciones y confirma para cancelar la jornada.";
  if (actionContext.value === "suspender")
    return "Especifica los detalles de la suspensión en juego en el campo de observaciones y confirma para suspender la jornada.";
  return "Modifica los parámetros de la designación, añade observaciones y configura los valores de cada árbitro.";
});

const submitButtonLabel = computed(() => {
  if (isSaving.value) return "Guardando...";
  if (actionContext.value === "finalizar") return "Finalizar Jornada";
  if (actionContext.value === "cancelar") return "Confirmar Cancelación";
  if (actionContext.value === "suspender") return "Confirmar Suspensión";
  return "Guardar cambios";
});

onMounted(async () => {
  const id = state.modal?.id;
  if (id) {
    loadingReferees.value = true;
    try {
      const refs = await loadArbitrosDesignados(id);
      // Hacemos una copia profunda para poder manipular los inputs sin mutar el store directamente hasta guardar
      assignedReferees.value = JSON.parse(JSON.stringify(refs || []));
      
      // Inicializar el monto general basándonos en el arancel existente de algún árbitro designado
      const firstWithFee = refs.find(r => r.montoPercibido !== undefined && r.montoPercibido !== null && Number(r.montoPercibido) > 0);
      montoGeneral.value = firstWithFee ? Number(firstWithFee.montoPercibido) : 0;
    } catch (err) {
      console.error("Error al cargar árbitros para la edición:", err);
      addToast("Error al cargar los árbitros de la designación.", "error");
    } finally {
      loadingReferees.value = false;
    }
  }
});

const handleSave = async () => {
  const idDesignacion = state.modal?.id;
  if (!idDesignacion) return;

  isSaving.value = true;
  try {
    if (actionContext.value === "finalizar") {
      state.form.editable = false;
      state.form.estadoDesignacion = 2;
    } else if (actionContext.value === "cancelar") {
      state.form.estadoDesignacion = 3;
    } else if (actionContext.value === "suspender") {
      state.form.estadoDesignacion = 4;
    }
    // 1. Guardar los datos generales de la designación (incluye el detalle/observaciones)
    await updateDesignacion();

    // 2. Guardar los cambios individuales en los árbitros asignados (partidos y arancel general)
    const promises = [];
    
    // Actualizar el monto general para todos los designados en una única llamada
    const monto = montoGeneral.value !== undefined && montoGeneral.value !== null ? Number(montoGeneral.value) : 0;
    promises.push(
      designadoService.actualizarMontoATodos(idDesignacion, monto)
    );

    // Actualizar la cantidad de partidos para cada designado individualmente
    assignedReferees.value.forEach((arb) => {
      const idDesignado = arb.idDesignados || arb.idDesignado || arb.id;
      const partidos = arb.partidosDirigidos !== undefined && arb.partidosDirigidos !== null ? Number(arb.partidosDirigidos) : 0;
      promises.push(
        designadoService.actualizarCantidadPartidos(idDesignacion, idDesignado, partidos)
          .catch((err) => {
            console.warn(`Fallo temporal al actualizar partidos dirigidos para el designado ${idDesignado}:`, err);
            return { success: false, error: err };
          })
      );
    });

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    // 3. Ejecutar acción de transición de estado si aplica (finalizar / cancelar / suspender)
    if (actionContext.value === "finalizar") {
      await finalizarDesignacionManual(idDesignacion);
    } else if (actionContext.value === "cancelar") {
      const detalleObs = state.form.detalle || "";
      await cancelarDesignacionManual(idDesignacion, detalleObs);
    } else if (actionContext.value === "suspender") {
      addToast("Designación suspendida en juego con éxito.");
      await reloadAllDesignaciones();
    } else {
      addToast("Designación y árbitros actualizados con éxito.");
      await reloadAllDesignaciones();
    }
    
    closeModal();
  } catch (err) {
    console.error("Error al guardar la designación y árbitros:", err);
    addToast("Ocurrió un error al guardar los cambios.", "error");
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
@media (max-width: 768px) {
  .edit-grid {
    flex-direction: column !important;
  }
}
</style>
