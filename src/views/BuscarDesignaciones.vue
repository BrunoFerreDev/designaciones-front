<template>
  <div>
    <div class="topbar">
      <div>
        <div class="topbar-title">Buscador de Designaciones</div>
        <div class="topbar-sub">
          Encuentra y gestiona designaciones por fecha o rango
        </div>
      </div>
    </div>

    <div class="content animate-fade-in">
      <!-- Selector de Modo y Formulario de Búsqueda -->
      <BuscarFiltrosForm
        v-model:searchMode="searchMode"
        v-model:fechaSingle="fechaSingle"
        v-model:fechaInicio="fechaInicio"
        v-model:fechaFin="fechaFin"
        v-model:selectedMonth="selectedMonth"
        v-model:selectedYear="selectedYear"
        v-model:selectedArbitroId="selectedArbitroId"
        v-model:selectedCanchaId="selectedCanchaId"
        v-model:selectedEstado="selectedEstado"
        :years-list="yearsList"
        :lista-arbitros="listaArbitrosCompletos"
        :lista-canchas="listaCanchasCompletas"
        :loading="loading"
        @submit="ejecutarBusqueda(false)"
      />

      <!-- Alerta de Error -->
      <div
        v-if="errorMessage"
        class="alert alert-warning"
        style="max-width: 800px"
      >
        <i class="ti ti-alert-triangle"></i>
        {{ errorMessage }}
      </div>

      <!-- Cargando resultados -->
      <div
        v-if="loading && resultados.length === 0"
        style="text-align: center; padding: 3rem 1rem"
      >
        <i
          class="ti ti-loader"
          style="
            font-size: 36px;
            color: var(--color-primary);
            animation: spin 1s linear infinite;
          "
        ></i>
        <div
          style="
            margin-top: 1rem;
            color: var(--color-text-secondary);
            font-size: 14px;
          "
        >
          Buscando designaciones en el servidor...
        </div>
      </div>

      <!-- Estado Vacío -->
      <div
        v-else-if="realizoBusqueda && resultados.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          <i
            class="ti ti-calendar-off"
            style="font-size: 40px; color: var(--color-text-secondary)"
          ></i>
        </div>
        <div style="font-size: 15px; font-weight: 500">
          No se encontraron designaciones
        </div>
        <div
          style="
            margin-top: 0.5rem;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          "
        >
          No hay partidos programados para la fecha o rango seleccionados, o no
          coinciden con los criterios de búsqueda.
        </div>
      </div>

      <!-- Listado de Resultados -->
      <div v-else-if="resultados.length > 0">
        <div
          class="section-header"
          style="
            margin-bottom: 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
          "
        >
          <span
            class="section-title"
            style="display: flex; align-items: center; gap: 8px"
          >
            🔍 Resultados: {{ resultados.length }} designación(es) encontrada(s)
          </span>
          <div style="display: flex; gap: 10px; align-items: center">
            <button
              class="btn"
              @click="openModal('arbitrosPorDia', null, resultados)"
              style="
                border-color: #3b82f6;
                color: #3b82f6;
                background: transparent;
                padding: 5px 10px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
              "
              onmouseover="this.style.background = '#f0f7ff'"
              onmouseout="this.style.background = 'transparent'"
            >
              <i class="ti ti-calendar-event"></i> Resumen árbitros
            </button>
            <button
              class="btn"
              @click="ejecutarBusqueda(true, false)"
              style="padding: 5px 10px; font-size: 12px"
            >
              <i class="ti ti-refresh"></i> Actualizar
            </button>
          </div>
        </div>

        <div class="grid-2">
          <DesignacionCard
            v-for="d in resultados"
            :key="d.idDesignacion || d.id"
            :designacion="d"
            :arbitros="arbitrosDesignados[d.idDesignacion || d.id]"
            show-empty-arbitros-state
            @action-complete="ejecutarBusqueda(true, false)"
            @assigned-auto="onAssignedAuto"
          />
        </div>

        <!-- Paginación para Búsqueda por Árbitro, Cancha o Estado -->
        <BuscarResultadosPaginacion
          v-if="
            (searchMode === 'referee' ||
              searchMode === 'court' ||
              searchMode === 'status') &&
            totalPages > 1
          "
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-elements="totalElements"
          @change-page="cambiarPagina"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import {
  state,
  loadArbitrosDesignados,
  openModal,
  loadArbitros,
  loadArbitrosNoDisponibles,
  loadCanchas,
  isArbitroActivo,
} from "../store";
import designacionService from "../services/designacionService";
import arbitroService from "../services/arbitroService";
import canchaService from "../services/canchaService";
import DesignacionCard from "../components/DesignacionCard.vue";
import BuscarFiltrosForm from "../components/buscar/BuscarFiltrosForm.vue";
import BuscarResultadosPaginacion from "../components/buscar/BuscarResultadosPaginacion.vue";

const searchMode = ref("single");
const fechaSingle = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");

const currentYear = new Date().getFullYear();
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(currentYear);
const yearsList = ref(Array.from({ length: 7 }, (_, i) => currentYear - 3 + i));

const loading = ref(false);
const realizoBusqueda = ref(false);
const resultados = ref([]);
const errorMessage = ref("");

const selectedArbitroId = ref("");
const selectedCanchaId = ref("");
const selectedEstado = ref("");
const currentPage = ref(0);
const totalPages = ref(1);
const totalElements = ref(0);
const pageSize = ref(10);

const arbitrosDesignados = ref({});
const resultadosCargados = ref({});

const listaArbitrosCompletos = computed(() => {
  const list = [
    ...(state.arbitros || []),
    ...(state.arbitrosNoDisponibles || []),
  ].filter(isArbitroActivo);
  const unique = [];
  const map = new Set();
  for (const item of list) {
    const id = item.idArbitro || item.id;
    if (id && !map.has(id)) {
      map.add(id);
      unique.push(item);
    }
  }
  return unique.sort((a, b) =>
    (a.apellido || "").localeCompare(b.apellido || ""),
  );
});

const listaCanchasCompletas = computed(() => {
  const list = state.canchas || [];
  return [...list].sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || ""),
  );
});

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 0 && nuevaPagina < totalPages.value) {
    currentPage.value = nuevaPagina;
    ejecutarBusqueda(false, false);

    const el = document.querySelector(".main");
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

onMounted(() => {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const hoyStr = `${yyyy}-${mm}-${dd}`;

  fechaSingle.value = hoyStr;
  fechaInicio.value = hoyStr;
  fechaFin.value = hoyStr;

  if (!state.arbitros || state.arbitros.length === 0) {
    loadArbitros();
  }
  if (
    !state.arbitrosNoDisponibles ||
    state.arbitrosNoDisponibles.length === 0
  ) {
    loadArbitrosNoDisponibles();
  }
  if (!state.canchas || state.canchas.length === 0) {
    loadCanchas();
  }
});

const ejecutarBusqueda = async (silent = false, resetPage = false) => {
  if (resetPage) {
    currentPage.value = 0;
  }
  if (!silent) {
    loading.value = true;
    errorMessage.value = "";
  }

  try {
    let data = [];
    if (searchMode.value === "single") {
      if (!fechaSingle.value) {
        errorMessage.value = "Por favor, selecciona una fecha válida.";
        loading.value = false;
        return;
      }
      data = await designacionService.buscarPorFecha(fechaSingle.value);
    } else if (searchMode.value === "range") {
      if (!fechaInicio.value || !fechaFin.value) {
        errorMessage.value =
          "Por favor, ingresa tanto la fecha de inicio como la de fin.";
        loading.value = false;
        return;
      }
      if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
        errorMessage.value =
          "La fecha de inicio no puede ser posterior a la fecha de fin.";
        loading.value = false;
        return;
      }
      data = await designacionService.buscarPorRango(
        fechaInicio.value,
        fechaFin.value,
      );
    } else if (searchMode.value === "monthly") {
      if (!selectedMonth.value || !selectedYear.value) {
        errorMessage.value = "Por favor, selecciona un mes y año válidos.";
        loading.value = false;
        return;
      }
      data = await designacionService.buscarPorMes(
        selectedMonth.value,
        selectedYear.value,
      );
    } else if (searchMode.value === "referee") {
      if (!selectedArbitroId.value) {
        errorMessage.value = "Por favor, selecciona un árbitro.";
        loading.value = false;
        return;
      }
      const pageData = await arbitroService.getDesignacionesByArbitro(
        selectedArbitroId.value,
        currentPage.value,
        pageSize.value,
      );

      const content = pageData?.content || [];
      data = content.map((item) => item.Designacion || item);

      totalPages.value = pageData?.totalPages || 1;
      totalElements.value = pageData?.totalElements || data.length;
    } else if (searchMode.value === "court") {
      if (!selectedCanchaId.value) {
        errorMessage.value = "Por favor, selecciona una cancha.";
        loading.value = false;
        return;
      }
      const pageData = await canchaService.getDesignacionesByCancha(
        selectedCanchaId.value,
        currentPage.value,
        pageSize.value,
      );

      const content = pageData?.content || [];
      data = content.map((item) => item.Designacion || item);

      totalPages.value = pageData?.totalPages || 1;
      totalElements.value = pageData?.totalElements || data.length;
    } else if (searchMode.value === "status") {
      if (
        selectedEstado.value === "" ||
        selectedEstado.value === null ||
        selectedEstado.value === undefined
      ) {
        errorMessage.value = "Por favor, selecciona un estado.";
        loading.value = false;
        return;
      }
      const pageData = await designacionService.getByEstado(
        Number(selectedEstado.value),
        currentPage.value,
        pageSize.value,
      );

      const content = Array.isArray(pageData)
        ? pageData
        : pageData?.content || [];
      data = content.map((item) => item.Designacion || item);

      totalPages.value = pageData?.totalPages || 1;
      totalElements.value =
        pageData?.totalElements ||
        (Array.isArray(pageData) ? pageData.length : data.length);
    }

    resultados.value = data || [];
    realizoBusqueda.value = true;

    for (const d of resultados.value) {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        arbitrosDesignados.value[id] = d.arbitrosDesignados;
      } else {
        const arbs = await loadArbitrosDesignados(id);
        arbitrosDesignados.value[id] = arbs || [];
      }
      resultadosCargados.value[id] = true;
    }
  } catch (error) {
    console.error("Error al buscar designaciones:", error);
    errorMessage.value =
      "Ocurrió un error al comunicarse con el servidor. Por favor intenta de nuevo.";
  } finally {
    loading.value = false;
  }
};

watch(searchMode, () => {
  resultados.value = [];
  realizoBusqueda.value = false;
  errorMessage.value = "";
  currentPage.value = 0;
  totalPages.value = 1;
  totalElements.value = 0;
  selectedEstado.value = "";
});

watch(
  () => state.modal,
  async (newModal, oldModal) => {
    if (
      oldModal &&
      !newModal &&
      realizoBusqueda.value &&
      resultados.value.length > 0
    ) {
      await ejecutarBusqueda(true, false);
    }
  },
);

const onAssignedAuto = (id) => {
  if (id) {
    arbitrosDesignados.value[id] = state.arbitrosDesignadosMap[id] || [];
  }
};
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.ti-loader {
  display: inline-block;
}
</style>
