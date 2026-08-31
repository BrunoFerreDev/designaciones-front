<template>
  <div class="card border border-slate-100 shadow-md p-6 overflow-hidden">
    <h4 class="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
      <span class="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 w-7 h-7 rounded-lg">
        <i class="ti ti-chart-bar text-xs"></i>
      </span>
      Análisis de Ponderación y Distribución
    </h4>

    <div class="flex flex-col gap-8">
      
      <!-- Métrica 1: Total Designaciones -->
      <div class="bg-slate-50 p-5 rounded-xl border border-slate-100/60">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Designaciones (Jornadas)</span>
          <span class="text-[10px] text-slate-400 font-medium">Cantidad de fechas asignadas</span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div 
            v-for="arb in comparacionData" 
            :key="'desig-' + arb.idArbitro"
            class="flex items-center gap-3"
          >
            <div class="w-1/3 text-xs text-slate-700 font-medium truncate flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full shrink-0" :style="getDotBg(arb.nombreCompleto)"></span>
              <span class="truncate" :title="arb.nombreCompleto">{{ arb.nombreCompleto }}</span>
            </div>
            <div class="flex-1 bg-slate-200/60 h-3 rounded-full overflow-hidden relative">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :style="{ 
                  width: getMetricShare(arb.totalDesignaciones, 'totalDesignaciones') + '%',
                  background: isMetricLeader(arb.idArbitro, 'totalDesignaciones') 
                    ? 'linear-gradient(90deg, #8b5cf6, #6d28d9)' 
                    : 'linear-gradient(90deg, #64748b, #475569)'
                }"
              ></div>
            </div>
            <div class="w-24 text-right text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
              <span>{{ arb.totalDesignaciones || 0 }} desig.</span>
              <span v-if="isMetricLeader(arb.idArbitro, 'totalDesignaciones')" class="text-amber-500 text-[10px]" title="Líder designaciones">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métrica 2: Partidos Dirigidos -->
      <div class="bg-slate-50 p-5 rounded-xl border border-slate-100/60">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Partidos Dirigidos</span>
          <span class="text-[10px] text-slate-400 font-medium">Volumen total de partidos dirigidos</span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div 
            v-for="arb in comparacionData" 
            :key="'partidos-' + arb.idArbitro"
            class="flex items-center gap-3"
          >
            <div class="w-1/3 text-xs text-slate-700 font-medium truncate flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full shrink-0" :style="getDotBg(arb.nombreCompleto)"></span>
              <span class="truncate" :title="arb.nombreCompleto">{{ arb.nombreCompleto }}</span>
            </div>
            <div class="flex-1 bg-slate-200/60 h-3 rounded-full overflow-hidden relative">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :style="{ 
                  width: getMetricShare(arb.totalPartidosDirigidos, 'totalPartidosDirigidos') + '%',
                  background: isMetricLeader(arb.idArbitro, 'totalPartidosDirigidos') 
                    ? 'linear-gradient(90deg, #3b82f6, #2563eb)' 
                    : 'linear-gradient(90deg, #64748b, #475569)'
                }"
              ></div>
            </div>
            <div class="w-24 text-right text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
              <span>{{ arb.totalPartidosDirigidos || 0 }} part.</span>
              <span v-if="isMetricLeader(arb.idArbitro, 'totalPartidosDirigidos')" class="text-amber-500 text-[10px]" title="Líder partidos dirigidos">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métrica 3: Promedio de Partidos por Designación -->
      <div class="bg-slate-50 p-5 rounded-xl border border-slate-100/60">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Promedio Partidos / Designación</span>
          <span class="text-[10px] text-slate-400 font-medium">Intensidad y carga por jornada</span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div 
            v-for="arb in comparacionData" 
            :key="'promedio-' + arb.idArbitro"
            class="flex items-center gap-3"
          >
            <div class="w-1/3 text-xs text-slate-700 font-medium truncate flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full shrink-0" :style="getDotBg(arb.nombreCompleto)"></span>
              <span class="truncate" :title="arb.nombreCompleto">{{ arb.nombreCompleto }}</span>
            </div>
            <div class="flex-1 bg-slate-200/60 h-3 rounded-full overflow-hidden relative">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :style="{ 
                  width: getMetricShare(getPromedioPartidos(arb), 'promedioPartidos') + '%',
                  background: isMetricLeader(arb.idArbitro, 'promedioPartidos') 
                    ? 'linear-gradient(90deg, #10b981, #059669)' 
                    : 'linear-gradient(90deg, #64748b, #475569)'
                }"
              ></div>
            </div>
            <div class="w-24 text-right text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
              <span>{{ getPromedioPartidos(arb).toFixed(1) }} p/d</span>
              <span v-if="isMetricLeader(arb.idArbitro, 'promedioPartidos')" class="text-amber-500 text-[10px]" title="Líder promedio por jornada">⭐</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  comparacionData: {
    type: Array,
    required: true,
  },
});

// Promedio partidos por designacion
const getPromedioPartidos = (arb) => {
  if (!arb.totalDesignaciones) return 0;
  return (arb.totalPartidosDirigidos || 0) / arb.totalDesignaciones;
};

// Encontrar líderes
const isMetricLeader = (idArbitro, metric) => {
  let bestVal = -1;
  let bestId = null;

  for (const arb of props.comparacionData) {
    let val = 0;
    if (metric === "promedioPartidos") {
      val = getPromedioPartidos(arb);
    } else {
      val = arb[metric] || 0;
    }

    if (val > bestVal) {
      bestVal = val;
      bestId = arb.idArbitro;
    }
  }

  if (bestVal <= 0) return false;
  return bestId === idArbitro;
};

// Obtiene el porcentaje de aporte de la métrica individual
const getMetricShare = (value, metric) => {
  let totalSum = 0;
  if (metric === "promedioPartidos") {
    totalSum = props.comparacionData.reduce((acc, curr) => acc + getPromedioPartidos(curr), 0);
  } else {
    totalSum = props.comparacionData.reduce((acc, curr) => acc + (curr[metric] || 0), 0);
  }

  if (!totalSum) return 0;
  return Math.round((value / totalSum) * 100);
};

const getAvatarColors = (name) => {
  if (!name) return ["#64748b", "#475569"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    ["#3b82f6", "#1d4ed8"],
    ["#10b981", "#047857"],
    ["#f59e0b", "#b45309"],
    ["#ec4899", "#be185d"],
    ["#8b5cf6", "#6d28d9"],
    ["#f43f5e", "#be123c"],
    ["#06b6d4", "#0891b2"],
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getDotBg = (name) => {
  const [c1] = getAvatarColors(name);
  return `background-color: ${c1};`;
};
</script>
