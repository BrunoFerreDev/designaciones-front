<template>
  <div>
    <!-- Topbar principal -->
    <div class="topbar">
      <div>
        <div class="topbar-title">Control de Suspensiones y Sanciones</div>
        <div class="topbar-sub">
          Gestión e historial de llamados de atención y suspensiones a árbitros
        </div>
      </div>
    </div>

    <div class="content animate-fade-in">
      <!-- Estadísticas Rápidas -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num stat-red">{{ activeSuspensionsCount }}</div>
          <div class="stat-label">Suspensiones Activas</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-amber">{{ activeWarningsCount }}</div>
          <div class="stat-label">Llamados de Atención</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-blue">{{ totalSanctionedArbitros }}</div>
          <div class="stat-label">Árbitros Sancionados</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-green">{{ state.arbitros.length }}</div>
          <div class="stat-label">Total de Árbitros</div>
        </div>
      </div>

      <div class="grid-2 mt-4">
        <!-- Columna Izquierda: Formulario de Nueva Sanción -->
        <SuspensionForm />

        <!-- Columna Derecha: Historial de Sanciones -->
        <SuspensionHistory />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { state, loadSuspensiones, getArbitro } from "../store";
import SuspensionForm from "../components/SuspensionForm.vue";
import SuspensionHistory from "../components/SuspensionHistory.vue";

onMounted(() => {
  loadSuspensiones();
});

const getArbitroId = (arbitroProp) => {
  if (!arbitroProp) return null;
  if (typeof arbitroProp === "object") {
    return arbitroProp.idArbitro || arbitroProp.id;
  }
  return Number(arbitroProp);
};

// Determinar si una suspensión sigue activa basándose en la fecha del incidente y la duración
const isSuspensionActive = (s) => {
  if (s.tipoSuspencion !== 2) return false;
  try {
    if (s.fechaFin) {
      return new Date(s.fechaFin) > new Date();
    }
    const start = new Date(s.fechaIncidente);
    const duration = parseInt(s.cantidadDias || 0);
    const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    return end > new Date();
  } catch (e) {
    return false;
  }
};

// Estadísticas computadas
const activeSuspensionsCount = computed(() => {
  return state.suspensiones.filter(
    (s) => s.tipoSuspencion === 2 && isSuspensionActive(s),
  ).length;
});

const activeWarningsCount = computed(() => {
  return state.suspensiones.filter((s) => s.tipoSuspencion === 1).length;
});

const totalSanctionedArbitros = computed(() => {
  const uniqueArbitros = new Set(
    state.suspensiones.map((s) => getArbitroId(s.arbitro)),
  );
  return uniqueArbitros.size;
});
</script>
