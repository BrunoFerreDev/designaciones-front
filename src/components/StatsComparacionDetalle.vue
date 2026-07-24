<template>
  <div :class="['grid gap-6 md:gap-8 lg:gap-10', gridColsClass]">
    <div 
      v-for="arb in comparacionData" 
      :key="'detalles-' + arb.idArbitro"
      class="card border border-slate-100 shadow-sm p-5 bg-white flex flex-col"
    >
      <!-- Cabecera de la Tarjeta de Detalle -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <h5 class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full" :style="getDotBg(arb.nombreCompleto)"></span>
          Cumplimiento y Estados
        </h5>
        <span class="text-[10px] text-slate-400 font-semibold">{{ arb.totalDesignaciones }} tot.</span>
      </div>

      <!-- Estados de Designaciones -->
      <div class="flex flex-col gap-3">
        <div v-for="(value, stateName) in getFilteredEstados(arb.designacionesPorEstado)" :key="stateName">
          <div class="flex justify-between items-center text-[10.5px] text-slate-600 mb-1">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: getEstadoColor(stateName) }"></span>
              {{ stateName }}
            </span>
            <span class="font-bold text-slate-700">
              {{ value }} 
              <span class="text-slate-400 font-normal">({{ getPercent(value, arb.totalDesignaciones) }}%)</span>
            </span>
          </div>
          <div class="progress-bar" style="height: 6px; margin-top: 0; background-color: #f1f5f9;">
            <div
              class="progress-fill transition-all duration-500"
              :style="{
                width: getPercent(value, arb.totalDesignaciones) + '%',
                backgroundColor: getEstadoColor(stateName)
              }"
            ></div>
          </div>
        </div>
        <div v-if="!arb.designacionesPorEstado || Object.keys(arb.designacionesPorEstado).length === 0" class="text-center py-4 text-xs text-slate-400">
          Sin datos de estados para este periodo.
        </div>
      </div>

      <!-- Timeline Historial Reciente de Partidos -->
      <div class="border-t border-slate-100 pt-5 mt-5 flex-1 flex flex-col">
        <h5 class="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
          <i class="ti ti-history text-slate-400"></i>
          Historial Reciente
        </h5>
        
        <div class="max-h-72 overflow-y-auto flex flex-col gap-2.5 pr-1.5 flex-1">
          <div v-if="!arb.designacionesDetalle || arb.designacionesDetalle.length === 0" class="text-center py-6 text-xs text-slate-400">
            Sin partidos registrados.
          </div>
          <div
            v-for="d in sortedDesignaciones(arb.designacionesDetalle)"
            :key="d.idDesignacion"
            class="bg-slate-50/70 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
          >
            <!-- Fila Cancha y Monto -->
            <div class="flex justify-between items-start font-bold text-slate-700">
              <span class="truncate max-w-[70%]" :title="d.nombreCancha">
                <i class="ti ti-map-pin text-[10px] text-slate-400 mr-0.5"></i> {{ d.nombreCancha }}
              </span>
              <span class="shrink-0 text-emerald-600">{{ formatMonto(d.montoPercibido) }}</span>
            </div>
            
            <!-- Fila Fecha y Rol -->
            <div class="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
              <span class="flex items-center gap-0.5">
                <i class="ti ti-calendar text-[10px]"></i> {{ formatDate(d.fecha) }}
              </span>
              <span class="badge badge-gray scale-90 origin-right px-1.5 py-0.2 capitalize">{{ getCategoryLabel(d.categoriaArbitroEnDesignacion) }}</span>
            </div>
            
            <!-- Fila Etapa y Estado -->
            <div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50">
              <span class="text-[9.5px] text-slate-500 capitalize italic">{{ getEtapaLabel(d.etapaCampeonato) }}</span>
              <span
                class="px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider"
                :style="{
                  backgroundColor: getEstadoBgColor(d.estadoDesignacion),
                  color: getEstadoColor(d.estadoDesignacion)
                }"
              >
                {{ d.estadoDesignacion }}
              </span>
            </div>

            <!-- Detalle Adicional -->
            <div v-if="d.detalle" class="mt-2 p-2 bg-white rounded border border-slate-100 text-[10px] text-slate-600 leading-relaxed break-words">
              <i class="ti ti-notes text-emerald-600 mr-1"></i>
              <strong>Nota:</strong> {{ d.detalle }}
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
  gridColsClass: {
    type: String,
    required: true,
  },
});

const getFilteredEstados = (estados) => {
  if (!estados) return {};
  return {
    Finalizada: estados.Finalizada || 0,
    Cancelada: estados.Cancelada || 0,
  };
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

const getPercent = (parcial, total) => {
  if (!total) return 0;
  return Math.round((parcial / total) * 100);
};

const getEstadoColor = (estado) => {
  const normalized = String(estado).toLowerCase();
  if (normalized.includes("finalizada") || normalized.includes("completa")) return "#0f6e56";
  if (normalized.includes("aceptada") || normalized.includes("pendiente")) return "#185fa5";
  if (normalized.includes("cancelada")) return "#ef4444";
  return "#64748b";
};

const getEstadoBgColor = (estado) => {
  const normalized = String(estado).toLowerCase();
  if (normalized.includes("finalizada") || normalized.includes("completa")) return "#e6f9f4";
  if (normalized.includes("aceptada") || normalized.includes("pendiente")) return "#f0f7ff";
  if (normalized.includes("cancelada")) return "#fef2f2";
  return "#f8fafc";
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

const getEtapaLabel = (etapa) => {
  if (!etapa) return "";
  return etapa.replace("_", " ").toLowerCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " " + d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return dateStr;
  }
};

const sortedDesignaciones = (list) => {
  if (!list) return [];
  return [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};
</script>
