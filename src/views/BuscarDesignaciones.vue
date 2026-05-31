<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Buscador de Designaciones</div>
        <div class="topbar-sub">Encuentra y gestiona designaciones por fecha o rango</div>
      </div>
    </div>

    <div class="content animate-fade-in">
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
        <form @submit.prevent="ejecutarBusqueda(false)">
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
          <DesignacionCard
            v-for="d in resultados"
            :key="d.idDesignacion || d.id"
            :designacion="d"
            :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
            show-empty-arbitros-state
            @action-complete="ejecutarBusqueda(true)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { state, loadArbitrosDesignados } from "../store";
import designacionService from "../services/designacionService";
import DesignacionCard from "../components/DesignacionCard.vue";

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
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const hoyStr = `${yyyy}-${mm}-${dd}`;
  
  fechaSingle.value = hoyStr;
  fechaInicio.value = hoyStr;
  fechaFin.value = hoyStr;
});

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
