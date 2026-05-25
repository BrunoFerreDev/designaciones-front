<template>
  <div class="modal-content">
    <!-- Selector de Pestaña -->
    <div class="tab-row" style="margin-bottom: 1.25rem;">
      <button
        :class="['tab-btn', { active: activeTab === 'manual' }]"
        @click="activeTab = 'manual'"
      >
        <i class="ti ti-plus" style="margin-right: 6px;"></i>Nueva individual
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'import' }]"
        @click="activeTab = 'import'"
      >
        <i class="ti ti-history" style="margin-right: 6px;"></i>Fin de semana pasado
      </button>
    </div>

    <!-- Flujo Manual -->
    <template v-if="activeTab === 'manual'">
      <!-- Paso 1: Seleccionar Cancha -->
      <template v-if="currentStep === 1">
        <div class="modal-title">Nueva designación - Paso 1 de 2</div>
        <div
          style="
            font-size: 13px;
            color: var(--color-text-secondary);
            margin-bottom: 16px;
          "
        >
          Selecciona la cancha para crear la designación
        </div>

        <div class="form-group">
          <label class="form-label">Cancha (solo habilitadas)</label>
          <select v-model.number="state.form.canchaId" class="form-input">
            <option value="" disabled>Seleccionar cancha...</option>
            <option v-for="c in cancelHabilitadas" :key="c.id" :value="c.id">
              {{ c.nombre }} ({{ c.ciudad }})
            </option>
          </select>
          <div
            v-if="selectedCanchaObj"
            style="
              font-size: 12px;
              background: #e1f5ee;
              color: #0f6e56;
              border-radius: 6px;
              padding: 6px 10px;
              margin-top: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <i class="ti ti-info-circle"></i>
            <div>
              <strong>{{ selectedCanchaObj.nombre }}</strong>
              <div style="font-size: 11px; margin-top: 2px">
                Categoría: {{ selectedCanchaObj.categoria }} · Fuera de juego:
                {{ selectedCanchaObj.fueraDeJuego ? "Sí" : "No" }} · Estado:
                {{ selectedCanchaObj.estado }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn" @click="closeModal">Cancelar</button>
          <button
            class="btn primary"
            @click="nextStep"
            :disabled="!state.form.canchaId"
          >
            Siguiente
          </button>
        </div>
      </template>

      <!-- Paso 2: Fecha, cantidad de partidos -->
      <template v-if="currentStep === 2">
        <div class="modal-title">Nueva designación - Paso 2 de 2</div>
        <div
          style="
            font-size: 13px;
            color: var(--color-text-secondary);
            margin-bottom: 16px;
          "
        >
          Define la fecha, cantidad de partidos y confirma para crear la
          designación
        </div>

        <div class="form-group">
          <label class="form-label">Cancha seleccionada</label>
          <div
            style="
              padding: 10px;
              background: #f5f5f5;
              border-radius: 6px;
              font-size: 14px;
            "
          >
            🏟️ {{ selectedCanchaObj.nombre }} - {{ selectedCanchaObj.ciudad }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Fecha y hora del partido</label>
          <input v-model="state.form.fecha" class="form-input" type="datetime-local" />
        </div>

        <div class="form-group">
          <div class="form-group">
            <label class="form-label">Etapa</label>
            <select
              v-model="state.form.etapaCampeonato"
              class="form-input"
              style="margin-top: 10px"
            >
              <option value="">Seleccionar etapa...</option>
              <option value="FECHA_NORMAL">Fecha normal</option>
              <option value="FECHA_PICANTE">Fecha picante</option>
              <option value="CLASIFICACION">Clasificación</option>
              <option value="CRUCES">Cruces</option>
              <option value="SEMIFINAL">Semifinales</option>
              <option value="FINAL">Final</option>
            </select>
          </div>

          <label class="form-label">Cantidad de partidos a jugar</label>
          <div class="partido-add-row">
            <input
              v-model.number="state.form.cantidadPartidos"
              class="num-input"
              type="number"
              min="1"
              max="20"
            />
            <span style="font-size: 13px; color: var(--color-text-secondary)">
              partidos
            </span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn" @click="previousStep">Atrás</button>
          <button
            class="btn primary"
            @click="saveDesignacionHandler"
            :disabled="!state.form.fecha || !state.form.cantidadPartidos"
          >
            Crear designación
          </button>
        </div>
      </template>
    </template>

    <!-- Flujo Importación (Fin de Semana Pasado) -->
    <template v-else-if="activeTab === 'import'">
      <div class="modal-title" style="margin-bottom: 6px;">Importar designaciones</div>
      <div
        style="
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 16px;
          line-height: 1.4;
        "
      >
        Detecta y clona las designaciones que fueron <strong>finalizadas</strong> el fin de semana pasado, adelantando sus fechas exactamente 7 días.
      </div>

      <!-- Cargando -->
      <div v-if="loadingImport" style="text-align: center; padding: 2rem 0;">
        <i class="ti ti-loader" style="font-size: 28px; color: #1d9e75; animation: spin 1s linear infinite; display: inline-block;"></i>
        <div style="margin-top: 0.75rem; color: var(--color-text-secondary); font-size: 12px;">
          Buscando designaciones finalizadas...
        </div>
      </div>

      <!-- Alerta Error -->
      <div v-else-if="importError" class="alert alert-warning">
        <i class="ti ti-alert-triangle"></i>
        {{ importError }}
      </div>

      <!-- Sin resultados -->
      <div v-else-if="pastDesignations.length === 0" class="empty-state" style="padding: 1.5rem 0;">
        <div class="empty-icon" style="font-size: 32px; margin-bottom: 8px;">📋</div>
        <div style="font-weight: 500; font-size: 13px;">No hay designaciones finalizadas</div>
        <div style="font-size: 11px; margin-top: 6px; max-width: 320px; margin-left: auto; margin-right: auto; line-height: 1.4;">
          No se encontraron designaciones finalizadas del fin de semana pasado ({{ formatFechaSimple(lastWeekend.saturday) }} al {{ formatFechaSimple(lastWeekend.sunday) }}).
        </div>
      </div>

      <!-- Listado y Selección -->
      <div v-else>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 12px; color: var(--color-text-secondary);">
          <label class="checkbox-label" style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            <span>Seleccionar todas ({{ pastDesignations.length }})</span>
          </label>
        </div>

        <div style="max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.25rem; padding-right: 4px;">
          <div
            v-for="d in pastDesignations"
            :key="d.idDesignacion || d.id"
            style="
              padding: 10px 12px;
              border: 1.5px solid var(--color-border-tertiary);
              border-radius: 10px;
              display: flex;
              gap: 10px;
              align-items: flex-start;
              background: var(--color-background-secondary);
              transition: border-color 0.2s, background 0.2s;
              cursor: pointer;
            "
            :style="{
              borderColor: selectedIds.includes(d.idDesignacion || d.id) ? '#1d9e75' : 'var(--color-border-tertiary)',
              background: selectedIds.includes(d.idDesignacion || d.id) ? '#f4fbf9' : 'var(--color-background-secondary)'
            }"
            @click="toggleItem(d.idDesignacion || d.id)"
          >
            <input
              type="checkbox"
              style="margin-top: 3px;"
              :value="d.idDesignacion || d.id"
              v-model="selectedIds"
              @click.stop
            />
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px; color: var(--color-text-primary);">
                🏟️ {{ d.cancha?.nombreCancha || getCancha(d.idCancha || d.canchaId)?.nombre || 'Cancha Desconocida' }}
              </div>
              <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 3px; display: flex; align-items: center; gap: 4px;">
                <span>Original:</span>
                <span style="text-decoration: line-through;">{{ formatFechaCorto(d.fecha) }}</span>
              </div>
              <div style="font-size: 11px; color: #0f6e56; font-weight: 600; margin-top: 2px; display: flex; align-items: center; gap: 4px;">
                <span>Nueva fecha:</span>
                <span>{{ formatFechaCorto(getNewDate(d.fecha)) }}</span>
              </div>
              <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 6px; display: flex; gap: 10px;">
                <span style="background: #e2e8f0; padding: 1px 6px; border-radius: 4px;">⚽ {{ d.cantidadPartidos }} partidos</span>
                <span style="background: #e2e8f0; padding: 1px 6px; border-radius: 4px;">🏆 {{ d.etapaCampeonato || 'FECHA_NORMAL' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn" @click="closeModal" :disabled="cloning">Cancelar</button>
          <button
            class="btn primary"
            @click="handleImport"
            :disabled="selectedIds.length === 0 || cloning"
          >
            <i v-if="cloning" class="ti ti-loader" style="animation: spin 1s linear infinite; display: inline-block;"></i>
            <i v-else class="ti ti-download"></i>
            {{ cloning ? 'Clonando...' : `Importar seleccionadas (${selectedIds.length})` }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  state,
  closeModal,
  saveDesignacion,
  minArbitros,
  getCancha,
  clonarDesignaciones,
} from "../store";
import designacionService from "../services/designacionService";

const currentStep = ref(1);
const activeTab = ref("manual");

const loadingImport = ref(false);
const importError = ref("");
const pastDesignations = ref([]);
const selectedIds = ref([]);
const cloning = ref(false);
const lastWeekend = ref({ saturday: "", sunday: "" });

const cancelHabilitadas = computed(() => state.canchas);

const selectedCanchaObj = computed(() =>
  state.form.canchaId ? getCancha(state.form.canchaId) : null,
);

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const saveDesignacionHandler = () => {
  saveDesignacion();
};

// Cálculo de fechas del fin de semana pasado
const calculateLastWeekend = () => {
  const referenceDate = new Date();
  const day = referenceDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToSaturday = day + 1;
  
  const satDate = new Date(referenceDate);
  satDate.setDate(referenceDate.getDate() - daysToSaturday);
  
  const sunDate = new Date(satDate);
  sunDate.setDate(satDate.getDate() + 1);
  
  lastWeekend.value = {
    saturday: satDate.toISOString().split("T")[0],
    sunday: sunDate.toISOString().split("T")[0]
  };
};

// Cargar designaciones del fin de semana pasado
const fetchPastDesignations = async () => {
  loadingImport.value = true;
  importError.value = "";
  calculateLastWeekend();
  
  try {
    const data = await designacionService.buscarPorRango(
      lastWeekend.value.saturday,
      lastWeekend.value.sunday
    );
    
    // Filtrar únicamente las que tienen estado 2 (Finalizada)
    pastDesignations.value = (data || []).filter(
      (d) => d.estadoDesignacion === 2
    );
    
    // Autoseleccionar todas por defecto
    selectedIds.value = pastDesignations.value.map((d) => d.idDesignacion || d.id);
  } catch (e) {
    console.error("Error al cargar designaciones del fin de semana pasado:", e);
    importError.value = "No se pudieron obtener las designaciones del fin de semana pasado.";
  } finally {
    loadingImport.value = false;
  }
};

// Observar cambio de pestaña para cargar datos
watch(activeTab, (newTab) => {
  if (newTab === "import" && pastDesignations.value.length === 0) {
    fetchPastDesignations();
  }
});

// Selección múltiple
const isAllSelected = computed(() => {
  return pastDesignations.value.length > 0 && selectedIds.value.length === pastDesignations.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = pastDesignations.value.map((d) => d.idDesignacion || d.id);
  }
};

const toggleItem = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

// Formateadores de fecha auxiliares
const formatFechaSimple = (fechaStr) => {
  if (!fechaStr) return "";
  const parts = fechaStr.split("-").map(Number);
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}`;
  }
  return fechaStr;
};

const formatFechaCorto = (fechaStr) => {
  if (!fechaStr) return "";
  try {
    if (fechaStr.includes("T")) {
      const [datePart, timePart] = fechaStr.split("T");
      const [yyyy, mm, dd] = datePart.split("-").map(Number);
      const [hh, min] = timePart.split(":").map(Number);
      
      const hhStr = String(hh).padStart(2, "0");
      const minStr = String(min).padStart(2, "0");
      const timeStr = min === 0 ? `${hhStr}hs` : `${hhStr}:${minStr}hs`;
      
      const dateObj = new Date(yyyy, mm - 1, dd);
      const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const nombreDia = dias[dateObj.getDay()];
      
      return `${nombreDia} ${dd}/${mm} ${timeStr}`;
    }
  } catch (e) {
    console.warn(e);
  }
  return fechaStr;
};

const getNewDate = (fechaStr) => {
  if (!fechaStr) return "";
  try {
    const dateObj = new Date(fechaStr);
    dateObj.setDate(dateObj.getDate() + 7);
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.warn(e);
  }
  return fechaStr;
};

// Acción para importar
const handleImport = async () => {
  cloning.value = true;
  try {
    const toClone = pastDesignations.value.filter((d) =>
      selectedIds.value.includes(d.idDesignacion || d.id)
    );
    await clonarDesignaciones(toClone);
    closeModal();
  } catch (e) {
    console.error(e);
  } finally {
    cloning.value = false;
  }
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
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
