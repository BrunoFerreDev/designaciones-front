<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Árbitros</div>
        <div class="topbar-sub">
          {{ disponiblesCount }} disponibles de {{ state.arbitros.length }}
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button
          class="btn danger"
          @click="marcarTodosNoDisponibles"
          :disabled="disponiblesCount === 0"
        >
          <i class="ti ti-circle-x"></i>Marcar todos no disp.
        </button>
        <button class="btn primary" @click="openModal('addArbitro')">
          <i class="ti ti-plus"></i>Nuevo árbitro
        </button>
      </div>
    </div>

    <div class="content">
      <div class="stats-row three-cols">
        <div class="stat-card">
          <div class="stat-num stat-green">{{ activeDispCount }}</div>
          <div class="stat-label">Disponibles</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-red">{{ activeNodipCount }}</div>
          <div class="stat-label">No disponibles</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-blue">{{ filteredArbitros.length }}</div>
          <div class="stat-label">
            Resultados filtro (Total: {{ state.arbitros.length }})
          </div>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div
        class="card"
        style="
          margin-bottom: 1.5rem;
          padding: 16px 20px;
          border-radius: var(--border-radius-lg);
        "
      >
        <div class="filters-grid">
          <div class="form-group" style="margin-bottom: 0">
            <label
              class="form-label"
              style="font-weight: 500; margin-bottom: 6px"
              >Buscar por nombre o apellido</label
            >
            <div style="position: relative; display: flex; align-items: center">
              <input
                v-model="searchQuery"
                class="form-input"
                placeholder="Ej: Alberto Gauto..."
                style="padding-left: 36px; height: 38px"
              />
              <i
                class="ti ti-search"
                style="
                  position: absolute;
                  left: 12px;
                  color: var(--color-text-secondary);
                  font-size: 16px;
                "
              ></i>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0">
            <label
              class="form-label"
              style="font-weight: 500; margin-bottom: 6px"
              >Categoría</label
            >
            <select
              v-model="filterCategory"
              class="form-input"
              style="height: 38px"
            >
              <option value="">Todas las categorías</option>
              <option value="ELITE">Elite</option>
              <option value="AVANZADO">Avanzado</option>
              <option value="INTERMEDIO_ALTO">Intermedio Alto</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="INTERMEDIO_BAJO">Intermedio Bajo</option>
              <option value="EN_FORMACION">En Formación</option>
              <option value="INICIAL">Inicial</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Columna: Disponibles -->
        <div class="card">
          <div
            class="card-header"
            style="
              border-bottom: 0.5px solid var(--color-border-tertiary);
              padding-bottom: 12px;
              margin-bottom: 16px;
            "
          >
            <div>
              <div
                class="card-title"
                style="display: flex; align-items: center; gap: 8px"
              >
                <i
                  class="ti ti-circle-check"
                  style="color: #0f6e56; font-size: 18px"
                ></i>
                Disponibles
              </div>
              <div class="card-sub">
                Árbitros activos listos para ser designados
              </div>
            </div>
            <span class="badge badge-green">{{ disp.length }}</span>
          </div>

          <div
            v-if="disp.length === 0"
            class="empty-state"
            style="padding: 2.5rem 1rem"
          >
            <i
              class="ti ti-mood-empty"
              style="
                font-size: 32px;
                display: block;
                margin-bottom: 10px;
                color: var(--color-text-secondary);
              "
            ></i>
            Ningún árbitro disponible coincide con los filtros
          </div>

          <div class="flex flex-col gap-3">
            <ArbitroCard v-for="a in disp" :key="a.idArbitro" :arbitro="a" />
          </div>
        </div>

        <!-- Columna: No Disponibles -->
        <div class="card">
          <div
            class="card-header"
            style="
              border-bottom: 0.5px solid var(--color-border-tertiary);
              padding-bottom: 12px;
              margin-bottom: 16px;
            "
          >
            <div>
              <div
                class="card-title"
                style="display: flex; align-items: center; gap: 8px"
              >
                <i
                  class="ti ti-circle-x"
                  style="color: #993c1d; font-size: 18px"
                ></i>
                No disponibles
              </div>
              <div class="card-sub">
                Árbitros con licencia, viaje o inactivos temporales
              </div>
            </div>
            <span class="badge badge-red">{{ nodip.length }}</span>
          </div>

          <div
            v-if="nodip.length === 0"
            class="empty-state"
            style="padding: 2.5rem 1rem"
          >
            <i
              class="ti ti-mood-smile"
              style="
                font-size: 32px;
                display: block;
                margin-bottom: 10px;
                color: var(--color-text-secondary);
              "
            ></i>
            Ningún árbitro no disponible coincide con los filtros
          </div>

          <div class="flex flex-col gap-3">
            <ArbitroCard v-for="a in nodip" :key="a.idArbitro" :arbitro="a" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  state,
  openModal,
  disponiblesCount,
  marcarTodosNoDisponibles,
} from "../store";
import ArbitroCard from "../components/ArbitroCard.vue";

// Filtros locales
const searchQuery = ref("");
const filterCategory = ref("");

// Lista filtrada de árbitros
const filteredArbitros = computed(() => {
  return state.arbitros.filter((a) => {
    // Buscar coincidencia en nombre o apellido
    const nombreCompleto =
      `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
    const query = searchQuery.value.toLowerCase().trim();
    const coincideBusqueda = !query || nombreCompleto.includes(query);

    // Filtrar por categoría
    const coincideCategoria =
      !filterCategory.value || a.categoria === filterCategory.value;

    return coincideBusqueda && coincideCategoria;
  });
});

const disp = computed(() => filteredArbitros.value.filter((a) => a.estado));
const nodip = computed(() => filteredArbitros.value.filter((a) => !a.estado));

// Cantidad real disponible / no disponible en toda la base de datos (para las estadísticas principales)
const activeDispCount = computed(
  () => state.arbitros.filter((a) => a.estado).length,
);
const activeNodipCount = computed(
  () => state.arbitros.filter((a) => !a.estado).length,
);
</script>
