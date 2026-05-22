<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Buscador de Designaciones</div>
        <div class="topbar-sub">Encuentra y gestiona designaciones por fecha o rango</div>
      </div>
    </div>

    <div class="content">
      <!-- Selector de Modo de Búsqueda -->
      <div class="tab-row" style="max-width: 500px; margin-bottom: 1.5rem;">
        <button
          :class="['tab-btn', { active: searchMode === 'single' }]"
          @click="searchMode = 'single'"
        >
          <i class="ti ti-calendar" style="margin-right: 6px;"></i>Fecha Única
        </button>
        <button
          :class="['tab-btn', { active: searchMode === 'range' }]"
          @click="searchMode = 'range'"
        >
          <i class="ti ti-calendar-event" style="margin-right: 6px;"></i>Rango de Fechas
        </button>
      </div>

      <!-- Formulario de Búsqueda -->
      <div class="card" style="margin-bottom: 2rem; max-width: 800px;">
        <form @submit.prevent="ejecutarBusqueda">
          <div class="filters-grid" style="align-items: center; gap: 16px;">
            <!-- Modo Fecha Única -->
            <div v-if="searchMode === 'single'" class="form-group" style="margin-bottom: 0; flex: 1;">
              <label class="form-label">Seleccionar Fecha</label>
              <input
                type="date"
                v-model="fechaSingle"
                class="form-input"
                required
              />
            </div>

            <!-- Modo Rango de Fechas -->
            <div v-else style="display: flex; gap: 16px; flex: 1; width: 100%; flex-wrap: wrap;">
              <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 150px;">
                <label class="form-label">Fecha Desde (Inicio)</label>
                <input
                  type="date"
                  v-model="fechaInicio"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 150px;">
                <label class="form-label">Fecha Hasta (Fin)</label>
                <input
                  type="date"
                  v-model="fechaFin"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <!-- Botón Buscar -->
            <div style="margin-top: 18px;">
              <button type="submit" class="btn primary" :disabled="loading" style="width: 100%; height: 38px;">
                <i v-if="loading" class="ti ti-loader" style="animation: spin 1s linear infinite;"></i>
                <i v-else class="ti ti-search"></i>
                {{ loading ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Alerta de Error -->
      <div v-if="errorMessage" class="alert alert-warning" style="max-width: 800px;">
        <i class="ti ti-alert-triangle"></i>
        {{ errorMessage }}
      </div>

      <!-- Cargando resultados -->
      <div v-if="loading && resultados.length === 0" style="text-align: center; padding: 3rem 1rem;">
        <i class="ti ti-loader" style="font-size: 36px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 14px;">Buscando designaciones en el servidor...</div>
      </div>

      <!-- Estado Vacío -->
      <div v-else-if="realizoBusqueda && resultados.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="ti ti-calendar-off" style="font-size: 40px; color: var(--color-text-secondary);"></i>
        </div>
        <div style="font-size: 15px; font-weight: 500;">No se encontraron designaciones</div>
        <div style="margin-top: 0.5rem; max-width: 400px; margin-left: auto; margin-right: auto;">
          No hay partidos programados para la fecha o rango seleccionados, o no coinciden con los criterios de búsqueda.
        </div>
      </div>

      <!-- Listado de Resultados -->
      <div v-else-if="resultados.length > 0">
        <div class="section-header" style="margin-bottom: 1.25rem;">
          <span class="section-title" style="display: flex; align-items: center; gap: 8px;">
            🔍 Resultados: {{ resultados.length }} designación(es) encontrada(s)
          </span>
          <button class="btn" @click="ejecutarBusqueda(true)" style="padding: 5px 10px; font-size: 12px;">
            <i class="ti ti-refresh"></i> Actualizar
          </button>
        </div>

        <div class="grid-2">
          <div
            v-for="d in resultados"
            :key="d.idDesignacion || d.id"
            class="card"
            style="display: flex; flex-direction: column; justify-content: space-between;"
            :style="{
              borderLeft: d.estadoDesignacion === 0 
                ? '4px solid #ff9800' 
                : d.estadoDesignacion === 1 
                  ? '4px solid #1d9e75' 
                  : '4px solid #185fa5'
            }"
          >
            <div>
              <div class="card-header" style="align-items: flex-start;">
                <div>
                  <div class="card-title" style="font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                    🏟️
                    {{
                      d.cancha?.nombreCancha ||
                      getCancha(d.idCancha || d.canchaId)?.nombre ||
                      "Cancha Desconocida"
                    }}
                  </div>
                  <div class="card-sub" style="font-size: 11px; text-transform: uppercase; margin-top: 2px;">
                    {{
                      d.cancha?.ciudad ||
                      getCancha(d.idCancha || d.canchaId)?.ciudad ||
                      "Ciudad no especificada"
                    }}
                    · {{ d.cantidadPartidos }} partidos · Fecha:
                    <span style="font-weight: 500; color: var(--color-text-primary);">{{ formatFecha(d.fecha) }}</span>
                  </div>
                </div>
                <div class="card-header-actions">
                  <!-- Badges según Estado -->
                  <span v-if="d.estadoDesignacion === 0" class="badge badge-amber">Incompleta</span>
                  <span v-else-if="d.estadoDesignacion === 1" class="badge badge-green">Completa</span>
                  <span v-else class="badge badge-blue">Finalizada</span>
                </div>
              </div>

              <!-- Detalles de Etapa -->
              <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
                <span style="font-weight: 500;">Etapa:</span>
                <span>{{ d.etapaCampeonato || d.etapaTorneo || "FECHA_NORMAL" }}</span>
              </div>

              <!-- Alerta de Árbitros Faltantes si está Incompleta -->
              <div
                v-if="d.estadoDesignacion === 0"
                style="
                  font-size: 12px;
                  color: #ff6f00;
                  background: #fff3e0;
                  border-radius: 6px;
                  padding: 8px 12px;
                  margin-bottom: 12px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                <i class="ti ti-alert-circle" style="font-size: 14px;"></i>
                <span>
                  Requiere mín. {{ minArbitrosReq(d.cantidadPartidos) }} árbitros 
                  ({{ getAsignadosCount(d) }} asignados)
                </span>
              </div>

              <!-- Lista de Árbitros Asignados -->
              <div
                v-if="arbitrosDesignados[d.idDesignacion || d.id] && arbitrosDesignados[d.idDesignacion || d.id].length > 0"
                style="
                  margin-top: 12px;
                  padding: 12px;
                  background: var(--color-background-secondary);
                  border-radius: 8px;
                  border: 0.5px solid var(--color-border-tertiary);
                "
              >
                <div
                  style="
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--color-text-secondary);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  "
                >
                  <i class="ti ti-users"></i> Árbitros Asignados:
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div
                    v-for="arb in arbitrosDesignados[d.idDesignacion || d.id]"
                    :key="arb.idDesignados || arb.id"
                    style="
                      font-size: 12px;
                      padding: 6px 10px;
                      background: var(--color-background-primary);
                      border: 0.5px solid var(--color-border-tertiary);
                      border-radius: 6px;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      gap: 8px;
                    "
                  >
                    <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                      <i class="ti ti-user" style="color: var(--color-primary); flex-shrink: 0;"></i>
                      <span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
                      </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                      <span class="badge badge-gray" style="font-size: 10px; padding: 1px 6px;">
                        {{ arb.arbitro?.rol }}
                      </span>
                      <span style="font-size: 10px; color: var(--color-text-secondary);">
                        {{ arb.partidosDirigidos }} part.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div 
                v-else-if="resultadosCargados[d.idDesignacion || d.id]"
                style="
                  margin-top: 12px;
                  padding: 10px;
                  background: var(--color-background-secondary);
                  border-radius: 8px;
                  border: 1px dashed var(--color-border-tertiary);
                  text-align: center;
                  font-size: 12px;
                  color: var(--color-text-secondary);
                "
              >
                Sin árbitros asignados actualmente
              </div>
            </div>

            <!-- Botones de Acción -->
            <div 
              style="
                margin-top: 1rem; 
                padding-top: 1rem; 
                border-top: 0.5px solid var(--color-border-tertiary);
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: flex-end;
              "
            >
              <!-- Botón Asignar Automáticamente (solo si incompleta) -->
              <button
                v-if="d.estadoDesignacion === 0"
                class="btn primary"
                @click="ejecutarAsignacionAutom(d.idDesignacion || d.id)"
                style="padding: 5px 10px; font-size: 12px;"
              >
                <i class="ti ti-sparkles"></i> Asignar autom.
              </button>

              <!-- Botón Editar Árbitros -->
              <button
                v-if="d.estadoDesignacion === 0 || d.estadoDesignacion === 1"
                class="btn"
                @click="openModal('manageReferees', d.idDesignacion || d.id)"
                style="
                  padding: 5px 10px;
                  font-size: 12px;
                  border-color: var(--color-primary);
                  color: var(--color-primary);
                "
              >
                <i class="ti ti-edit"></i> Editar árbitros
              </button>

              <!-- Botón Finalizar -->
              <button
                v-if="d.estadoDesignacion === 1"
                class="btn"
                @click="ejecutarFinalizacion(d.idDesignacion || d.id)"
                style="
                  padding: 5px 10px;
                  font-size: 12px;
                  border-color: #185fa5;
                  color: #185fa5;
                "
                onmouseover="this.style.background = '#e6f1fb'"
                onmouseout="this.style.background = 'transparent'"
              >
                <i class="ti ti-flag"></i> Finalizar
              </button>

              <!-- Botón Eliminar -->
              <button
                class="btn danger"
                @click="ejecutarEliminacion(d.idDesignacion || d.id)"
                style="padding: 5px 10px;"
              >
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import {
  state,
  openModal,
  getCancha,
  deleteDesignacion,
  minArbitros,
  asignarArbitros,
  formatFecha,
  finalizarDesignacionManual,
  loadArbitrosDesignados,
} from "../store";
import designacionService from "../services/designacionService";

// Estados reactivos
const searchMode = ref("single"); // 'single' o 'range'
const fechaSingle = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");

const loading = ref(false);
const realizoBusqueda = ref(false);
const resultados = ref([]);
const errorMessage = ref("");

// Mapas para almacenar árbitros por designación
const arbitrosDesignados = ref({});
const resultadosCargados = ref({});

// Inicializar con la fecha actual
onMounted(() => {
  const hoyStr = new Date().toISOString().split("T")[0];
  fechaSingle.value = hoyStr;
  fechaInicio.value = hoyStr;
  fechaFin.value = hoyStr;
});

// Ayudantes de visualización
const minArbitrosReq = (partidos) => minArbitros(partidos);

const getAsignadosCount = (d) => {
  const id = d.idDesignacion || d.id;
  if (arbitrosDesignados.value[id]) {
    return arbitrosDesignados.value[id].length;
  }
  return d.arbitrosAsignados || d.arbitros?.length || 0;
};

// Ejecución de la búsqueda
const ejecutarBusqueda = async (silent = false) => {
  if (!silent) {
    loading.value = true;
    errorMessage.value = "";
  }
  
  try {
    let data = [];
    if (searchMode.value === "single") {
      if (!fechaSingle.value) {
        errorMessage.value = "Por favor, selecciona una fecha válida.";
        loading.value = false;
        return;
      }
      data = await designacionService.buscarPorFecha(fechaSingle.value);
    } else {
      if (!fechaInicio.value || !fechaFin.value) {
        errorMessage.value = "Por favor, ingresa tanto la fecha de inicio como la de fin.";
        loading.value = false;
        return;
      }
      if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
        errorMessage.value = "La fecha de inicio no puede ser posterior a la fecha de fin.";
        loading.value = false;
        return;
      }
      data = await designacionService.buscarPorRango(fechaInicio.value, fechaFin.value);
    }

    resultados.value = data || [];
    realizoBusqueda.value = true;

    // Cargar detalles de árbitros para los resultados de forma proactiva
    for (const d of resultados.value) {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        arbitrosDesignados.value[id] = d.arbitrosDesignados;
      } else {
        const arbs = await loadArbitrosDesignados(id);
        arbitrosDesignados.value[id] = arbs || [];
      }
      resultadosCargados.value[id] = true;
    }
  } catch (error) {
    console.error("Error al buscar designaciones:", error);
    errorMessage.value = "Ocurrió un error al comunicarse con el servidor. Por favor intenta de nuevo.";
  } finally {
    loading.value = false;
  }
};

// Acciones sobre tarjetas de designación
const ejecutarAsignacionAutom = async (id) => {
  try {
    await asignarArbitros(id);
    // Recargar resultados para reflejar los cambios
    await ejecutarBusqueda(true);
  } catch (err) {
    console.error("Error en asignación automática:", err);
  }
};

const ejecutarFinalizacion = async (id) => {
  try {
    await finalizarDesignacionManual(id);
    await ejecutarBusqueda(true);
  } catch (err) {
    console.error("Error al finalizar designación:", err);
  }
};

const ejecutarEliminacion = async (id) => {
  try {
    // deleteDesignacion ya tiene su confirmación integrada en el store
    await deleteDesignacion(id);
    // Filtrar localmente el eliminado para actualización inmediata
    resultados.value = resultados.value.filter((d) => (d.idDesignacion || d.id) !== id);
  } catch (err) {
    console.error("Error al eliminar designación:", err);
  }
};

// Monitorear cuando se cierra el modal global de gestión de árbitros
// para actualizar en tiempo real los resultados de la búsqueda actual
watch(
  () => state.modal,
  async (newModal, oldModal) => {
    // Si el modal estaba abierto (oldModal es objeto) y ahora se cierra (newModal es null)
    if (oldModal && !newModal && realizoBusqueda.value && resultados.value.length > 0) {
      console.log("Modal de árbitros cerrado. Recargando buscador...");
      await ejecutarBusqueda(true);
    }
  }
);
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
</style>
