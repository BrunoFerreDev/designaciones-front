<template>
  <div
    class="card border border-slate-100 shadow-sm p-6 flex flex-col justify-between"
  >
    <div>
      <!-- Cabecera -->
      <div
        class="card-header border-b border-slate-100 pb-3.5 mb-5 flex justify-between items-center"
      >
        <div>
          <h4
            class="card-title text-sm font-bold text-slate-800 flex items-center gap-2"
          >
            <i class="ti ti-map-pin text-emerald-600"></i>
            Canchas Habituales
          </h4>
          <div class="card-sub text-xs text-slate-400 mt-0.5">
            Predios y detalles de designación
          </div>
        </div>
        <span class="badge badge-gray text-[10px]">
          {{ totalElementos }} {{ totalElementos === 1 ? "cancha" : "canchas" }}
        </span>
      </div>

      <!-- Listado de Canchas -->
      <div class="flex flex-col gap-5 py-2">
        <div
          v-for="c in canchasList"
          :key="c.idCancha || c.nombreCancha"
          class="group"
        >
          <div
            class="flex justify-between items-start text-xs font-semibold text-slate-700 mb-2 gap-2"
          >
            <div class="truncate max-w-[65%]">
              <span class="truncate block text-slate-800" :title="c.nombreCancha">
                {{ c.nombreCancha }}
              </span>
            </div>

            <div class="text-right shrink-0">
              <span class="text-emerald-700 font-bold text-xs block">
                {{ c.totalDesignaciones }} desig.
                <span
                  v-if="c.totalDesignacionesFinalizadas > 0"
                  class="text-slate-400 font-normal"
                >
                  ({{ c.totalDesignacionesFinalizadas }} fin.)
                </span>
              </span>
              <span
                v-if="c.totalPartidos > 0"
                class="text-[11px] font-normal text-slate-400 block mt-0.5"
              >
                {{ c.totalPartidos }} partidos
              </span>
            </div>
          </div>

          <!-- Barra de Progreso -->
          <div
            class="progress-bar rounded-full"
            style="height: 8px; margin-top: 6px; background-color: #f1f5f9; border-radius: 9999px"
          >
            <div
              class="progress-fill bg-emerald-500 rounded-full transition-all duration-300"
              :style="{
                width:
                  getPorcentaje(c.totalDesignaciones, totalDesignaciones) + '%',
                borderRadius: '9999px',
              }"
            ></div>
          </div>
        </div>

        <div
          v-if="canchasList.length === 0"
          class="text-xs text-slate-400 text-center py-10"
        >
          Sin designaciones en canchas para este período.
        </div>
      </div>
    </div>

    <!-- Paginación de Canchas -->
    <div
      v-if="totalPages > 1"
      class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
    >
      <span class="text-slate-400">
        Pág. {{ currentPage + 1 }} de {{ totalPages }}
      </span>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="btn flex items-center justify-center p-1 w-7 h-7 rounded border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          :disabled="currentPage <= 0"
          @click="$emit('change-page', currentPage - 1)"
          title="Página anterior"
        >
          <i class="ti ti-chevron-left"></i>
        </button>

        <button
          type="button"
          class="btn flex items-center justify-center p-1 w-7 h-7 rounded border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          :disabled="currentPage >= totalPages - 1"
          @click="$emit('change-page', currentPage + 1)"
          title="Página siguiente"
        >
          <i class="ti ti-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { getPorcentaje } from "../../composables/useArbitroStatsFormatters";

const props = defineProps({
  estadisticasCanchas: {
    type: [Object, Array],
    default: () => [],
  },
  totalDesignaciones: {
    type: Number,
    default: 0,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["change-page"]);

// Lista plana de canchas desde Page o Array
const canchasList = computed(() => {
  if (!props.estadisticasCanchas) return [];
  if (Array.isArray(props.estadisticasCanchas)) {
    return [...props.estadisticasCanchas].sort(
      (a, b) => (b.totalDesignaciones || 0) - (a.totalDesignaciones || 0),
    );
  }
  return props.estadisticasCanchas.content || [];
});

// Número de página actual (0-indexed)
const currentPage = computed(() => {
  if (
    props.estadisticasCanchas &&
    typeof props.estadisticasCanchas === "object" &&
    !Array.isArray(props.estadisticasCanchas)
  ) {
    return (
      props.estadisticasCanchas.number ??
      props.estadisticasCanchas.pageable?.pageNumber ??
      0
    );
  }
  return 0;
});

// Total de páginas
const totalPages = computed(() => {
  if (
    props.estadisticasCanchas &&
    typeof props.estadisticasCanchas === "object" &&
    !Array.isArray(props.estadisticasCanchas)
  ) {
    return props.estadisticasCanchas.totalPages || 1;
  }
  return 1;
});

// Total de elementos
const totalElementos = computed(() => {
  if (
    props.estadisticasCanchas &&
    typeof props.estadisticasCanchas === "object" &&
    !Array.isArray(props.estadisticasCanchas)
  ) {
    return props.estadisticasCanchas.totalElements ?? canchasList.value.length;
  }
  return canchasList.value.length;
});
</script>
