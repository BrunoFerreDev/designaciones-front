<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Registrar Designaciones Históricas</div>
        <div class="topbar-sub">Registra partidos de fechas pasadas y asigna sus árbitros</div>
      </div>
    </div>

    <div class="content animate-fade-in">
      <!-- Paso 1: Seleccionar Fecha -->
      <div class="card" style="margin-bottom: 2rem; max-width: 800px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-weight: 600; font-size: 14px;">1. Seleccionar Fecha de los Partidos</label>
          <input
            type="date"
            v-model="fecha"
            class="form-input"
            style="max-width: 300px;"
            @change="fetchDesignacionesPorFecha(false)"
          />
        </div>
      </div>

      <!-- Paso 2: Canchas a Designar -->
      <div v-if="fecha" class="card animate-fade-in" style="margin-bottom: 2rem;">
        <div class="form-label" style="font-weight: 600; font-size: 15px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>2. Canchas Designadas</span>
            <span style="font-size: 12px; font-weight: normal; color: var(--color-text-secondary);">(Selecciona y configura cada una)</span>
          </div>
          <div style="font-size: 13px; font-weight: normal; display: flex; gap: 10px;">
            <button type="button" class="btn-link" @click="selectAllCanchas" style="background: none; border: none; color: var(--color-primary); cursor: pointer; font-size: 12px; text-decoration: underline;">
              Seleccionar todas
            </button>
            <span style="color: var(--color-border-primary);">|</span>
            <button type="button" class="btn-link" @click="deselectAllCanchas" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; text-decoration: underline;">
              Limpiar selección
            </button>
          </div>
        </div>

        <!-- Canchas Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 1.5rem;">
          <div
            v-for="cancha in state.canchas"
            :key="cancha.id"
            style="border: 1.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 14px; background: var(--color-background-primary); transition: all 0.2s;"
            :style="selectedCanchas[cancha.id] ? 'border-color: var(--color-primary); background: #f4fbf9; box-shadow: 0 4px 12px rgba(29, 158, 117, 0.05);' : ''"
          >
            <!-- Checkbox de la Cancha -->
            <label class="checkbox-label" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; margin: 0; user-select: none;">
              <input
                type="checkbox"
                v-model="selectedCanchas[cancha.id]"
                style="margin-top: 3px; cursor: pointer;"
              />
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 14px; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  🏟️ {{ cancha.nombre }}
                </div>
                <div style="font-size: 12px; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ cancha.ciudad || 'Sin ciudad' }} · {{ cancha.categoria || 'Sin categoría' }}
                </div>
              </div>
            </label>

            <!-- Configuración local (solo si está seleccionada) -->
            <div v-if="selectedCanchas[cancha.id] && canchaConfigs[cancha.id]" class="animate-fade-in" style="margin-top: 12px; border-top: 1px dashed var(--color-border-primary); padding-top: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Hora de Inicio</label>
                <input
                  type="time"
                  v-model="canchaConfigs[cancha.id].hora"
                  class="form-input"
                  style="font-size: 12px; padding: 4px 8px; height: 32px;"
                  required
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Cantidad de Partidos</label>
                <input
                  type="number"
                  v-model.number="canchaConfigs[cancha.id].cantidadPartidos"
                  min="1"
                  max="20"
                  class="form-input"
                  style="font-size: 12px; padding: 4px 8px; height: 32px;"
                  required
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Etapa</label>
                <select
                  v-model="canchaConfigs[cancha.id].etapaCampeonato"
                  class="form-input"
                  style="font-size: 12px; padding: 4px 8px; height: 32px;"
                >
                  <option value="FECHA_NORMAL">Fecha normal</option>
                  <option value="FECHA_PICANTE">Fecha picante</option>
                  <option value="CLASIFICACION">Clasificación</option>
                  <option value="CRUCES">Cruces</option>
                  <option value="SEMIFINAL">Semifinales</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de Registro -->
        <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--color-border-tertiary); padding-top: 1.25rem;">
          <button
            class="btn primary"
            @click="registrarDesignaciones"
            :disabled="!anyCanchaSelected || registering"
            style="gap: 8px; display: flex; align-items: center;"
          >
            <i v-if="registering" class="ti ti-loader" style="animation: spin 1s linear infinite;"></i>
            <i v-else class="ti ti-check"></i>
            <span>{{ registering ? 'Registrando...' : `Registrar Designaciones (${selectedCount})` }}</span>
          </button>
        </div>
      </div>

      <!-- Listado de Designaciones Existentes para la fecha -->
      <div v-if="fecha" class="animate-fade-in">
        <div class="section-header" style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <span class="section-title" style="display: flex; align-items: center; gap: 8px;">
            📋 Designaciones Registradas para esta fecha: {{ formatFechaLocal(fecha) }}
          </span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button
              v-if="designacionesExistentes.length > 0"
              class="btn"
              @click="openModal('arbitrosPorDia', null, designacionesExistentes)"
              style="border-color: #3b82f6; color: #3b82f6; background: transparent; padding: 5px 12px; font-size: 12px; display: flex; align-items: center; gap: 4px;"
              onmouseover="this.style.background = '#f0f7ff'"
              onmouseout="this.style.background = 'transparent'"
            >
              <i class="ti ti-calendar-event"></i> Resumen árbitros
            </button>
            <button
              class="btn"
              @click="fetchDesignacionesPorFecha(true)"
              :disabled="loadingList"
              style="padding: 5px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;"
            >
              <i class="ti ti-refresh" :class="{ 'spin-anim': loadingList }"></i>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        <!-- Cargando lista -->
        <div v-if="loadingList && designacionesExistentes.length === 0" style="text-align: center; padding: 3rem 1rem;">
          <i class="ti ti-loader" style="font-size: 36px; color: var(--color-primary); animation: spin 1s linear infinite; display: inline-block;"></i>
          <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 14px;">Obteniendo designaciones...</div>
        </div>

        <!-- Lista vacía -->
        <div v-else-if="designacionesExistentes.length === 0" class="empty-state" style="padding: 2.5rem 1rem;">
          <div class="empty-icon" style="font-size: 40px; margin-bottom: 12px;">📅</div>
          <div style="font-size: 15px; font-weight: 500;">No hay designaciones registradas para este día</div>
          <div style="margin-top: 0.5rem; max-width: 400px; margin-left: auto; margin-right: auto; color: var(--color-text-secondary); line-height: 1.4;">
            Selecciona las canchas y configúralas arriba, luego presiona "Registrar" para crearlas y designar sus árbitros.
          </div>
        </div>

        <!-- Grid de Tarjetas -->
        <div v-else class="grid-2">
          <DesignacionCard
            v-for="d in designacionesExistentes"
            :key="d.idDesignacion || d.id"
            :designacion="d"
            :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
            show-empty-arbitros-state
            :tipo="0"
            @action-complete="fetchDesignacionesPorFecha(true)"
            @assigned-auto="onAssignedAuto"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { state, loadCanchas, loadArbitros, loadArbitrosDesignados, openModal } from "../store";
import designacionService from "../services/designacionService";
import DesignacionCard from "../components/DesignacionCard.vue";

// Campos reactivos
const fecha = ref("");
const selectedCanchas = ref({});
const canchaConfigs = ref({});
const registering = ref(false);

const loadingList = ref(false);
const designacionesExistentes = ref([]);
const arbitrosDesignados = ref({});

// Al montar, cargar datos principales del store
onMounted(async () => {
  if (state.canchas.length === 0) {
    await loadCanchas();
  }
  if (state.arbitros.length === 0) {
    await loadArbitros();
  }
  initializeConfigs();
});

// Inicializar configuraciones de canchas
const initializeConfigs = () => {
  state.canchas.forEach((c) => {
    if (!canchaConfigs.value[c.id]) {
      canchaConfigs.value[c.id] = {
        hora: "08:00",
        cantidadPartidos: 1,
        etapaCampeonato: "FECHA_NORMAL",
      };
    }
  });
};

// Observar canchas para inicializar configuraciones cuando carguen
watch(() => state.canchas, () => {
  initializeConfigs();
}, { deep: true });

// Computeds
const anyCanchaSelected = computed(() => {
  return Object.values(selectedCanchas.value).some((v) => v === true);
});

const selectedCount = computed(() => {
  return Object.values(selectedCanchas.value).filter((v) => v === true).length;
});

// Selección global
const selectAllCanchas = () => {
  state.canchas.forEach((c) => {
    selectedCanchas.value[c.id] = true;
  });
};

const deselectAllCanchas = () => {
  selectedCanchas.value = {};
};

// Registrar designaciones
const registrarDesignaciones = async () => {
  if (!fecha.value) return;
  registering.value = true;

  try {
    const promises = [];
    for (const canchaId of Object.keys(selectedCanchas.value)) {
      if (selectedCanchas.value[canchaId]) {
        const config = canchaConfigs.value[canchaId];
        const formattedFecha = `${fecha.value}T${config.hora}:00`;

        const dto = {
          idCancha: parseInt(canchaId),
          fecha: formattedFecha,
          cantidadPartidos: config.cantidadPartidos || 1,
          etapaCampeonato: config.etapaCampeonato || "FECHA_NORMAL",
        };

        promises.push(designacionService.createDesignacion(dto));
      }
    }

    await Promise.all(promises);
    alert("¡Designaciones registradas exitosamente!");
    
    // Limpiar selección de canchas
    selectedCanchas.value = {};
    
    // Actualizar listado de designaciones para esta fecha
    await fetchDesignacionesPorFecha(false);
  } catch (error) {
    console.error("Error al registrar designaciones:", error);
    alert("Ocurrió un error al registrar las designaciones. Revisa los detalles en consola.");
  } finally {
    registering.value = false;
  }
};

// Obtener designaciones del backend
const fetchDesignacionesPorFecha = async (silent = false) => {
  if (!fecha.value) {
    designacionesExistentes.value = [];
    return;
  }

  if (!silent) {
    loadingList.value = true;
  }

  try {
    const res = await designacionService.buscarPorFecha(fecha.value);
    designacionesExistentes.value = res || [];

    // Cargar árbitros asignados de cada designación
    for (const d of designacionesExistentes.value) {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        arbitrosDesignados.value[id] = d.arbitrosDesignados;
      } else {
        const arbs = await loadArbitrosDesignados(id);
        arbitrosDesignados.value[id] = arbs || [];
      }
    }
  } catch (e) {
    console.error("Error al buscar designaciones por fecha:", e);
  } finally {
    loadingList.value = false;
  }
};

// Formateador de fecha
const formatFechaLocal = (fechaStr) => {
  if (!fechaStr) return "";
  const parts = fechaStr.split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  }
  return fechaStr;
};

// Recargar al cerrar modal de árbitros
watch(
  () => state.modal,
  async (newModal, oldModal) => {
    if (oldModal && !newModal && fecha.value) {
      await fetchDesignacionesPorFecha(true);
    }
  }
);

const onAssignedAuto = (id) => {
  if (id) {
    arbitrosDesignados.value[id] = state.arbitrosDesignadosMap[id] || [];
  }
};
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
.ti-loader {
  display: inline-block;
}
.spin-anim {
  animation: spin 1s linear infinite;
  display: inline-block;
}
</style>
