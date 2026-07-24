<template>
  <div :class="['grid gap-6 md:gap-8 lg:gap-10', gridColsClass]">
    <div
      v-for="arb in comparacionData"
      :key="arb.idArbitro"
      class="flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden relative transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
    >
      <!-- Líder absoluto del grupo badge con corona -->
      <div
        v-if="isGlobalLeader(arb.idArbitro)"
        class="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-md animate-bounce"
        title="Líder global en estadísticas cruzadas"
        style="z-index: 10;"
      >
        👑
      </div>

      <!-- Gradiente superior decorativo -->
      <div 
        :style="getMiniHeaderGradient(arb.nombreCompleto)" 
        class="h-16 w-full opacity-90 relative"
      >
        <div style="position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px); background-size: 12px 12px;"></div>
      </div>

      <!-- Perfil del Árbitro -->
      <div class="px-5 pb-6 pt-0 text-center relative -mt-10 flex-1 flex flex-col items-center">
        <!-- Avatar circular -->
        <div
          :style="getAvatarStyle(arb.nombreCompleto)"
          class="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md border-4 border-white mb-3"
        >
          {{ getInitials(arb.nombreCompleto) }}
        </div>

        <h4 class="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors leading-tight px-1" :title="arb.nombreCompleto">
          {{ arb.nombreCompleto }}
        </h4>
        
        <div class="mt-2 flex gap-1">
          <span class="badge text-[10px] uppercase font-bold tracking-wider px-2 py-0.5" :class="getCategoryBadge(arb.idArbitro)">
            {{ getCategoryLabel(getArbitroCategory(arb.idArbitro)) }}
          </span>
        </div>

        <!-- Resumen de Métricas -->
        <div class="grid grid-cols-3 gap-3 w-full mt-6 pt-5 border-t border-slate-100">
          <div class="text-center">
            <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Partidos</span>
            <span class="text-sm font-bold text-slate-700 block mt-0.5">{{ arb.totalPartidosDirigidos || 0 }}</span>
          </div>
          <div class="text-center border-x border-slate-100">
            <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Desig.</span>
            <span class="text-sm font-bold text-slate-700 block mt-0.5">{{ arb.totalDesignaciones || 0 }}</span>
          </div>
          <div class="text-center">
            <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Efec.</span>
            <span class="text-sm font-bold text-slate-700 block mt-0.5">
              {{ getPercent(arb.designacionesPorEstado?.Finalizada || 0, arb.totalDesignaciones) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  comparacionData: {
    type: Array,
    required: true,
  },
  listaArbitros: {
    type: Array,
    required: true,
  },
  gridColsClass: {
    type: String,
    required: true,
  },
});

const getArbitroCategory = (id) => {
  const a = props.listaArbitros.find((arb) => arb.idArbitro === id);
  return a ? a.categoria : "INICIAL";
};

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

const isGlobalLeader = (idArbitro) => {
  const metrics = ["totalMontoPercibido", "totalPartidosDirigidos", "totalDesignaciones", "promedioPago"];
  let leadersCount = 0;
  for (const m of metrics) {
    if (isMetricLeader(idArbitro, m)) {
      leadersCount++;
    }
  }
  return leadersCount >= 2;
};

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColors = (name) => {
  if (!name) return ["#64748b", "#475569"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    ["#3b82f6", "#1d4ed8"], // azul
    ["#10b981", "#047857"], // verde
    ["#f59e0b", "#b45309"], // naranja
    ["#ec4899", "#be185d"], // rosa
    ["#8b5cf6", "#6d28d9"], // violeta
    ["#f43f5e", "#be123c"], // rojo
    ["#06b6d4", "#0891b2"], // cian
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getAvatarStyle = (name) => {
  const [c1, c2] = getAvatarColors(name);
  return `background: linear-gradient(135deg, ${c1}, ${c2});`;
};

const getMiniHeaderGradient = (name) => {
  const [c1] = getAvatarColors(name);
  return `background: linear-gradient(180deg, ${c1}1a, ${c1}03); border-bottom: 1px solid ${c1}15;`;
};

const getPercent = (parcial, total) => {
  if (!total) return 0;
  return Math.round((parcial / total) * 100);
};

const getCategoryLabel = (cat) => {
  const map = {
    ELITE: "Elite",
    AVANZADO: "Avanzado",
    INTERMEDIO_ALTO: "Intermedio Alto",
    INTERMEDIO: "Intermedio",
    INTERMEDIO_BAJO: "Intermedio Bajo",
    EN_FORMACION: "En Formación",
    INICIAL: "Inicial",
    ASISTENTE: "Asistente",
  };
  return map[cat] || cat || "Inicial";
};

const getCategoryBadge = (id) => {
  const cat = getArbitroCategory(id);
  const map = {
    ELITE: "badge-green",
    AVANZADO: "badge-blue",
    INTERMEDIO_ALTO: "badge-blue",
    INTERMEDIO: "badge-amber",
    INTERMEDIO_BAJO: "badge-amber",
    EN_FORMACION: "badge-gray",
    INICIAL: "badge-red",
    ASISTENTE: "badge-gray",
  };
  return map[cat] || "badge-gray";
};
</script>
