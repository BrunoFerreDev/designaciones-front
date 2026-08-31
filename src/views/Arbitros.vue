<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Árbitros</div>
        <div class="topbar-sub">
          <template v-if="activeTab === 'activos'">
            {{ disponiblesCountActivos }} disponibles de {{ totalActivos }} activos
          </template>
          <template v-else>
            {{ totalTodos }} árbitros registrados en el sistema ({{ totalActivos }} activos, {{ totalInactivos }} inactivos)
          </template>
        </div>
      </div>
      <div style="display: flex; gap: 8px">
        <button
          v-if="activeTab === 'activos'"
          class="btn danger"
          @click="marcarTodosNoDisponibles"
          :disabled="disponiblesCountActivos === 0"
        >
          <i class="ti ti-circle-x"></i>Marcar todos no disp.
        </button>
        <button class="btn primary" @click="openModal('addArbitro')">
          <i class="ti ti-plus"></i>Nuevo árbitro
        </button>
      </div>
    </div>

    <div class="content">
      <!-- Pestañas (Tabs) -->
      <div class="tab-row" style="margin-bottom: 1.25rem">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'activos' }"
          @click="activeTab = 'activos'"
        >
          <i class="ti ti-user-check" style="font-size: 15px; margin-right: 6px"></i>
          Árbitros Activos
          <span class="badge badge-green" style="margin-left: 6px; font-size: 11px">{{ totalActivos }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'todos' }"
          @click="activeTab = 'todos'"
        >
          <i class="ti ti-users" style="font-size: 15px; margin-right: 6px"></i>
          Todos los Árbitros
          <span class="badge badge-blue" style="margin-left: 6px; font-size: 11px">{{ totalTodos }}</span>
        </button>
      </div>

      <!-- Stats Row -->
      <ArbitrosStatsRow
        :active-tab="activeTab"
        :total-todos="totalTodos"
        :total-activos="totalActivos"
        :total-inactivos="totalInactivos"
        :con-whatsapp-count="conWhatsappCount"
        :disponibles-count-activos="disponiblesCountActivos"
        :no-disponibles-count-activos="noDisponiblesCountActivos"
        :disponibles-sabado-count-activos="disponiblesSabadoCountActivos"
        :disponibles-domingo-count-activos="disponiblesDomingoCountActivos"
      />

      <!-- Barra de Filtros -->
      <ArbitrosFilters
        v-model:searchQuery="searchQuery"
        v-model:filterCategory="filterCategory"
        v-model:filterEstado="filterEstado"
        :sort-direction="sortDirection"
        :categorias="categorias"
        :active-tab="activeTab"
        @toggle-sort="toggleSortDirection"
      />

      <!-- Tab 1: Árbitros Activos -->
      <div v-if="activeTab === 'activos'" class="grid-2">
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
            <span class="badge badge-green">{{ disponibles.length }}</span>
          </div>

          <div
            v-if="disponibles.length === 0"
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
            <ArbitroCard
              v-for="a in disponibles"
              :key="a.idArbitro"
              :arbitro="a"
            />
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
                Árbitros activos sin disponibilidad este fin de semana
              </div>
            </div>
            <span class="badge badge-red">{{ noDisponibles.length }}</span>
          </div>

          <div
            v-if="noDisponibles.length === 0"
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
            <ArbitroCard
              v-for="a in noDisponibles"
              :key="a.idArbitro"
              :arbitro="a"
            />
          </div>
        </div>
      </div>

      <!-- Tab 2: Todos los Árbitros del Sistema -->
      <div v-else class="card">
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
                class="ti ti-users"
                style="color: #185fa5; font-size: 18px"
              ></i>
              Todos los Árbitros del Sistema
            </div>
            <div class="card-sub">
              Listado general de árbitros activos e inactivos registrados
            </div>
          </div>
          <span class="badge badge-blue">{{ filteredTodos.length }}</span>
        </div>

        <div
          v-if="filteredTodos.length === 0"
          class="empty-state"
          style="padding: 3rem 1rem"
        >
          <i
            class="ti ti-mood-empty"
            style="
              font-size: 36px;
              display: block;
              margin-bottom: 10px;
              color: var(--color-text-secondary);
            "
          ></i>
          No se encontraron árbitros con los filtros aplicados
        </div>

        <div v-else class="flex flex-col gap-3">
          <ArbitroCard
            v-for="a in filteredTodos"
            :key="a.idArbitro"
            :arbitro="a"
            :only-status-toggle="true"
          />
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
  marcarTodosNoDisponibles,
  loadArbitros,
  loadArbitrosNoDisponibles,
  isArbitroActivo,
} from "../store";
import ArbitroCard from "../components/ArbitroCard.vue";
import ArbitrosStatsRow from "../components/arbitros/ArbitrosStatsRow.vue";
import ArbitrosFilters from "../components/arbitros/ArbitrosFilters.vue";

const activeTab = ref("activos");
const searchQuery = ref("");
const filterCategory = ref("");
const filterEstado = ref("");
const sortDirection = ref("asc");
const categorias = ref([
  "AVANZADO",
  "INTERMEDIO",
  "PRINCIPAL_1",
  "PRINCIPAL_2",
  "PRINCIPAL_3",
  "PRINCIPAL_4",
  "ASISTENTE",
  "INCIAL",
]);

const orderCat = {
  AVANZADO: 1,
  INTERMEDIO: 2,
  PRINCIPAL_1: 3,
  PRINCIPAL_2: 4,
  PRINCIPAL_3: 5,
  PRINCIPAL_4: 6,
  ASISTENTE: 7,
  INCIAL: 8,
};

const sortRefereesByDirection = (list) => {
  return [...list].sort((a, b) => {
    const catA =
      orderCat[a.categoria] !== undefined ? orderCat[a.categoria] : 99;
    const catB =
      orderCat[b.categoria] !== undefined ? orderCat[b.categoria] : 99;
    if (sortDirection.value === "asc") {
      return catA - catB;
    } else {
      return catB - catA;
    }
  });
};

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
};

const todosArbitrosList = computed(() => {
  const list = [...state.arbitros, ...(state.arbitrosNoDisponibles || [])];
  const unique = [];
  const map = new Set();
  for (const item of list) {
    const id = item.idArbitro || item.id;
    if (id && !map.has(id)) {
      map.add(id);
      unique.push(item);
    }
  }
  return unique;
});

const arbitrosActivosList = computed(() => {
  return todosArbitrosList.value.filter(isArbitroActivo);
});

const arbitrosInactivosList = computed(() => {
  return todosArbitrosList.value.filter((a) => !isArbitroActivo(a));
});

const totalTodos = computed(() => todosArbitrosList.value.length);
const totalActivos = computed(() => arbitrosActivosList.value.length);
const totalInactivos = computed(() => arbitrosInactivosList.value.length);
const conWhatsappCount = computed(
  () => todosArbitrosList.value.filter((a) => !!a.whatsapp).length,
);

const disponiblesCountActivos = computed(
  () =>
    arbitrosActivosList.value.filter(
      (a) => a.disponibleSabado || a.disponibleDomingo,
    ).length,
);

const noDisponiblesCountActivos = computed(
  () =>
    arbitrosActivosList.value.filter(
      (a) => !a.disponibleSabado && !a.disponibleDomingo,
    ).length,
);

const disponiblesSabadoCountActivos = computed(
  () => arbitrosActivosList.value.filter((a) => a.disponibleSabado).length,
);

const disponiblesDomingoCountActivos = computed(
  () => arbitrosActivosList.value.filter((a) => a.disponibleDomingo).length,
);

const filteredActivos = computed(() => {
  const filtered = arbitrosActivosList.value.filter((a) => {
    const nombreCompleto =
      `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
    const query = searchQuery.value.toLowerCase().trim();
    const coincideBusqueda = !query || nombreCompleto.includes(query);

    const coincideCategoria =
      !filterCategory.value || a.categoria === filterCategory.value;

    return coincideBusqueda && coincideCategoria;
  });
  return sortRefereesByDirection(filtered);
});

const disponibles = computed(() =>
  filteredActivos.value.filter(
    (a) => a.disponibleSabado || a.disponibleDomingo,
  ),
);

const noDisponibles = computed(() =>
  filteredActivos.value.filter(
    (a) => !a.disponibleSabado && !a.disponibleDomingo,
  ),
);

const filteredTodos = computed(() => {
  const filtered = todosArbitrosList.value.filter((a) => {
    const nombreCompleto =
      `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
    const query = searchQuery.value.toLowerCase().trim();
    const coincideBusqueda = !query || nombreCompleto.includes(query);

    const coincideCategoria =
      !filterCategory.value || a.categoria === filterCategory.value;

    let coincideEstado = true;
    if (filterEstado.value === "activos") {
      coincideEstado = isArbitroActivo(a);
    } else if (filterEstado.value === "inactivos") {
      coincideEstado = !isArbitroActivo(a);
    }

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });
  return sortRefereesByDirection(filtered);
});

onMounted(() => {
  if (state.arbitros.length === 0) {
    loadArbitros();
  }
  if ((state.arbitrosNoDisponibles || []).length === 0) {
    loadArbitrosNoDisponibles();
  }
});
</script>
