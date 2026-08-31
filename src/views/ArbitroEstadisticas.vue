<template>
  <div>
    <!-- Topbar con perfil del árbitro y acciones -->
    <div class="topbar">
      <div class="flex items-center gap-3">
        <button
          @click="volver"
          class="btn flex items-center justify-center w-9 h-9 p-0 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
          title="Volver"
        >
          <i class="ti ti-arrow-left text-lg"></i>
        </button>
        <div>
          <div class="topbar-title flex items-center gap-2.5 flex-wrap">
            <span class="text-slate-800 font-bold">
              {{
                arbitroInfo
                  ? `${arbitroInfo.nombre} ${arbitroInfo.apellido}`
                  : stats.nombreCompleto || "Árbitro"
              }}
            </span>
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
                'text-[11px] px-2 py-0.5 rounded-full font-semibold border',
                isActivo
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200',
              ]"
            >
              {{ isActivo ? "Activo" : "Inactivo" }}
            </span>
          </div>
          <div
            class="topbar-sub flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap"
          >
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

      <div class="flex items-center gap-2">
        <router-link
          :to="{ path: '/estadisticas', query: { tab: 'comparacion' } }"
          class="btn flex items-center gap-1.5 text-xs text-slate-700 hover:bg-slate-100"
          style="padding: 6px 12px"
        >
          <i class="ti ti-chart-bar text-sm"></i>
          <span>Ver Comparador</span>
        </router-link>
      </div>
    </div>

    <div class="content flex flex-col gap-8 md:gap-10">
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
          <div
            class="absolute inset-0 rounded-full border-4 border-slate-100"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"
          ></div>
          <div
            class="absolute inset-0 flex items-center justify-center text-emerald-600"
          >
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

const arbitroId = computed(() => route.params.id);

// Fechas, Orden y Paginación de Estadísticas
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

// Info del Árbitro
const arbitroInfo = computed(() => {
  const all = [
    ...(state.arbitros || []),
    ...(state.arbitrosNoDisponibles || []),
  ];
  return (
    all.find((a) => String(a.idArbitro || a.id) === String(arbitroId.value)) ||
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

const volver = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/arbitros");
  }
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
  if (!arbitroId.value) return;
  cargando.value = true;
  errorMsg.value = "";

  try {
    const res = await estadisticasService.getEstadisticasArbitro(
      arbitroId.value,
      fechaInicio.value,
      fechaFin.value,
      orden.value,
      pageCanchas.value,
      pageSizeCanchas.value,
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
  if (!arbitroId.value) return;
  cargandoHistorial.value = true;
  try {
    const res = await arbitroService.getDesignacionesByArbitro(
      arbitroId.value,
      pageHistorial.value,
      pageSizeHistorial.value,
      ordenHistorial.value,
    );
    const content = res?.content || (Array.isArray(res) ? res : []);
    historialDesignaciones.value = content.map(
      (item) => item.Designacion || item,
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
    Math.round((completadas / stats.value.totalDesignaciones) * 100),
  );
});

watch(arbitroId, () => {
  if (arbitroId.value) {
    pageCanchas.value = 0;
    cargarEstadisticas();
    cargarHistorial();
  }
});

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
  cargarEstadisticas();
  cargarHistorial();
});
</script>

<style scoped></style>
