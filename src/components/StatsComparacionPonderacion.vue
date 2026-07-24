<template>
  <div class="card border border-slate-100 shadow-md p-6 overflow-hidden">
    <h4 class="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
      <span class="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 w-7 h-7 rounded-lg">
        <i class="ti ti-chart-bar text-xs"></i>
      </span>
      Análisis de Ponderación Cruzada
    </h4>

    <div class="flex flex-col gap-8">
      
      <!-- Métrica 1: Monto Percibido -->
      <div class="bg-slate-50 p-5 rounded-xl border border-slate-100/60">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Monto Total Percibido</span>
          <span class="text-[10px] text-slate-400 font-medium">Suma acumulada de honorarios</span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div 
            v-for="arb in comparacionData" 
            :key="'monto-' + arb.idArbitro"
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
                  width: getMetricShare(arb.totalMontoPercibido, 'totalMontoPercibido') + '%',
                  background: isMetricLeader(arb.idArbitro, 'totalMontoPercibido') 
                    ? 'linear-gradient(90deg, #10b981, #059669)' 
                    : 'linear-gradient(90deg, #64748b, #475569)'
                }"
              ></div>
            </div>
            <div class="w-24 text-right text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
              <span>{{ formatMonto(arb.totalMontoPercibido) }}</span>
              <span v-if="isMetricLeader(arb.idArbitro, 'totalMontoPercibido')" class="text-amber-500 text-[10px]" title="Líder honorarios">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métrica 2: Partidos Dirigidos -->
      <div class="bg-slate-50 p-5 rounded-xl border border-slate-100/60">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Partidos Dirigidos</span>
          <span class="text-[10px] text-slate-400 font-medium">Volumen de juego arbitrado</span>
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
              <span>{{ arb.totalPartidosDirigidos || 0 }}</span>
              <span v-if="isMetricLeader(arb.idArbitro, 'totalPartidosDirigidos')" class="text-amber-500 text-[10px]" title="Líder partidos dirigidos">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métrica 3: Promedio de Honorario por Partido -->
      <div class="bg-slate-50 p-5 rounded-xl border border-slate-100/60">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Promedio de Pago por Partido</span>
          <span class="text-[10px] text-slate-400 font-medium">Rentabilidad por partido arbitrado</span>
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
                  width: getMetricShare(getPromedioPago(arb), 'promedioPago') + '%',
                  background: isMetricLeader(arb.idArbitro, 'promedioPago') 
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                    : 'linear-gradient(90deg, #64748b, #475569)'
                }"
              ></div>
            </div>
            <div class="w-24 text-right text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
              <span>{{ formatMonto(getPromedioPago(arb)) }}</span>
              <span v-if="isMetricLeader(arb.idArbitro, 'promedioPago')" class="text-amber-500 text-[10px]" title="Líder promedio">⭐</span>
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

// Promedio de pago por partido
const getPromedioPago = (arb) => {
  if (!arb.totalPartidosDirigidos) return 0;
  return (arb.totalMontoPercibido || 0) / arb.totalPartidosDirigidos;
};

// Encontrar líderes
const isMetricLeader = (idArbitro, metric) => {
  let bestVal = -1;
  let bestId = null;

  for (const arb of props.comparacionData) {
    let val = 0;
    if (metric === "promedioPago") {
      val = getPromedioPago(arb);
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
  if (metric === "promedioPago") {
    totalSum = props.comparacionData.reduce((acc, curr) => acc + getPromedioPago(curr), 0);
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

const formatMonto = (valor) => {
  if (valor === undefined || valor === null) return "$0,00";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(valor);
};
</script>
