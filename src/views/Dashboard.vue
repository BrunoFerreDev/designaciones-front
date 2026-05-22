<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Resumen general</div>
        <div class="topbar-sub">Vista rápida del sistema de designaciones</div>
      </div>
    </div>
    <div class="content">
      <!-- Tarjetas de Estadísticas -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num stat-green">{{ state.canchas.length }}</div>
          <div class="stat-label">Canchas registradas</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-blue">{{ totalPartidos }}</div>
          <div class="stat-label">Partidos totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-amber">{{ arbDisp }}</div>
          <div class="stat-label">Árbitros disponibles</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-red">{{ desPend }}</div>
          <div class="stat-label">Sin designar</div>
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
          v-if="
            state.designaciones.length === 0 &&
            state.designacionesIncompletas.length === 0
          "
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
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="d in [
                  ...state.designaciones,
                  ...state.designacionesIncompletas,
                ]"
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
                <td>{{ d.cantidadPartidos }} Partidos</td>
                <td>
                  <span
                    :style="{
                      color:
                        d.estadoDesignacion == 0
                          ? 'red'
                          : d.estadoDesignacion == 1
                            ? 'green'
                            : 'blue',
                    }"
                  >
                    {{
                      d.estadoDesignacion == 0
                        ? "Incompleta"
                        : d.estadoDesignacion == 1
                          ? "Completa"
                          : "Finalizada"
                    }}
                  </span>
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
import { computed } from "vue";
import {
  state,
  disponiblesCount,
  calcStatus,
  minArbitros,
  getCancha,
  formatFecha,
} from "../store";

const totalPartidos = computed(() =>
  state.canchas.reduce((s, c) => s + (c.partidos || 0), 0),
);
const arbDisp = disponiblesCount;

const desPend = computed(
  () =>
    state.canchas.filter(
      (c) =>
        !state.designaciones.some(
          (d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id,
        ) &&
        !state.designacionesIncompletas.some(
          (d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id,
        ),
    ).length,
);

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
</script>
