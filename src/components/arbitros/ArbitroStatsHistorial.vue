<template>
  <div
    class="card border border-slate-100 shadow-sm p-6 md:p-7 flex flex-col justify-between"
  >
    <div>
      <div
        class="card-header border-b border-slate-100 pb-4 mb-6 flex justify-between items-center flex-wrap gap-3"
      >
        <div>
          <div class="flex items-center gap-2">
            <h4
              class="card-title text-sm font-bold text-slate-800 flex items-center gap-2"
            >
              <i class="ti ti-history text-purple-600"></i>
              Historial de Designaciones
            </h4>
            <span class="badge badge-gray text-[10px]">
              {{ totalElements }}
              {{ totalElements === 1 ? "jornada" : "jornadas" }}
            </span>
          </div>
          <div class="card-sub text-xs text-slate-400 mt-0.5">
            Listado paginado de partidos dirigidos y asistencias
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <!-- Toggle de Orden para el historial -->
          <button
            type="button"
            class="btn flex items-center gap-1.5 text-xs font-medium transition-colors"
            :style="{
              borderColor: orden === 'DESC' ? '#a7f3d0' : '#bfdbfe',
              backgroundColor: orden === 'DESC' ? '#ecfdf5' : '#eff6ff',
              color: orden === 'DESC' ? '#065f46' : '#1e40af',
              height: '34px',
            }"
            @click="$emit('toggle-orden')"
            :title="
              orden === 'DESC'
                ? 'Historial: Más recientes primero (DESC)'
                : 'Historial: Más antiguas primero (ASC)'
            "
          >
            <i
              :class="
                orden === 'DESC'
                  ? 'ti ti-sort-descending'
                  : 'ti ti-sort-ascending'
              "
              class="text-sm"
            ></i>
            <span>{{
              orden === "DESC" ? "Recientes (DESC)" : "Antiguas (ASC)"
            }}</span>
          </button>

          <!-- Buscador -->
          <div class="relative flex-1 sm:w-60">
            <input
              v-model="filtroHistorial"
              type="text"
              placeholder="Filtrar cancha, estado, fecha..."
              class="form-input w-full pl-8 text-xs"
              style="height: 34px; border-radius: 8px"
            />
            <i
              class="ti ti-search absolute left-2.5 top-2.5 text-slate-400 text-xs"
            ></i>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="cargando" class="text-center py-10 text-xs text-slate-400">
        <div
          class="spinner animate-spin mx-auto mb-2 w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full"
        ></div>
        Cargando historial de jornadas...
      </div>

      <!-- Empty State -->
      <div
        v-else-if="historialFiltrado.length === 0"
        class="text-center py-10 text-xs text-slate-400"
      >
        No se encontraron designaciones registradas con ese criterio.
      </div>

      <!-- Table -->
      <div v-else class="table-responsive">
        <table class="des-table">
          <thead>
            <tr>
              <th
                @click="$emit('toggle-orden')"
                class="cursor-pointer select-none hover:text-emerald-700 transition-colors"
                title="Clic para alternar orden ASC/DESC"
              >
                <div class="flex items-center gap-1">
                  <span>Fecha</span>
                  <i
                    :class="
                      orden === 'DESC' ? 'ti ti-arrow-down' : 'ti ti-arrow-up'
                    "
                    class="text-xs text-emerald-600"
                  ></i>
                </div>
              </th>
              <th>Cancha / Predio</th>
              <th class="text-center">Partidos</th>
              <th>Etapa</th>
              <th>Detalle / Nota</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in historialFiltrado" :key="d.idDesignacion || d.id">
              <td
                class="text-xs text-slate-700 font-semibold whitespace-nowrap"
              >
                {{ formatDate(d.fecha) }}
              </td>
              <td class="font-medium text-slate-800">
                <span class="inline-flex items-center gap-1">
                  <i class="ti ti-map-pin text-slate-400 text-xs"></i>
                  {{ getCanchaNombre(d) }}
                </span>
              </td>
              <td class="text-center font-bold text-emerald-700">
                {{ d.cantidadPartidos || 1 }}
              </td>

              <td class="text-xs text-slate-600 italic uppercase">
                {{ getEtapaLabel(d.etapaCampeonato) }}
              </td>

              <td
                class="text-xs text-slate-500 max-w-xs truncate"
                :title="d.detalle"
              >
                {{ d.detalleDesignacion || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación de la Tabla de Historial -->
    <div
      v-if="totalPages > 1"
      class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs"
    >
      <span class="text-slate-500 font-medium">
        Mostrando página {{ currentPage + 1 }} de {{ totalPages }} ({{
          totalElements
        }}
        designaciones)
      </span>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn flex items-center gap-1"
          style="padding: 4px 10px; font-size: 12px"
          :disabled="currentPage <= 0"
          @click="$emit('change-page', currentPage - 1)"
        >
          <i class="ti ti-chevron-left"></i>
          <span>Anterior</span>
        </button>

        <button
          type="button"
          class="btn flex items-center gap-1"
          style="padding: 4px 10px; font-size: 12px"
          :disabled="currentPage >= totalPages - 1"
          @click="$emit('change-page', currentPage + 1)"
        >
          <span>Siguiente</span>
          <i class="ti ti-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  getCategoryLabel,
  getCategoryBadgeClass,
  getEstadoColor,
  getEstadoBgColor,
  getEtapaLabel,
} from "../../composables/useArbitroStatsFormatters";

const props = defineProps({
  historial: {
    type: Array,
    default: () => [],
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  orden: {
    type: String,
    default: "DESC",
  },
  currentPage: {
    type: Number,
    default: 0,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  totalElements: {
    type: Number,
    default: 0,
  },
  canchasStore: {
    type: Array,
    default: () => [],
  },
  canchasStats: {
    type: [Array, Object],
    default: () => [],
  },
});

defineEmits(["toggle-orden", "change-page"]);

const filtroHistorial = ref("");

const getCanchaNombre = (d) => {
  if (!d) return "Cancha sin asignar";

  // 1. Objeto cancha embebido
  if (d.cancha && typeof d.cancha === "object") {
    if (d.cancha.nombreCancha) return d.cancha.nombreCancha;
    if (d.cancha.nombre) return d.cancha.nombre;
  }

  // 2. Propiedades directas
  if (d.nombreCancha) return d.nombreCancha;
  if (d.canchaNombre) return d.canchaNombre;

  // 3. ID de cancha resuelto contra store o stats
  const canchaId =
    d.idCancha ||
    d.canchaId ||
    (typeof d.cancha === "number" || typeof d.cancha === "string"
      ? d.cancha
      : null);
  if (canchaId) {
    const fromState = (props.canchasStore || []).find(
      (c) => String(c.idCancha || c.id) === String(canchaId),
    );
    if (fromState) return fromState.nombreCancha || fromState.nombre;

    const statsList = Array.isArray(props.canchasStats)
      ? props.canchasStats
      : props.canchasStats?.content || [];
    const fromStats = statsList.find(
      (c) => String(c.idCancha || c.id) === String(canchaId),
    );
    if (fromStats) return fromStats.nombreCancha;

    return `Cancha #${canchaId}`;
  }

  return "Cancha sin asignar";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

const historialFiltrado = computed(() => {
  if (!props.historial) return [];
  const q = filtroHistorial.value.toLowerCase().trim();
  const sorted = [...props.historial].sort((a, b) => {
    const timeA = new Date(a.fecha).getTime() || 0;
    const timeB = new Date(b.fecha).getTime() || 0;
    return props.orden === "ASC" ? timeA - timeB : timeB - timeA;
  });

  if (!q) return sorted;

  return sorted.filter((d) => {
    const cancha = getCanchaNombre(d).toLowerCase();
    const estado = (d.estadoDesignacion || d.estado || "").toLowerCase();
    const fecha = (d.fecha || "").toLowerCase();
    return cancha.includes(q) || estado.includes(q) || fecha.includes(q);
  });
});
</script>

<style scoped>
.des-table th {
  padding: 12px 16px;
  font-size: 11px;
}
.des-table td {
  padding: 14px 16px;
  font-size: 13px;
}
</style>
