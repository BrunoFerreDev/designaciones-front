<template>
  <div>
    <!-- Barra Superior -->
    <div class="topbar">
      <div>
        <div
          class="topbar-title text-slate-800 font-semibold flex items-center gap-2"
        >
          <i class="ti ti-chart-bar text-emerald-600"></i> Estadísticas de Árbitros
        </div>
        <div class="topbar-sub">
          Consulta el rendimiento individual, canchas frecuentes e historial de designaciones
        </div>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/comparador"
          class="btn flex items-center gap-1.5 text-xs text-slate-700 hover:bg-slate-100"
          style="padding: 6px 12px"
        >
          <i class="ti ti-scale text-emerald-600 text-sm"></i>
          <span>Ir al Comparador</span>
        </router-link>
      </div>
    </div>

    <div class="content flex flex-col gap-8 md:gap-10">
      <!-- Selector de Árbitro -->
      <div class="card border border-slate-100 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <i class="ti ti-user-search text-xl"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-800">Seleccionar Árbitro</h3>
              <p class="text-xs text-slate-500">
                Elige un árbitro del listado para cargar su reporte completo
              </p>
            </div>
          </div>

          <!-- Buscador y Dropdown de Árbitros -->
          <div class="relative w-full md:w-80">
            <div class="relative">
              <input
                v-model="busquedaArbitro"
                type="text"
                placeholder="Buscar por apellido o nombre..."
                class="form-input w-full pl-9 pr-8"
                style="height: 38px; border-radius: 8px; font-size: 13px;"
                @focus="mostrarDropdown = true"
              />
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <i class="ti ti-search text-sm"></i>
              </span>
              <button
                v-if="busquedaArbitro"
                @click="busquedaArbitro = ''"
                class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <i class="ti ti-x text-xs"></i>
              </button>
            </div>

            <!-- Desplegable flotante de resultados -->
            <div
              v-if="mostrarDropdown && arbitrosFiltrados.length > 0"
              class="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 animate-fade-in"
            >
              <button
                v-for="arb in arbitrosFiltrados"
                :key="arb.idArbitro"
                @click="seleccionarArbitro(arb.idArbitro)"
                :class="[
                  'w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0',
                  selectedArbitroId === arb.idArbitro ? 'bg-emerald-50/70 text-emerald-900 font-semibold' : 'text-slate-700'
                ]"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                      selectedArbitroId === arb.idArbitro ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    ]"
                  >
                    {{ (arb.nombre || "")[0] }}{{ (arb.apellido || "")[0] }}
                  </span>
                  <span class="text-xs truncate">
                    {{ arb.apellido }}, {{ arb.nombre }}
                  </span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <span
                    :class="[
                      'badge text-[10px]',
                      getCategoryBadgeClass(arb.categoria),
                    ]"
                  >
                    {{ getCategoryLabel(arb.categoria) }}
                  </span>
                  <i
                    v-if="selectedArbitroId === arb.idArbitro"
                    class="ti ti-check text-emerald-600 text-sm ml-1"
                  ></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop invisible para cerrar dropdown al hacer clic afuera -->
      <div
        v-if="mostrarDropdown"
        class="fixed inset-0 z-20"
        @click="mostrarDropdown = false"
      ></div>

      <!-- ESTADO: Ningún Árbitro Seleccionado -->
      <div
        v-if="!selectedArbitroId"
        class="card border border-slate-100 shadow-sm text-center py-14 px-6 animate-fade-in"
      >
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100">
          <i class="ti ti-user-check"></i>
        </div>
        <h3 class="text-base font-bold text-slate-800">
          Ningún árbitro seleccionado
        </h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-8">
          Selecciona un árbitro en el buscador de arriba o haz clic en alguno de los árbitros a continuación para ver su actividad y rendimiento.
        </p>

        <!-- Cuadrícula rápida de selección -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <button
            v-for="arb in listaArbitrosCompletos.slice(0, 12)"
            :key="arb.idArbitro"
            @click="seleccionarArbitro(arb.idArbitro)"
            class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 transition-all shadow-xs group cursor-pointer"
          >
            <div class="flex items-center gap-2.5 truncate">
              <span class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {{ (arb.nombre || "")[0] }}{{ (arb.apellido || "")[0] }}
              </span>
              <div class="truncate">
                <div class="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                  {{ arb.apellido }}, {{ arb.nombre }}
                </div>
                <div class="text-[10px] text-slate-400">
                  {{ getCategoryLabel(arb.categoria) }}
                </div>
              </div>
            </div>
            <i class="ti ti-chevron-right text-slate-300 group-hover:text-emerald-600 text-sm shrink-0 transition-colors"></i>
          </button>
        </div>
      </div>

      <!-- ESTADO: Árbitro Seleccionado (Ficha y Estadísticas) -->
      <div v-else class="flex flex-col gap-8 md:gap-10">
        <!-- Ficha de Perfil del Árbitro -->
        <div class="card border border-slate-100 shadow-sm p-6 md:p-7 bg-gradient-to-r from-white via-slate-50/50 to-emerald-50/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {{ (arbitroInfo?.nombre || "")[0] }}{{ (arbitroInfo?.apellido || "")[0] }}
              </div>
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h2 class="text-xl font-bold text-slate-800">
                    {{
                      arbitroInfo
                        ? `${arbitroInfo.nombre} ${arbitroInfo.apellido}`
                        : stats.nombreCompleto || "Árbitro #" + selectedArbitroId
                    }}
                  </h2>
                  <span
                    v-if="arbitroInfo"
                    :class="[
                      'badge text-xs',
                      getCategoryBadgeClass(arbitroInfo.categoria),
                    ]"
                  >
                    {{ getCategoryLabel(arbitroInfo.categoria) }}
                  </span>
                  <span
                    v-if="arbitroInfo"
                    :class="[
                      'text-[11px] px-2.5 py-0.5 rounded-full font-semibold border',
                      isActivo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200',
                    ]"
                  >
                    {{ isActivo ? "Activo" : "Inactivo" }}
                  </span>
                </div>

                <div class="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                  <span
                    v-if="arbitroInfo?.whatsapp"
                    class="inline-flex items-center gap-1"
                  >
                    <a
                      :href="whatsappLink"
                      target="_blank"
                      class="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                    >
                      <i class="ti ti-brand-whatsapp text-sm"></i>
                      {{ arbitroInfo.whatsapp }}
                    </a>
                  </span>
                  <span
                    v-if="arbitroInfo"
                    class="inline-flex items-center gap-1 text-slate-400"
                  >
                    👕 {{ arbitroInfo.talleCamiseta || "M" }} · 🩳
                    {{ arbitroInfo.talleShort || "M" }}
                  </span>
                  <span class="text-slate-400">
                    📅 Disp: {{ disponibilidadTexto }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Botón Cambiar Árbitro -->
            <div>
              <button
                @click="limpiarSeleccion"
                class="btn flex items-center gap-1.5 text-xs text-slate-600 hover:bg-slate-100 border border-slate-200"
                style="padding: 7px 14px"
              >
                <i class="ti ti-refresh text-sm"></i>
                <span>Cambiar árbitro</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Filtros de Fecha y Orden -->
        <StatsFiltros
          v-model:fechaInicio="fechaInicio"
          v-model:fechaFin="fechaFin"
          v-model:orden="orden"
          :show-orden="true"
          @buscar="cargarEstadisticas"
          @reiniciar="limpiarFechas"
        />

        <!-- Alerta de Error -->
        <div
          v-if="errorMsg"
          class="alert alert-warning animate-fade-in mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 flex gap-3"
        >
          <i class="ti ti-alert-triangle text-xl shrink-0"></i>
          <div>
            <strong class="font-semibold block">Error de Carga:</strong>
            <span class="text-xs">{{ errorMsg }}</span>
          </div>
        </div>

        <!-- Estado Cargando -->
        <div
          v-if="cargando"
          class="empty-state card border border-slate-100 shadow-sm py-16 text-center"
        >
          <div class="relative w-14 h-14 mx-auto mb-4">
            <div class="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div class="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center text-emerald-600">
              <i class="ti ti-chart-bar text-lg"></i>
            </div>
          </div>
          <p class="text-slate-700 font-semibold text-sm">
            Cargando reporte estadístico del árbitro...
          </p>
          <p class="text-xs text-slate-400 mt-1">
            Calculando métricas, canchas y rendimiento
          </p>
        </div>

        <!-- Contenido de Estadísticas -->
        <div v-else class="animate-fade-in flex flex-col gap-8 md:gap-10">
          <!-- 1. KPIs Principales -->
          <ArbitroStatsKPIs
            :total-designaciones="stats.totalDesignaciones"
            :total-partidos-dirigidos="stats.totalPartidosDirigidos"
            :promedio-partidos="promedioPartidosPorDesignacion"
            :porcentaje-cumplimiento="porcentajeCumplimiento"
          />

          <!-- 2. Grids de Detalle: Canchas Paginadas, Estados y Categorías -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <!-- Canchas Habituales con Paginación -->
            <ArbitroStatsCanchas
              :estadisticas-canchas="stats.estadisticasCanchas"
              :total-designaciones="stats.totalDesignaciones"
              :cargando="cargando"
              @change-page="cambiarPaginaCanchas"
            />

            <!-- Estados de Designación -->
            <ArbitroStatsEstados
              :designaciones-por-estado="stats.designacionesPorEstado"
              :total-designaciones="stats.totalDesignaciones"
            />

            <!-- Categorías de Partido -->
            <ArbitroStatsCategorias
              :designaciones-por-categoria="stats.designacionesPorCategoria"
              :total-designaciones="stats.totalDesignaciones"
            />
          </div>

          <!-- 3. Historial Cronológico de Designaciones Paginado -->
          <ArbitroStatsHistorial
            :historial="historialDesignaciones"
            :cargando="cargandoHistorial"
            :orden="ordenHistorial"
            :current-page="pageHistorial"
            :total-pages="totalPagesHistorial"
            :total-elements="totalElementsHistorial"
            :canchas-store="state.canchas"
            :canchas-stats="stats.estadisticasCanchas"
            @toggle-orden="toggleOrdenHistorial"
            @change-page="cambiarPaginaHistorial"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  state,
  loadArbitros,
  loadArbitrosNoDisponibles,
  isArbitroActivo,
  loadCanchas,
} from "../store";
import estadisticasService from "../services/estadisticasService";
import arbitroService from "../services/arbitroService";
import StatsFiltros from "../components/StatsFiltros.vue";
import ArbitroStatsKPIs from "../components/arbitros/ArbitroStatsKPIs.vue";
import ArbitroStatsCanchas from "../components/arbitros/ArbitroStatsCanchas.vue";
import ArbitroStatsEstados from "../components/arbitros/ArbitroStatsEstados.vue";
import ArbitroStatsCategorias from "../components/arbitros/ArbitroStatsCategorias.vue";
import ArbitroStatsHistorial from "../components/arbitros/ArbitroStatsHistorial.vue";
import {
  getCategoryLabel,
  getCategoryBadgeClass,
} from "../composables/useArbitroStatsFormatters";

const route = useRoute();
const router = useRouter();

// Selección de Árbitro
const selectedArbitroId = ref(null);
const busquedaArbitro = ref("");
const mostrarDropdown = ref(false);

// Fechas, Orden y Paginación
const fechaInicio = ref("");
const fechaFin = ref("");
const orden = ref("DESC");
const pageCanchas = ref(0);
const pageSizeCanchas = ref(10);

// Estados de carga
const cargando = ref(false);
const cargandoHistorial = ref(false);
const errorMsg = ref("");

const stats = ref({});

// Paginación y orden del Historial
const historialDesignaciones = ref([]);
const ordenHistorial = ref("DESC");
const pageHistorial = ref(0);
const pageSizeHistorial = ref(10);
const totalPagesHistorial = ref(1);
const totalElementsHistorial = ref(0);

// Lista consolidada de todos los árbitros activos
const listaArbitrosCompletos = computed(() => {
  const list = [
    ...(state.arbitros || []),
    ...(state.arbitrosNoDisponibles || []),
  ].filter(isArbitroActivo);

  const unique = [];
  const map = new Set();
  for (const item of list) {
    const id = item.idArbitro || item.id;
    if (id && !map.has(id)) {
      map.add(id);
      unique.push(item);
    }
  }
  return unique.sort((a, b) =>
    (a.apellido || "").localeCompare(b.apellido || "")
  );
});

// Filtrado de árbitros para el buscador
const arbitrosFiltrados = computed(() => {
  const q = busquedaArbitro.value.toLowerCase().trim();
  if (!q) return listaArbitrosCompletos.value;
  return listaArbitrosCompletos.value.filter((a) =>
    `${a.apellido || ""} ${a.nombre || ""}`.toLowerCase().includes(q) ||
    `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase().includes(q)
  );
});

// Info del Árbitro Seleccionado
const arbitroInfo = computed(() => {
  if (!selectedArbitroId.value) return null;
  const all = [
    ...(state.arbitros || []),
    ...(state.arbitrosNoDisponibles || []),
  ];
  return (
    all.find((a) => String(a.idArbitro || a.id) === String(selectedArbitroId.value)) ||
    null
  );
});

const isActivo = computed(() => {
  if (!arbitroInfo.value) return true;
  return isArbitroActivo(arbitroInfo.value);
});

const disponibilidadTexto = computed(() => {
  if (!arbitroInfo.value) return "-";
  const a = arbitroInfo.value;
  if (a.disponibleSabado && a.disponibleDomingo) return "Sábado y Domingo";
  if (a.disponibleSabado) return "Solo Sábado";
  if (a.disponibleDomingo) return "Solo Domingo";
  return "No disponible";
});

const whatsappLink = computed(() => {
  if (!arbitroInfo.value?.whatsapp) return "#";
  const clean = arbitroInfo.value.whatsapp.replace(/[^0-9+]/g, "");
  return `https://wa.me/${clean}`;
});

// Seleccionar un árbitro
const seleccionarArbitro = (id) => {
  selectedArbitroId.value = id;
  busquedaArbitro.value = "";
  mostrarDropdown.value = false;
  router.replace({ query: { arbitro: id } });
  pageCanchas.value = 0;
  pageHistorial.value = 0;
  cargarEstadisticas();
  cargarHistorial();
};

const limpiarSeleccion = () => {
  selectedArbitroId.value = null;
  busquedaArbitro.value = "";
  stats.value = {};
  historialDesignaciones.value = [];
  router.replace({ query: {} });
};

const inicializarFechas = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const monthStr = String(month).padStart(2, "0");

  fechaInicio.value = `${year}-${monthStr}-01`;
  fechaFin.value = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
};

const limpiarFechas = () => {
  inicializarFechas();
  orden.value = "DESC";
  pageCanchas.value = 0;
  pageHistorial.value = 0;
  cargarEstadisticas();
  cargarHistorial();
};

const cargarEstadisticas = async () => {
  if (!selectedArbitroId.value) return;
  cargando.value = true;
  errorMsg.value = "";

  try {
    const res = await estadisticasService.getEstadisticasArbitro(
      selectedArbitroId.value,
      fechaInicio.value,
      fechaFin.value,
      orden.value,
      pageCanchas.value,
      pageSizeCanchas.value
    );
    stats.value = res || {};
  } catch (err) {
    console.error("Error al cargar estadísticas de árbitro:", err);
    errorMsg.value = "No se pudieron obtener las estadísticas del árbitro.";
    stats.value = {};
  } finally {
    cargando.value = false;
  }
};

const cambiarPaginaCanchas = (nuevaPagina) => {
  pageCanchas.value = nuevaPagina;
  cargarEstadisticas();
};

const cambiarPaginaHistorial = (nuevaPagina) => {
  pageHistorial.value = nuevaPagina;
  cargarHistorial();
};

const toggleOrdenHistorial = () => {
  ordenHistorial.value = ordenHistorial.value === "DESC" ? "ASC" : "DESC";
  pageHistorial.value = 0;
  cargarHistorial();
};

const cargarHistorial = async () => {
  if (!selectedArbitroId.value) return;
  cargandoHistorial.value = true;
  try {
    const res = await arbitroService.getDesignacionesByArbitro(
      selectedArbitroId.value,
      pageHistorial.value,
      pageSizeHistorial.value,
      ordenHistorial.value
    );
    const content = res?.content || (Array.isArray(res) ? res : []);
    historialDesignaciones.value = content.map(
      (item) => item.Designacion || item
    );
    totalPagesHistorial.value = res?.totalPages || (content.length > 0 ? 1 : 0);
    totalElementsHistorial.value = res?.totalElements ?? content.length;
  } catch (err) {
    console.error("Error al cargar historial de designaciones:", err);
    historialDesignaciones.value = [];
    totalPagesHistorial.value = 1;
    totalElementsHistorial.value = 0;
  } finally {
    cargandoHistorial.value = false;
  }
};

watch(orden, () => {
  pageCanchas.value = 0;
  cargarEstadisticas();
});

const promedioPartidosPorDesignacion = computed(() => {
  if (!stats.value?.totalDesignaciones) return "0.0";
  return (
    (stats.value.totalPartidosDirigidos || 0) / stats.value.totalDesignaciones
  ).toFixed(1);
});

const porcentajeCumplimiento = computed(() => {
  const estados = stats.value?.designacionesPorEstado;
  if (!estados || !stats.value?.totalDesignaciones) return 0;
  const completadas =
    (estados.Finalizada || 0) +
    (estados.Aceptada || 0) +
    (estados.Completa || 0);
  return Math.min(
    100,
    Math.round((completadas / stats.value.totalDesignaciones) * 100)
  );
});

// Vigilar cambios en el parámetro de consulta ?arbitro=:id
watch(
  () => route.query.arbitro,
  (newArbitroId) => {
    if (newArbitroId && newArbitroId !== selectedArbitroId.value) {
      selectedArbitroId.value = newArbitroId;
      pageCanchas.value = 0;
      pageHistorial.value = 0;
      cargarEstadisticas();
      cargarHistorial();
    } else if (!newArbitroId && selectedArbitroId.value) {
      selectedArbitroId.value = null;
      stats.value = {};
      historialDesignaciones.value = [];
    }
  }
);

onMounted(() => {
  if (!state.arbitros || state.arbitros.length === 0) {
    loadArbitros();
  }
  if (
    !state.arbitrosNoDisponibles ||
    state.arbitrosNoDisponibles.length === 0
  ) {
    loadArbitrosNoDisponibles();
  }
  if (!state.canchas || state.canchas.length === 0) {
    loadCanchas();
  }

  inicializarFechas();

  // Si viene en query param ?arbitro=X
  if (route.query.arbitro) {
    selectedArbitroId.value = route.query.arbitro;
    cargarEstadisticas();
    cargarHistorial();
  }
});
</script>

<style scoped></style>
