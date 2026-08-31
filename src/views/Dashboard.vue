<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Resumen general</div>
        <div class="topbar-sub">Vista rápida del sistema de designaciones</div>
      </div>
    </div>
    <div class="content">
      <!-- Tarjetas de Estadísticas Principales -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num stat-green">{{ state.canchas.length }}</div>
          <div class="stat-label">Canchas registradas</div>
        </div>
        <div class="stat-card">
          <div class="stat-num text-purple-600">{{ totalDesignacionesCount }}</div>
          <div class="stat-label">Designaciones totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-blue">{{ totalPartidos }}</div>
          <div class="stat-label">Partidos totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-amber">{{ arbDisp }}</div>
          <div class="stat-label">Árbitros disponibles</div>
        </div>
      </div>

      <!-- Listado de Canchas (Estado por Cancha) -->
      <div class="section-header" style="margin-bottom: 0.75rem">
        <span class="section-title">Listado de Canchas</span>
      </div>
      <div class="grid-3" style="margin-bottom: 1.5rem">
        <div
          v-for="c in state.canchas"
          :key="c.id || c.idCancha"
          class="cancha-card"
        >
          <div class="cancha-icon">🏟️</div>
          <div style="font-size: 14px; font-weight: 600; margin-top: 6px">
            {{ c.nombre }}
          </div>
          <div style="font-size: 11px; color: var(--color-text-secondary)">
            {{ c.ciudad || "Sin ubicación" }}
          </div>

          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 10px;
            "
          >
            <span style="font-size: 12px; color: var(--color-text-secondary)">
              {{ c.categoria || "Categoría N/A" }}
            </span>
            <span :class="['badge', calcStatus(c.partidos || 0).cls]">
              {{ calcStatus(c.partidos || 0).label }}
            </span>
          </div>

          <!-- Estado de Designación en la Cancha -->
          <div
            :style="{
              marginTop: '10px',
              fontSize: '11px',
              padding: '6px 8px',
              borderRadius: '4px',
              background: isOk(c) ? '#e1f5ee' : '#fff3e0',
              color: isOk(c) ? '#0F6E56' : '#b25e00',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }"
          >
            <i
              :class="['ti', isOk(c) ? 'ti-check' : 'ti-alert-triangle']"
              style="font-size: 12px"
            ></i>
            <span>
              {{
                isOk(c)
                  ? `${getArbCount(c)} árbitros designados`
                  : `Mín. req: ${minArbitros(c.partidos || 0)} (${getArbCount(c)} asignados)`
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Últimas Designaciones -->
      <div class="section-header" style="margin-bottom: 0.75rem">
        <span class="section-title">Últimas designaciones</span>
      </div>
      <div class="card" style="padding: 1rem 0.5rem">
        <div
          v-if="ultimasLista.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">
            <i
              class="ti ti-clipboard-list"
              style="font-size: 36px; color: var(--color-text-secondary)"
            ></i>
          </div>
          No hay designaciones aún
        </div>
        <div v-else class="table-responsive">
          <table class="des-table">
            <thead>
              <tr>
                <th>Cancha</th>
                <th>Fecha</th>
                <th>Cant Partidos</th>
                <th>Árbitros</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="d in ultimasLista"
                :key="d.idDesignacion || d.id"
              >
                <td style="font-weight: 500; text-transform: uppercase">
                  {{
                    d.cancha?.nombreCancha ||
                    getCancha(d.idCancha || d.canchaId || d.idCancha)?.nombre ||
                    "—"
                  }}
                </td>
                <td
                  style="color: var(--color-text-secondary)"
                  class="uppercase"
                >
                  {{ formatFecha(d.fecha) }}
                </td>
                <td>
                  <span class="badge badge-blue">
                    ⚽ {{ d.cantidadPartidos || 0 }} {{ d.cantidadPartidos === 1 ? 'partido' : 'partidos' }}
                  </span>
                </td>
                <td>
                  <span class="text-xs text-slate-600 font-medium">
                    👤 {{ (d.arbitrosDesignados || d.arbitros || []).length }} asignados
                  </span>
                </td>
                <td>
                  <span
                    :class="[
                      'badge',
                      d.estadoDesignacion === 0
                        ? 'badge-red'
                        : d.estadoDesignacion === 1
                          ? 'badge-green'
                          : d.estadoDesignacion === 2
                            ? 'badge-blue'
                            : 'badge-gray'
                    ]"
                  >
                    {{
                      d.estadoDesignacion === 0
                        ? "Pendiente / Incompleta"
                        : d.estadoDesignacion === 1
                          ? "Completa"
                          : d.estadoDesignacion === 2
                            ? "Finalizada"
                            : "Cancelada"
                    }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn"
                    style="padding: 4px 8px; font-size: 11px; color: #0284c7; border-color: #bae6fd; background: #f0f9ff;"
                    @click="openModal('viewDesignacion', d.idDesignacion || d.id, d)"
                    title="Ver detalle completo"
                  >
                    <i class="ti ti-eye"></i> Ver detalle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  state,
  openModal,
  disponiblesCount,
  calcStatus,
  minArbitros,
  getCancha,
  formatFecha,
} from "../store";
import designacionService from "../services/designacionService";

const ultimasFromApi = ref([]);

const totalDesignacionesCount = computed(() => {
  return (
    state.designaciones.length +
    state.designacionesIncompletas.length +
    state.designacionesFinalizadas.length +
    (state.designacionesAceptadas?.length || 0)
  );
});

const totalPartidos = computed(() => {
  const allDes = [
    ...state.designaciones,
    ...state.designacionesIncompletas,
    ...state.designacionesFinalizadas,
    ...(state.designacionesAceptadas || []),
  ];
  if (allDes.length > 0) {
    return allDes.reduce((sum, d) => sum + (d.cantidadPartidos || 0), 0);
  }
  return state.canchas.reduce((s, c) => s + (c.partidos || 0), 0);
});

const arbDisp = disponiblesCount;

const ultimasLista = computed(() => {
  if (ultimasFromApi.value.length > 0) {
    return ultimasFromApi.value;
  }
  return [
    ...state.designaciones,
    ...state.designacionesIncompletas,
    ...state.designacionesFinalizadas,
  ].slice(0, 10);
});

const getArbCount = (c) => {
  const des =
    state.designaciones.find(
      (d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id,
    ) ||
    state.designacionesIncompletas.find(
      (d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id,
    );
  return des ? (des.arbitrosDesignados || des.arbitros || []).length : 0;
};

const isOk = (c) => {
  const des =
    state.designaciones.find(
      (d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id,
    ) ||
    state.designacionesIncompletas.find(
      (d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id,
    );
  if (!des) return false;
  return (
    (des.arbitrosDesignados || des.arbitros || []).length >=
    minArbitros(des.cantidadPartidos || c.partidos || 0)
  );
};

onMounted(async () => {
  try {
    const data = await designacionService.getUltimasDesignaciones();
    if (Array.isArray(data) && data.length > 0) {
      ultimasFromApi.value = data;
    }
  } catch (e) {
    console.warn("Could not load ultimas designaciones from API", e);
  }
});
</script>
