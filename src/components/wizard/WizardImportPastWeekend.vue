<template>
  <div>
    <div class="modal-title" style="margin-bottom: 6px">
      Importar designaciones
    </div>
    <div
      style="
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
        line-height: 1.4;
      "
    >
      Detecta y clona las designaciones que fueron
      <strong>finalizadas</strong> el fin de semana pasado, adelantando sus
      fechas exactamente 7 días.
    </div>

    <!-- Cargando -->
    <div v-if="loadingImport" style="text-align: center; padding: 2rem 0">
      <i
        class="ti ti-loader"
        style="
          font-size: 28px;
          color: #1d9e75;
          animation: spin 1s linear infinite;
          display: inline-block;
        "
      ></i>
      <div
        style="
          margin-top: 0.75rem;
          color: var(--color-text-secondary);
          font-size: 12px;
        "
      >
        Buscando designaciones finalizadas...
      </div>
    </div>

    <!-- Alerta Error -->
    <div v-else-if="importError" class="alert alert-warning">
      <i class="ti ti-alert-triangle"></i>
      {{ importError }}
    </div>

    <!-- Sin resultados -->
    <div
      v-else-if="pastDesignations.length === 0"
      class="empty-state"
      style="padding: 1.5rem 0"
    >
      <div class="empty-icon" style="font-size: 32px; margin-bottom: 8px">
        📋
      </div>
      <div style="font-weight: 500; font-size: 13px">
        No hay designaciones finalizadas
      </div>
      <div
        style="
          font-size: 11px;
          margin-top: 6px;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.4;
        "
      >
        No se encontraron designaciones finalizadas del fin de semana pasado
        ({{ formatFechaSimple(lastWeekend.saturday) }} al
        {{ formatFechaSimple(lastWeekend.sunday) }}).
      </div>
    </div>

    <!-- Listado y Selección -->
    <div v-else>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 12px;
          color: var(--color-text-secondary);
        "
      >
        <label
          class="checkbox-label"
          style="margin: 0; display: flex; align-items: center; gap: 8px"
        >
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
          />
          <span>Seleccionar todas ({{ pastDesignations.length }})</span>
        </label>
      </div>

      <div
        style="
          max-height: 260px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 1.25rem;
          padding-right: 4px;
        "
      >
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
            transition:
              border-color 0.2s,
              background 0.2s;
            cursor: pointer;
          "
          :style="{
            borderColor: selectedIds.includes(d.idDesignacion || d.id)
              ? '#1d9e75'
              : 'var(--color-border-tertiary)',
            background: selectedIds.includes(d.idDesignacion || d.id)
              ? '#f4fbf9'
              : 'var(--color-background-secondary)',
          }"
          @click="toggleItem(d.idDesignacion || d.id)"
        >
          <input
            type="checkbox"
            style="margin-top: 3px"
            :value="d.idDesignacion || d.id"
            v-model="selectedIds"
            @click.stop
          />
          <div style="flex: 1; min-width: 0">
            <div
              style="
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
                color: var(--color-text-primary);
              "
            >
              🏟️
              {{
                d.cancha?.nombreCancha ||
                getCancha(d.idCancha || d.canchaId)?.nombre ||
                "Cancha Desconocida"
              }}
            </div>
            <div
              style="
                font-size: 11px;
                color: var(--color-text-secondary);
                margin-top: 3px;
                display: flex;
                align-items: center;
                gap: 4px;
              "
            >
              <span>Original:</span>
              <span style="text-decoration: line-through">{{
                formatFechaCorto(d.fecha)
              }}</span>
            </div>
            <div
              style="
                font-size: 11px;
                color: #0f6e56;
                font-weight: 600;
                margin-top: 2px;
                display: flex;
                align-items: center;
                gap: 4px;
              "
            >
              <span>Nueva fecha:</span>
              <span>{{ formatFechaCorto(getNewDate(d.fecha)) }}</span>
            </div>
            <div
              style="
                font-size: 10px;
                color: var(--color-text-secondary);
                margin-top: 6px;
                display: flex;
                gap: 10px;
              "
            >
              <span
                style="
                  background: #e2e8f0;
                  padding: 1px 6px;
                  border-radius: 4px;
                "
                >⚽ {{ d.cantidadPartidos }} partidos</span
              >
              <span
                style="
                  background: #e2e8f0;
                  padding: 1px 6px;
                  border-radius: 4px;
                "
                >🏆 {{ d.etapaCampeonato || "FECHA_NORMAL" }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" @click="closeModal" :disabled="cloning">
          Cancelar
        </button>
        <button
          class="btn primary"
          @click="handleImport"
          :disabled="selectedIds.length === 0 || cloning"
        >
          <i
            v-if="cloning"
            class="ti ti-loader"
            style="animation: spin 1s linear infinite; display: inline-block"
          ></i>
          <i v-else class="ti ti-download"></i>
          {{
            cloning
              ? "Clonando..."
              : `Importar seleccionadas (${selectedIds.length})`
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { closeModal, getCancha, clonarDesignaciones } from "../../store";
import designacionService from "../../services/designacionService";

const loadingImport = ref(false);
const importError = ref("");
const pastDesignations = ref([]);
const selectedIds = ref([]);
const cloning = ref(false);
const lastWeekend = ref({ saturday: "", sunday: "" });

const calculateLastWeekend = () => {
  const referenceDate = new Date();
  const day = referenceDate.getDay();
  const daysToSaturday = day + 1;

  const satDate = new Date(referenceDate);
  satDate.setDate(referenceDate.getDate() - daysToSaturday);

  const sunDate = new Date(satDate);
  sunDate.setDate(satDate.getDate() + 1);

  const formatLocal = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  lastWeekend.value = {
    saturday: formatLocal(satDate),
    sunday: formatLocal(sunDate),
  };
};

const fetchPastDesignations = async () => {
  loadingImport.value = true;
  importError.value = "";
  calculateLastWeekend();

  try {
    const data = await designacionService.buscarPorRango(
      lastWeekend.value.saturday,
      lastWeekend.value.sunday,
    );

    pastDesignations.value = (data || []).filter(
      (d) => d.estadoDesignacion === 2,
    );

    selectedIds.value = pastDesignations.value.map(
      (d) => d.idDesignacion || d.id,
    );
  } catch (e) {
    console.error("Error al cargar designaciones del fin de semana pasado:", e);
    importError.value =
      "No se pudieron obtener las designaciones del fin de semana pasado.";
  } finally {
    loadingImport.value = false;
  }
};

const isAllSelected = computed(() => {
  return (
    pastDesignations.value.length > 0 &&
    selectedIds.value.length === pastDesignations.value.length
  );
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = pastDesignations.value.map(
      (d) => d.idDesignacion || d.id,
    );
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
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.warn(e);
  }
  return fechaStr;
};

const handleImport = async () => {
  cloning.value = true;
  try {
    const toClone = pastDesignations.value.filter((d) =>
      selectedIds.value.includes(d.idDesignacion || d.id),
    );
    await clonarDesignaciones(toClone);
    closeModal();
  } catch (e) {
    console.error(e);
  } finally {
    cloning.value = false;
  }
};

onMounted(() => {
  fetchPastDesignations();
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

