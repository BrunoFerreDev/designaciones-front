<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Árbitros</div>
        <div class="topbar-sub">
          {{ disponiblesCount }} disponibles de {{ totalArbitros }}
        </div>
      </div>
      <div style="display: flex; gap: 8px">
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
      <div class="stats-row five-cols">
        <div class="stat-card">
          <div class="stat-num stat-blue">{{ totalArbitros }}</div>
          <div class="stat-label">Total Árbitros</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-green">
            {{ disponiblesCount }}
          </div>
          <div class="stat-label">Disponibles (Activos)</div>
        </div>
        <div class="stat-card">
          <div class="stat-num stat-red">
            {{ noDisponiblesCount }}
          </div>
          <div class="stat-label">No disponibles</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: #185fa5">
            {{ disponiblesSabadoCount }}
          </div>
          <div class="stat-label">Disponibles Sábado</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: #7e22ce">
            {{ disponiblesDomingoCount }}
          </div>
          <div class="stat-label">Disponibles Domingo</div>
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
                placeholder="Ej: Nestor Pitana..."
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
            <div style="display: flex; gap: 8px">
              <select
                v-model="filterCategory"
                class="form-input"
                style="height: 38px; flex: 1"
              >
                <option value="">Todas las categorías</option>
                <template v-for="cat in categorias">
                  <option :value="cat">{{ cat }}</option>
                </template>
              </select>
              <button
                class="btn"
                style="
                  height: 38px;
                  padding: 0 12px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  white-space: nowrap;
                "
                @click="toggleSortDirection"
                :title="
                  sortDirection === 'asc'
                    ? 'Orden: Avanzado a Inicial'
                    : 'Orden: Inicial a Avanzado'
                "
              >
                <i
                  :class="
                    sortDirection === 'asc'
                      ? 'ti ti-sort-ascending'
                      : 'ti ti-sort-descending'
                  "
                ></i>
                {{
                  sortDirection === "asc"
                    ? "Avanzado → Inicial"
                    : "Inicial → Asistente..."
                }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestañas de Navegación -->
      <div class="tab-row" style="margin-bottom: 1.5rem">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'disponibilidad' }"
          @click="activeTab = 'disponibilidad'"
        >
          <i class="ti ti-calendar-time" style="margin-right: 6px"></i>Por
          disponibilidad
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'todos' }"
          @click="activeTab = 'todos'"
        >
          <i class="ti ti-users" style="margin-right: 6px"></i>Todos los
          árbitros
        </button>
      </div>

      <!-- Vista 1: Por Disponibilidad -->
      <div v-if="activeTab === 'disponibilidad'" class="grid-2">
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
            <span class="badge badge-green">{{ disponiblesCount }}</span>
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
                Árbitros con licencia, viaje o inactivos temporales
              </div>
            </div>
            <span class="badge badge-red">{{ noDisponiblesCount }}</span>
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

      <!-- Vista 2: Todos los Árbitros (diferenciados por estadoSistema) -->
      <div v-else-if="activeTab === 'todos'" class="grid-2">
        <!-- Columna: Habilitados en el Sistema -->
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
                Habilitados en el Sistema
              </div>
              <div class="card-sub">
                Árbitros activos dentro del sistema de designaciones
              </div>
            </div>
            <span class="badge badge-green">{{ todosEnSistema.length }}</span>
          </div>

          <div
            v-if="todosEnSistema.length === 0"
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
            Ningún árbitro habilitado coincide con los filtros
          </div>

          <div class="flex flex-col gap-3">
            <ArbitroCard
              v-for="a in todosEnSistema"
              :key="a.idArbitro"
              :arbitro="a"
            />
          </div>
        </div>

        <!-- Columna: Fuera de Sistema -->
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
                Inactivos / Fuera del Sistema
              </div>
              <div class="card-sub">
                Árbitros excluidos temporal o permanentemente del sistema
              </div>
            </div>
            <span class="badge badge-red">{{ todosFueraSistema.length }}</span>
          </div>

          <div
            v-if="todosFueraSistema.length === 0"
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
            Ningún árbitro inactivo coincide con los filtros
          </div>

          <div class="flex flex-col gap-3">
            <ArbitroCard
              v-for="a in todosFueraSistema"
              :key="a.idArbitro"
              :arbitro="a"
            />
          </div>
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
  noDisponiblesCount,
  disponiblesSabadoCount,
  disponiblesDomingoCount,
  marcarTodosNoDisponibles,
  loadArbitros,
} from "../store";
import ArbitroCard from "../components/ArbitroCard.vue";
import CardSkeleton from "../components/loaders/CardSkeleton.vue";

onMounted(() => {
  loadArbitros();
});

// Filtros locales
const activeTab = ref("disponibilidad");
const searchQuery = ref("");
const filterCategory = ref("");
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

// Lista filtrada de árbitros (disponibles)
const filteredArbitros = computed(() => {
  const filtered = state.arbitros.filter((a) => {
    // Buscar coincidencia en nombre o apellido
    const nombreCompleto =
      `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
    const query = searchQuery.value.toLowerCase().trim();
    const coincideBusqueda = !query || nombreCompleto.includes(query);

    // Filtrar por categoría
    const coincideCategoria =
      !filterCategory.value || a.categoria === filterCategory.value;

    // Solo los activos en el sistema
    const coincideEstadoSistema = a.estadoSistema !== false;

    return coincideBusqueda && coincideCategoria && coincideEstadoSistema;
  });
  return sortRefereesByDirection(filtered);
});
const disponibles = computed(() =>
  filteredArbitros.value.filter(
    (a) => a.disponibleSabado || a.disponibleDomingo,
  ),
);

const noDisponibles = computed(() => {
  const filtered = (state.arbitrosNoDisponibles || []).filter((a) => {
    const nombreCompleto =
      `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
    const query = searchQuery.value.toLowerCase().trim();
    const coincideBusqueda = !query || nombreCompleto.includes(query);

    const coincideCategoria =
      !filterCategory.value || a.categoria === filterCategory.value;

    // Solo los activos en el sistema
    const coincideEstadoSistema = a.estadoSistema !== false;

    return coincideBusqueda && coincideCategoria && coincideEstadoSistema;
  });
  return sortRefereesByDirection(filtered);
});

// Lista de todos los árbitros sin importar disponibilidad
const filteredTodos = computed(() => {
  const allList = [...state.arbitros, ...(state.arbitrosNoDisponibles || [])];
  // Eliminar duplicados por idArbitro por si acaso
  const uniqueList = [];
  const seenIds = new Set();
  for (const a of allList) {
    if (a && a.idArbitro && !seenIds.has(a.idArbitro)) {
      seenIds.add(a.idArbitro);
      uniqueList.push(a);
    }
  }

  const filtered = uniqueList.filter((a) => {
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

const todosEnSistema = computed(() =>
  filteredTodos.value.filter((a) => a.estadoSistema !== false),
);

const todosFueraSistema = computed(() =>
  filteredTodos.value.filter((a) => a.estadoSistema === false),
);

// Cantidad real disponible / no disponible en toda la base de datos (para las estadísticas principales)
const activeDispCount = computed(
  () => state.arbitros.filter((a) => a.estado).length,
);
const activeNodipCount = computed(
  () => (state.arbitrosNoDisponibles || []).length,
);

const disp = computed(() => filteredArbitros.value.filter((a) => a.estado));
const nodip = computed(() => filteredArbitros.value.filter((a) => !a.estado));
const totalArbitros = computed(() => {
  const ids = new Set([
    ...state.arbitros.map((a) => a.idArbitro),
    ...(state.arbitrosNoDisponibles || []).map((a) => a.idArbitro),
  ]);
  return ids.size;
});
</script>
