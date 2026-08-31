<template>
  <div class="card border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
    <div>
      <div class="card-header border-b border-slate-100 pb-3.5 mb-5">
        <h4 class="card-title text-sm font-bold text-slate-800 flex items-center gap-2">
          <i class="ti ti-checkbox text-blue-600"></i>
          Estados de Designación
        </h4>
        <div class="card-sub text-xs text-slate-400 mt-0.5">
          Cumplimiento en las asignaciones
        </div>
      </div>

      <div class="flex flex-col gap-5 py-2">
        <div v-for="item in estadosProcesados" :key="item.estado">
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
            <span class="capitalize flex items-center gap-2">
              <span
                class="w-3 h-3 rounded-full shrink-0"
                :style="{ backgroundColor: getEstadoColor(item.estado) }"
              ></span>
              <span class="text-slate-800">{{ item.estado }}</span>
            </span>
            <span class="font-bold text-xs text-slate-800">
              {{ item.cantidad }}
              <span class="text-slate-400 font-normal">
                ({{ getPorcentaje(item.cantidad, totalDesignaciones) }}%)
              </span>
            </span>
          </div>
          <div
            class="progress-bar rounded-full"
            style="height: 8px; margin-top: 6px; background-color: #f1f5f9; border-radius: 9999px"
          >
            <div
              class="progress-fill rounded-full transition-all duration-300"
              :style="{
                width: getPorcentaje(item.cantidad, totalDesignaciones) + '%',
                backgroundColor: getEstadoColor(item.estado),
                borderRadius: '9999px',
              }"
            ></div>
          </div>
        </div>

        <div
          v-if="estadosProcesados.length === 0"
          class="text-xs text-slate-400 text-center py-10"
        >
          Sin datos de estados para este rango.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { getEstadoColor, getPorcentaje } from "../../composables/useArbitroStatsFormatters";

const props = defineProps({
  designacionesPorEstado: {
    type: Object,
    default: () => ({}),
  },
  totalDesignaciones: {
    type: Number,
    default: 0,
  },
});

const estadosProcesados = computed(() => {
  if (!props.designacionesPorEstado) return [];
  return Object.entries(props.designacionesPorEstado)
    .map(([estado, cantidad]) => ({ estado, cantidad }))
    .filter((item) => item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad);
});
</script>
