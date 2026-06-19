<template>
  <div>
    <!-- Barra Superior -->
    <div class="topbar">
      <div>
        <div
          class="topbar-title text-slate-800 font-semibold flex items-center gap-2"
        >
          <i class="ti ti-chart-bar text-emerald-600"></i> Estadísticas y
          Rendimiento
        </div>
        <div class="topbar-sub">
          Visualiza el historial de designaciones, canchas y árbitros
        </div>
      </div>
    </div>

    <div class="content">
      <!-- Filtros de Fecha -->
      <StatsFiltros
        v-model:fechaInicio="fechaInicio"
        v-model:fechaFin="fechaFin"
        @buscar="cargarDatos"
        @reiniciar="limpiarFechas"
      />

      <!-- Pestañas (Tabs) -->
      <div class="tab-row" style="margin-bottom: 1.25rem">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'global' }"
          @click="activeTab = 'global'"
        >
          <i class="ti ti-world" style="font-size: 14px; margin-right: 5px"></i>
          Resumen Global
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'arbitro' }"
          @click="activeTab = 'arbitro'"
        >
          <i class="ti ti-user" style="font-size: 14px; margin-right: 5px"></i>
          Detalle por Árbitro
        </button>
      </div>

      <!-- Alerta de Error -->
      <div
        v-if="errorMsg"
        class="alert alert-warning animate-fade-in"
        style="margin-bottom: 1.25rem"
      >
        <i class="ti ti-alert-triangle" style="font-size: 18px"></i>
        <div><strong>Error de Carga:</strong> {{ errorMsg }}</div>
      </div>

      <!-- Cargando -->
      <div v-if="cargando" class="empty-state">
        <div
          class="spinner animate-spin"
          style="
            border: 3px solid #f3f3f3;
            border-top: 3px solid #1d9e75;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            margin: 0 auto 12px;
          "
        ></div>
        Cargando estadísticas...
      </div>

      <div v-else>
        <!-- Pestaña Global -->
        <StatsResumenGlobal
          v-if="activeTab === 'global'"
          :stats="globalStats"
          @ver-detalle="seleccionarYVerDetalle"
          class="animate-fade-in"
        />

        <!-- Pestaña Detalle Árbitro -->
        <StatsDetalleArbitro
          v-else-if="activeTab === 'arbitro'"
          :stats="arbitroStats"
          v-model:selectedArbitroId="selectedArbitroId"
          :listaArbitros="listaArbitrosCompletos"
          :cargandoDetalle="cargandoDetalle"
          :arbitrosRapidos="arbitrosRapidos"
          @seleccionar-arbitro="seleccionarYVerDetalle"
          class="animate-fade-in"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { state, loadArbitros, loadArbitrosNoDisponibles } from "../store";
import estadisticasService from "../services/estadisticasService";
import StatsFiltros from "../components/StatsFiltros.vue";
import StatsResumenGlobal from "../components/StatsResumenGlobal.vue";
import StatsDetalleArbitro from "../components/StatsDetalleArbitro.vue";

// Pestaña Activa
const activeTab = ref("global");

// Filtros de fecha (por defecto mes actual)
const fechaInicio = ref("");
const fechaFin = ref("");

// Estados de carga y error
const cargando = ref(false);
const cargandoDetalle = ref(false);
const errorMsg = ref("");

// Datos del backend
const globalStats = ref({});
const arbitroStats = ref({});
const selectedArbitroId = ref("");
const selectedArbitroNombre = ref("");

// Inicializar fechas del mes actual
const inicializarFechas = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const monthStr = String(month).padStart(2, "0");

  fechaInicio.value = `${year}-${monthStr}-01`;
  fechaFin.value = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
};

// Limpiar y resetear fechas
const limpiarFechas = () => {
  inicializarFechas();
  cargarDatos();
};

// Cargar todos los datos globales (Estadísticas Generales)
const cargarDatos = async () => {
  cargando.value = true;
  errorMsg.value = "";

  try {
    const res = await estadisticasService.getEstadisticas(
      fechaInicio.value,
      fechaFin.value,
    );
    globalStats.value = res || {};
  } catch (err) {
    console.error("Error cargando estadísticas de backend.", err);
    errorMsg.value =
      "No se pudieron obtener las estadísticas generales del servidor.";
    globalStats.value = {};
  } finally {
    cargando.value = false;
  }
};

// Cargar estadísticas detalladas del árbitro seleccionado
const cargarDatosDetalle = async () => {
  if (!selectedArbitroId.value) return;

  cargandoDetalle.value = true;
  errorMsg.value = "";
  try {
    const res = await estadisticasService.getEstadisticasArbitro(
      selectedArbitroId.value,
      fechaInicio.value,
      fechaFin.value,
    );
    arbitroStats.value = res || {};
  } catch (err) {
    console.error("Error cargando estadísticas del árbitro.", err);
    errorMsg.value =
      "No se pudieron obtener las estadísticas del árbitro seleccionado.";
    arbitroStats.value = {};
  } finally {
    cargandoDetalle.value = false;
  }
};

// Seleccionar un árbitro y cambiar de pestaña
const seleccionarYVerDetalle = (id, nombre) => {
  selectedArbitroId.value = id;
  selectedArbitroNombre.value = nombre;
  activeTab.value = "arbitro";
  cargarDatosDetalle();
};

// Combinar árbitros disponibles y no disponibles para el Selector
const listaArbitrosCompletos = computed(() => {
  const list = [...state.arbitros, ...(state.arbitrosNoDisponibles || [])];
  // Eliminar duplicados por idArbitro y ordenar alfabéticamente por Apellido
  const unique = [];
  const map = new Set();
  for (const item of list) {
    if (item.idArbitro && !map.has(item.idArbitro)) {
      map.add(item.idArbitro);
      unique.push(item);
    }
  }
  return unique.sort((a, b) =>
    (a.apellido || "").localeCompare(b.apellido || ""),
  );
});

// Árbitros rápidos para sugerencia cuando no se ha seleccionado nada
const arbitrosRapidos = computed(() => {
  return state.arbitros.slice(0, 4);
});

onMounted(() => {
  if (state.arbitros.length === 0) {
    loadArbitros();
  }
  if (state.arbitrosNoDisponibles.length === 0) {
    loadArbitrosNoDisponibles();
  }

  inicializarFechas();
  cargarDatos();
});
</script>

<style scoped>
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #1d9e75;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
