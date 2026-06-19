<template>
  <div>
    <!-- KPIs principales -->
    <div class="stats-row">
      <div class="stat-card border border-slate-100 shadow-sm">
        <div class="stat-num stat-green">{{ stats.totalDesignaciones || 0 }}</div>
        <div class="stat-label">Total Designaciones</div>
      </div>
      <div class="stat-card border border-slate-100 shadow-sm">
        <div class="stat-num stat-blue">{{ stats.totalPartidosDirigidos || 0 }}</div>
        <div class="stat-label">Partidos Dirigidos</div>
      </div>
      <div class="stat-card border border-slate-100 shadow-sm">
        <div class="stat-num text-purple-600">{{ stats.estadisticasCanchas?.length || 0 }}</div>
        <div class="stat-label">Canchas Activas</div>
      </div>
      <div class="stat-card border border-slate-100 shadow-sm">
        <div class="stat-num text-amber-600">{{ stats.estadisticasArbitros?.length || 0 }}</div>
        <div class="stat-label">Árbitros con Partidos</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 1.25rem;">
      <!-- Estados de las Designaciones -->
      <div class="card border border-slate-100 shadow-sm">
        <div class="card-header" style="border-bottom: 0.5px solid var(--color-border-tertiary); padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <div class="card-title">Designaciones por Estado</div>
            <div class="card-sub">Proporción del estado actual de las designaciones</div>
          </div>
        </div>
        <div class="flex flex-col gap-4 py-2">
          <div v-for="(value, key) in stats.designacionesPorEstado" :key="key">
            <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <span class="capitalize flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getEstadoColor(key) }"></span>
                {{ key }}
              </span>
              <span>{{ value }} ({{ getPorcentaje(value, stats.totalDesignaciones) }}%)</span>
            </div>
            <div class="progress-bar" style="height: 8px;">
              <div class="progress-fill" :style="{ width: getPorcentaje(value, stats.totalDesignaciones) + '%', backgroundColor: getEstadoColor(key) }"></div>
            </div>
          </div>
          <div v-if="!stats.designacionesPorEstado || Object.keys(stats.designacionesPorEstado).length === 0" class="text-xs text-slate-400 text-center py-4">
            No hay datos disponibles para este rango.
          </div>
        </div>
      </div>

      <!-- Categoría de Árbitros -->
      <div class="card border border-slate-100 shadow-sm">
        <div class="card-header" style="border-bottom: 0.5px solid var(--color-border-tertiary); padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <div class="card-title">Designaciones por Categoría de Árbitro</div>
            <div class="card-sub">Cantidad de designaciones según categoría del árbitro</div>
          </div>
        </div>
        <div class="flex flex-col gap-4 py-2">
          <div v-for="(value, key) in stats.designacionesPorCategoriaArbitro" :key="key">
            <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <span class="badge" :class="getCategoryBadgeClass(key)">{{ getCategoryLabel(key) }}</span>
              <span>{{ value }} designaciones</span>
            </div>
            <div class="progress-bar" style="height: 8px;">
              <div class="progress-fill" :class="getCategoryProgressBarClass(key)" :style="{ width: getPorcentaje(value, stats.totalDesignaciones) + '%' }"></div>
            </div>
          </div>
          <div v-if="!stats.designacionesPorCategoriaArbitro || Object.keys(stats.designacionesPorCategoriaArbitro).length === 0" class="text-xs text-slate-400 text-center py-4">
            No hay datos disponibles para este rango.
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Uso de Canchas -->
      <div class="card border border-slate-100 shadow-sm">
        <div class="card-header" style="border-bottom: 0.5px solid var(--color-border-tertiary); padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <div class="card-title">Canchas más Utilizadas</div>
            <div class="card-sub">Frecuencia de designaciones y partidos por predio</div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="des-table">
            <thead>
              <tr>
                <th>Cancha</th>
                <th>Designaciones</th>
                <th>Partidos</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in stats.estadisticasCanchas" :key="c.idCancha || c.nombreCancha">
                <td class="font-medium text-slate-800">{{ c.nombreCancha }}</td>
                <td>{{ c.totalDesignaciones }}</td>
                <td><span class="badge badge-blue">{{ c.totalPartidos }}</span></td>
                <td style="width: 120px;">
                  <div class="flex items-center gap-2">
                    <div class="progress-bar flex-1" style="height: 6px; margin-top: 0;">
                      <div class="progress-fill" :style="{ width: getPorcentaje(c.totalPartidos, stats.totalPartidosDirigidos) + '%' }"></div>
                    </div>
                    <span class="text-[10px] text-slate-500 font-semibold">{{ getPorcentaje(c.totalPartidos, stats.totalPartidosDirigidos) }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!stats.estadisticasCanchas || stats.estadisticasCanchas.length === 0">
                <td colspan="4" class="text-center text-slate-400 py-4">No hay datos de canchas disponibles.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ranking / Buscador de Árbitros -->
      <div class="card border border-slate-100 shadow-sm">
        <div class="card-header" style="border-bottom: 0.5px solid var(--color-border-tertiary); padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <div class="card-title">Ranking / Historial de Árbitros</div>
            <div class="card-sub">Listado general de partidos y designaciones asignadas</div>
          </div>
        </div>

        <!-- Input búsqueda local -->
        <div class="form-group" style="margin-bottom: 12px;">
          <div style="position: relative; display: flex; align-items: center;">
            <input
              v-model="busquedaLocal"
              class="form-input"
              placeholder="Buscar árbitro por nombre..."
              style="padding-left: 36px; height: 36px;"
            />
            <i class="ti ti-search" style="position: absolute; left: 12px; color: var(--color-text-secondary); font-size: 14px;"></i>
          </div>
        </div>

        <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
          <table class="des-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th class="text-center">Designaciones</th>
                <th class="text-center">Partidos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in arbitrosFiltrados" :key="a.idArbitro">
                <td class="font-medium text-slate-800">
                  {{ a.nombreCompleto }}
                </td>
                <td class="text-center">{{ a.totalDesignaciones }}</td>
                <td class="text-center">
                  <span class="badge badge-green">{{ a.totalPartidosDirigidos }}</span>
                </td>
                <td>
                  <button class="btn" style="padding: 4px 8px; font-size: 11px;" @click="$emit('ver-detalle', a.idArbitro, a.nombreCompleto)">
                    Ver detalle <i class="ti ti-arrow-right ml-1"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="arbitrosFiltrados.length === 0">
                <td colspan="4" class="text-center text-slate-400 py-4">Ningún árbitro coincide con la búsqueda.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
});

defineEmits(["ver-detalle"]);

const busquedaLocal = ref("");

// Ranking de árbitros filtrado por el input local
const arbitrosFiltrados = computed(() => {
  if (!props.stats.estadisticasArbitros) return [];
  const query = busquedaLocal.value.toLowerCase().trim();
  if (!query) return props.stats.estadisticasArbitros;

  return props.stats.estadisticasArbitros.filter((a) =>
    (a.nombreCompleto || "").toLowerCase().includes(query)
  );
});

// Calcular porcentajes redondeados
const getPorcentaje = (parcial, total) => {
  if (!total) return 0;
  return Math.round((parcial / total) * 100);
};

// Obtener colores por estado
const getEstadoColor = (estado) => {
  const normalized = String(estado).toLowerCase();
  if (normalized.includes("incompleta")) return "#993c1d"; // Rojo óxido
  if (normalized.includes("completa")) return "#0f6e56"; // Verde
  if (normalized.includes("finalizada")) return "#185fa5"; // Azul
  return "#64748b"; // Gris por defecto
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
