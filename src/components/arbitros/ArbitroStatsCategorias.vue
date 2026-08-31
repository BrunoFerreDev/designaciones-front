<template>
  <div class="card border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
    <div>
      <div class="card-header border-b border-slate-100 pb-3.5 mb-5">
        <h4 class="card-title text-sm font-bold text-slate-800 flex items-center gap-2">
          <i class="ti ti-trophy text-amber-500"></i>
          Nivel de Partidos Dirigidos
        </h4>
        <div class="card-sub text-xs text-slate-400 mt-0.5">
          Distribución según categoría asignada
        </div>
      </div>

      <div class="flex flex-col gap-5 py-2">
        <div v-for="item in categoriasProcesadas" :key="item.categoria">
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
            <span class="badge px-2.5 py-0.5 text-xs" :class="getCategoryBadgeClass(item.categoria)">
              {{ getCategoryLabel(item.categoria) }}
            </span>
            <span class="font-bold text-xs text-slate-800">
              {{ item.cantidad }} {{ item.cantidad === 1 ? 'designación' : 'designaciones' }}
            </span>
          </div>
          <div
            class="progress-bar rounded-full"
            style="height: 8px; margin-top: 6px; background-color: #f1f5f9; border-radius: 9999px"
          >
            <div
              class="progress-fill rounded-full transition-all duration-300"
              :class="getCategoryProgressBarClass(item.categoria)"
              :style="{
                width: getPorcentaje(item.cantidad, totalDesignaciones) + '%',
                borderRadius: '9999px',
              }"
            ></div>
          </div>
        </div>

        <div
          v-if="categoriasProcesadas.length === 0"
          class="text-xs text-slate-400 text-center py-10"
        >
          Sin categorías registradas en este período.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  getCategoryLabel,
  getCategoryBadgeClass,
  getCategoryProgressBarClass,
  getPorcentaje,
} from "../../composables/useArbitroStatsFormatters";

const props = defineProps({
  designacionesPorCategoria: {
    type: Object,
    default: () => ({}),
  },
  totalDesignaciones: {
    type: Number,
    default: 0,
  },
});

const categoriasProcesadas = computed(() => {
  if (!props.designacionesPorCategoria) return [];
  return Object.entries(props.designacionesPorCategoria)
    .map(([categoria, cantidad]) => ({ categoria, cantidad }))
    .filter((item) => item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad);
});
</script>
