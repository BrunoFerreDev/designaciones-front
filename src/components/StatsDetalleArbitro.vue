<template>
  <div>
    <!-- Selector de Árbitro -->
    <div
      class="card border border-slate-100 shadow-sm"
      style="margin-bottom: 1.25rem"
    >
      <div class="form-group" style="margin-bottom: 0">
        <label class="form-label" style="font-weight: 500; margin-bottom: 6px"
          >Seleccionar Árbitro</label
        >
        <select
          :value="selectedArbitroId"
          @change="$emit('update:selectedArbitroId', $event.target.value)"
          class="form-input"
          style="height: 38px"
        >
          <option value="" disabled>
            Seleccione un árbitro para ver sus estadísticas...
          </option>
          <option
            v-for="a in listaArbitros"
            :key="a.idArbitro"
            :value="a.idArbitro"
          >
            {{ a.apellido }}, {{ a.nombre }} ({{
              getCategoryLabel(a.categoria)
            }})
          </option>
        </select>
      </div>
    </div>

    <!-- Empty State (No seleccionado) -->
    <div
      v-if="!selectedArbitroId"
      class="empty-state card border border-slate-100 shadow-sm text-center py-8 animate-fade-in"
    >
      <div
        class="empty-icon"
        style="
          font-size: 40px;
          color: var(--color-text-secondary);
          margin-bottom: 10px;
        "
      >
        <i class="ti ti-users"></i>
      </div>
      <p class="font-medium text-slate-700">
        Por favor, selecciona un árbitro para ver su reporte detallado.
      </p>
      <p class="text-xs text-slate-400 mt-1">
        También puedes acceder haciendo clic en "Ver detalle" desde la lista en
        el Resumen Global.
      </p>

      <div v-if="arbitrosRapidos && arbitrosRapidos.length > 0" class="mt-4">
        <span class="text-xs text-slate-500 font-semibold block mb-2"
          >Árbitros activos sugeridos:</span
        >
        <div class="flex justify-center gap-2 flex-wrap">
          <button
            v-for="a in arbitrosRapidos"
            :key="a.idArbitro"
            class="btn"
            style="padding: 5px 12px; font-size: 12px"
            @click="
              $emit(
                'seleccionar-arbitro',
                a.idArbitro,
                `${a.nombre} ${a.apellido}`,
              )
            "
          >
            {{ a.nombre }} {{ a.apellido }}
          </button>
        </div>
      </div>
    </div>

    <!-- Cargando detalle -->
    <div v-else-if="cargandoDetalle" class="empty-state">
      <div
        class="spinner animate-spin"
        style="
          border: 3px solid #f3f3f3;
          border-top: 3px solid #1d9e75;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          margin: 0 auto 10px;
        "
      ></div>
      Cargando historial del árbitro...
    </div>

    <!-- Datos del Árbitro -->
    <div v-else class="animate-fade-in">
      <!-- Info y Wallet -->
      <div class="stats-row">
        <!-- Wallet Card (Premium Style) -->
        <div
          class="stat-card border-none shadow-md text-white flex flex-col justify-between"
          style="
            background: linear-gradient(135deg, #10b981, #047857);
            padding: 1.25rem;
            min-height: 110px;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
          "
        >
          <div class="flex justify-between items-start z-10">
            <span
              class="text-emerald-100 text-xs font-semibold uppercase tracking-wider"
              >Monto Total Percibido</span
            >
            <i
              class="ti ti-wallet text-emerald-200"
              style="font-size: 22px"
            ></i>
          </div>
          <div
            class="stat-num text-left z-10 text-white"
            style="font-size: 28px; font-weight: 700; margin-top: 10px"
          >
            {{ formatMonto(stats.totalMontoPercibido) }}
          </div>
          <!-- Círculos decorativos premium de fondo -->
          <div
            style="
              position: absolute;
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.05);
              top: -20px;
              right: -30px;
            "
          ></div>
          <div
            style="
              position: absolute;
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.03);
              bottom: -20px;
              left: -10px;
            "
          ></div>
        </div>

        <!-- Partidos Dirigidos -->
        <div
          class="stat-card border border-slate-100 shadow-sm flex flex-col justify-between"
          style="padding: 1.25rem"
        >
          <span
            class="text-slate-400 text-xs font-semibold uppercase tracking-wider text-left"
            >Partidos Dirigidos</span
          >
          <div
            class="stat-num text-slate-800 text-left"
            style="font-size: 28px; font-weight: 700; margin-top: 10px"
          >
            {{ stats.totalPartidosDirigidos || 0 }}
          </div>
        </div>

        <!-- Total Designaciones -->
        <div
          class="stat-card border border-slate-100 shadow-sm flex flex-col justify-between"
          style="padding: 1.25rem"
        >
          <span
            class="text-slate-400 text-xs font-semibold uppercase tracking-wider text-left"
            >Designaciones Totales</span
          >
          <div
            class="stat-num text-slate-800 text-left"
            style="font-size: 28px; font-weight: 700; margin-top: 10px"
          >
            {{ stats.totalDesignaciones || 0 }}
          </div>
        </div>

        <!-- Promedio por Partido -->
        <div
          class="stat-card border border-slate-100 shadow-sm flex flex-col justify-between"
          style="padding: 1.25rem"
        >
          <span
            class="text-slate-400 text-xs font-semibold uppercase tracking-wider text-left"
            >Promedio por Partido</span
          >
          <div
            class="stat-num text-slate-800 text-left"
            style="font-size: 28px; font-weight: 700; margin-top: 10px"
          >
            {{ formatMonto(promedioPorPartido) }}
          </div>
        </div>
      </div>

      <!-- Grids de Detalle -->
      <div class="grid-3" style="margin-top: 1.25rem">
        <!-- Uso de Canchas -->
        <div class="card border border-slate-100 shadow-sm">
          <div
            class="card-header"
            style="
              border-bottom: 0.5px solid var(--color-border-tertiary);
              padding-bottom: 10px;
              margin-bottom: 12px;
            "
          >
            <div>
              <div class="card-title">Canchas Habituales</div>
              <div class="card-sub">
                Canchas donde más ha dirigido en este período
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-3.5 py-1">
            <div
              v-for="c in stats.estadisticasCanchas"
              :key="c.idCancha || c.nombreCancha"
            >
              <div
                class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1"
              >
                <span>{{ c.nombreCancha }}</span>
                <span class="text-emerald-600 capitalize"
                  >{{ c.totalDesignaciones }}
                  {{
                    c.totalDesignaciones === 1 ? "designación" : "designaciones"
                  }}</span
                >
              </div>
              <div class="progress-bar" style="height: 6px; margin-top: 0">
                <div
                  class="progress-fill"
                  :style="{
                    width:
                      getPorcentaje(
                        c.totalPartidos,
                        stats.totalPartidosDirigidos,
                      ) + '%',
                  }"
                ></div>
              </div>
            </div>
            <div
              v-if="
                !stats.estadisticasCanchas ||
                stats.estadisticasCanchas.length === 0
              "
              class="text-xs text-slate-400 text-center py-4"
            >
              Sin partidos registrados en canchas.
            </div>
          </div>
        </div>

        <!-- Distribución por Estado -->
        <div class="card border border-slate-100 shadow-sm">
          <div
            class="card-header"
            style="
              border-bottom: 0.5px solid var(--color-border-tertiary);
              padding-bottom: 10px;
              margin-bottom: 12px;
            "
          >
            <div>
              <div class="card-title">Estados de Designación</div>
              <div class="card-sub">
                Cumplimiento del árbitro en las asignaciones
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-3.5 py-1">
            <div
              v-for="(value, key) in stats.designacionesPorEstado"
              :key="key"
            >
              <div
                class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1"
              >
                <span class="capitalize flex items-center gap-1.5">
                  <span
                    class="w-2.5 h-2.5 rounded-full"
                    :style="{ backgroundColor: getEstadoColor(key) }"
                  ></span>
                  {{ key }}
                </span>
                <span
                  >{{ value }} ({{
                    getPorcentaje(value, stats.totalDesignaciones)
                  }}%)</span
                >
              </div>
              <div class="progress-bar" style="height: 6px; margin-top: 0">
                <div
                  class="progress-fill"
                  :style="{
                    width: getPorcentaje(value, stats.totalDesignaciones) + '%',
                    backgroundColor: getEstadoColor(key),
                  }"
                ></div>
              </div>
            </div>
            <div
              v-if="
                !stats.designacionesPorEstado ||
                Object.keys(stats.designacionesPorEstado).length === 0
              "
              class="text-xs text-slate-400 text-center py-4"
            >
              Sin datos de estados.
            </div>
          </div>
        </div>

        <!-- Distribución por Categoría de Partido -->
        <div class="card border border-slate-100 shadow-sm">
          <div
            class="card-header"
            style="
              border-bottom: 0.5px solid var(--color-border-tertiary);
              padding-bottom: 10px;
              margin-bottom: 12px;
            "
          >
            <div>
              <div class="card-title">Partidos por Categoría</div>
              <div class="card-sub">
                Nivel de los partidos dirigidos en el período
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-3.5 py-1">
            <div
              v-for="(value, key) in stats.designacionesPorCategoria"
              :key="key"
            >
              <div
                class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1"
              >
                <span class="badge" :class="getCategoryBadgeClass(key)">{{
                  getCategoryLabel(key)
                }}</span>
                <span>{{ value }} partidos</span>
              </div>
              <div class="progress-bar" style="height: 6px; margin-top: 0">
                <div
                  class="progress-fill"
                  :class="getCategoryProgressBarClass(key)"
                  :style="{
                    width:
                      getPorcentaje(value, stats.totalPartidosDirigidos) + '%',
                  }"
                ></div>
              </div>
            </div>
            <div
              v-if="
                !stats.designacionesPorCategoria ||
                Object.keys(stats.designacionesPorCategoria).length === 0
              "
              class="text-xs text-slate-400 text-center py-4"
            >
              Sin categorías registradas.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
  selectedArbitroId: {
    type: [Number, String],
    required: true,
  },
  listaArbitros: {
    type: Array,
    required: true,
  },
  cargandoDetalle: {
    type: Boolean,
    default: false,
  },
  arbitrosRapidos: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:selectedArbitroId", "seleccionar-arbitro"]);

// Promedio de pago por partido
const promedioPorPartido = computed(() => {
  if (!props.stats || !props.stats.totalPartidosDirigidos) return 0;
  return (
    (props.stats.totalMontoPercibido || 0) / props.stats.totalPartidosDirigidos
  );
});

// Formatear montos a moneda local
const formatMonto = (valor) => {
  if (valor === undefined || valor === null) return "$0,00";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(valor);
};

// Calcular porcentajes redondeados
const getPorcentaje = (parcial, total) => {
  if (!total) return 0;
  return Math.round((parcial / total) * 100);
};

// Obtener colores por estado
const getEstadoColor = (estado) => {
  const normalized = String(estado).toLowerCase();
  if (normalized.includes("incompleta")) return "#993c1d";
  if (normalized.includes("completa")) return "#0f6e56";
  if (normalized.includes("finalizada")) return "#185fa5";
  return "#64748b";
};

// Labels para categorías
const getCategoryLabel = (cat) => {
  const map = {
    ELITE: "Elite",
    AVANZADO: "Avanzado",
    INTERMEDIO_ALTO: "Intermedio Alto",
    INTERMEDIO: "Intermedio",
    INTERMEDIO_BAJO: "Intermedio Bajo",
    EN_FORMACION: "En Formación",
    INICIAL: "Inicial",
  };
  return map[cat] || cat || "Inicial";
};

// Badges de categorías
const getCategoryBadgeClass = (cat) => {
  const map = {
    ELITE: "badge-green",
    AVANZADO: "badge-blue",
    INTERMEDIO_ALTO: "badge-blue",
    INTERMEDIO: "badge-amber",
    INTERMEDIO_BAJO: "badge-amber",
    EN_FORMACION: "badge-gray",
    INICIAL: "badge-red",
  };
  return map[cat] || "badge-gray";
};

// Progress bars de categorías
const getCategoryProgressBarClass = (cat) => {
  const map = {
    ELITE: "bg-emerald-600",
    AVANZADO: "bg-blue-600",
    INTERMEDIO_ALTO: "bg-cyan-600",
    INTERMEDIO: "bg-amber-500",
    INTERMEDIO_BAJO: "bg-orange-400",
    EN_FORMACION: "bg-slate-400",
    INICIAL: "bg-rose-500",
  };
  return map[cat] || "bg-slate-400";
};
</script>

<style scoped>
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #1d9e75;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
