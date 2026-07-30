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
      <!-- Selector de Modo de Búsqueda -->
      <div class="tab-row" style="max-width: 800px; margin-bottom: 1.5rem">
        <button
          :class="['tab-btn', { active: searchMode === 'single' }]"
          @click="searchMode = 'single'"
        >
          <i class="ti ti-calendar" style="margin-right: 6px"></i>Fecha Única
        </button>
        <button
          :class="['tab-btn', { active: searchMode === 'range' }]"
          @click="searchMode = 'range'"
        >
          <i class="ti ti-calendar-event" style="margin-right: 6px"></i>Rango de
          Fechas
        </button>
        <button
          :class="['tab-btn', { active: searchMode === 'monthly' }]"
          @click="searchMode = 'monthly'"
        >
          <i class="ti ti-calendar-stats" style="margin-right: 6px"></i>Por Mes
        </button>
        <button
          :class="['tab-btn', { active: searchMode === 'referee' }]"
          @click="searchMode = 'referee'"
        >
          <i class="ti ti-user" style="margin-right: 6px"></i>Por Árbitro
        </button>
        <button
          :class="['tab-btn', { active: searchMode === 'court' }]"
          @click="searchMode = 'court'"
        >
          <i class="ti ti-map-pin" style="margin-right: 6px"></i>Por Cancha
        </button>
        <button
          :class="['tab-btn', { active: searchMode === 'status' }]"
          @click="searchMode = 'status'"
        >
          <i class="ti ti-activity" style="margin-right: 6px"></i>Por Estado
        </button>
      </div>

      <!-- Formulario de Búsqueda -->
      <div class="card" style="margin-bottom: 2rem; max-width: 800px">
        <form @submit.prevent="ejecutarBusqueda(false)">
          <div class="filters-grid" style="align-items: center; gap: 16px">
            <!-- Modo Fecha Única -->
            <div
              v-if="searchMode === 'single'"
              class="form-group"
              style="margin-bottom: 0; flex: 1"
            >
              <label class="form-label">Seleccionar Fecha</label>
              <input
                type="date"
                v-model="fechaSingle"
                class="form-input"
                required
              />
            </div>

            <!-- Modo Rango de Fechas -->
            <div
              v-else-if="searchMode === 'range'"
              style="
                display: flex;
                gap: 16px;
                flex: 1;
                width: 100%;
                flex-wrap: wrap;
              "
            >
              <div
                class="form-group"
                style="margin-bottom: 0; flex: 1; min-width: 150px"
              >
                <label class="form-label">Fecha Desde (Inicio)</label>
                <input
                  type="date"
                  v-model="fechaInicio"
                  class="form-input"
                  required
                />
              </div>
              <div
                class="form-group"
                style="margin-bottom: 0; flex: 1; min-width: 150px"
              >
                <label class="form-label">Fecha Hasta (Fin)</label>
                <input
                  type="date"
                  v-model="fechaFin"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <!-- Modo Por Mes -->
            <div
              v-else-if="searchMode === 'monthly'"
              style="
                display: flex;
                gap: 16px;
                flex: 1;
                width: 100%;
                flex-wrap: wrap;
              "
            >
              <div
                class="form-group"
                style="margin-bottom: 0; flex: 1; min-width: 150px"
              >
                <label class="form-label">Mes</label>
                <select
                  v-model.number="selectedMonth"
                  class="form-input"
                  required
                >
                  <option value="1">Enero</option>
                  <option value="2">Febrero</option>
                  <option value="3">Marzo</option>
                  <option value="4">Abril</option>
                  <option value="5">Mayo</option>
                  <option value="6">Junio</option>
                  <option value="7">Julio</option>
                  <option value="8">Agosto</option>
                  <option value="9">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>
              <div
                class="form-group"
                style="margin-bottom: 0; flex: 1; min-width: 120px"
              >
                <label class="form-label">Año</label>
                <select
                  v-model.number="selectedYear"
                  class="form-input"
                  required
                >
                  <option v-for="y in yearsList" :key="y" :value="y">
                    {{ y }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Modo Por Árbitro -->
            <div
              v-else-if="searchMode === 'referee'"
              class="form-group"
              style="margin-bottom: 0; flex: 1"
            >
              <label class="form-label">Seleccionar Árbitro</label>
              <select
                v-model="selectedArbitroId"
                class="form-input"
                style="height: 38px"
                required
              >
                <option value="" disabled>Seleccione un árbitro...</option>
                <option
                  v-for="a in listaArbitrosCompletos"
                  :key="a.idArbitro"
                  :value="a.idArbitro"
                >
                  {{ a.apellido }}, {{ a.nombre }} ({{
                    getCategoryLabel(a.categoria)
                  }})
                </option>
              </select>
            </div>

            <!-- Modo Por Cancha -->
            <div
              v-else-if="searchMode === 'court'"
              class="form-group"
              style="margin-bottom: 0; flex: 1"
            >
              <label class="form-label">Seleccionar Cancha</label>
              <select
                v-model="selectedCanchaId"
                class="form-input"
                style="height: 38px"
                required
              >
                <option value="" disabled>Seleccione una cancha...</option>
                <option
                  v-for="c in listaCanchasCompletas"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.nombre }} ({{ getCategoryLabel(c.categoria) }})
                </option>
              </select>
            </div>

            <!-- Modo Por Estado -->
            <div
              v-if="searchMode === 'status'"
              class="form-group"
              style="margin-bottom: 0; flex: 1"
            >
              <label class="form-label">Seleccionar Estado</label>
              <select
                v-model="selectedEstado"
                class="form-input"
                style="height: 38px"
                required
              >
                <option value="" disabled>Seleccione un estado...</option>
                <option value="0">Pendiente a completar</option>
                <option value="1">Completa</option>
                <option value="2">Jornada finalizada</option>
                <option value="3">Cancelada</option>
              </select>
            </div>

            <!-- Botón Buscar -->
            <div style="margin-top: 18px">
              <button
                type="submit"
                class="btn primary"
                :disabled="loading"
                style="width: 100%; height: 38px"
              >
                <i
                  v-if="loading"
                  class="ti ti-loader"
                  style="animation: spin 1s linear infinite"
                ></i>
                <i v-else class="ti ti-search"></i>
                {{ loading ? "Buscando..." : "Buscar" }}
              </button>
            </div>
          </div>
        </form>
      </div>

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
            :arbitros="visibleArbitros[d.idDesignacion || d.id] ? arbitrosDesignados[d.idDesignacion || d.id] : null"
            show-ver-arbitros-btn
            show-empty-arbitros-state
            @ver-arbitros="verArbitros"
            @action-complete="ejecutarBusqueda(true, false)"
          />
        </div>

        <!-- Paginación para Búsqueda por Árbitro, Cancha o Estado -->
        <div
          v-if="
            (searchMode === 'referee' ||
              searchMode === 'court' ||
              searchMode === 'status') &&
            totalPages > 1
          "
          class="flex justify-between items-center p-4 h-12 py-2 bg-white rounded-lg border border-slate-100 shadow-sm"
          style="margin-top: 3.5rem; gap: 12px; flex-wrap: wrap"
        >
          <span class="text-xs text-slate-500 font-medium">
            Mostrando página {{ currentPage + 1 }} de {{ totalPages }} ({{
              totalElements
            }}
            resultados totales)
          </span>
          <div class="flex gap-2">
            <button
              class="btn"
              style="padding: 5px 12px; font-size: 13px"
              :disabled="currentPage === 0"
              @click="cambiarPagina(currentPage - 1)"
            >
              <i class="ti ti-chevron-left" style="margin-right: 4px"></i>
              Anterior
            </button>
            <button
              class="btn"
              style="padding: 5px 12px; font-size: 13px"
              :disabled="currentPage >= totalPages - 1"
              @click="cambiarPagina(currentPage + 1)"
            >
              Siguiente
              <i class="ti ti-chevron-right" style="margin-left: 4px"></i>
            </button>
          </div>
        </div>
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
  loadCanchas,
} from "../store";
import designacionService from "../services/designacionService";
import arbitroService from "../services/arbitroService";
import canchaService from "../services/canchaService";
import DesignacionCard from "../components/DesignacionCard.vue";

// Estados reactivos
const searchMode = ref("single"); // 'single', 'range', 'monthly' o 'referee'
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

// Mapas para almacenar árbitros por designación
const arbitrosDesignados = ref({});
const resultadosCargados = ref({});
const visibleArbitros = ref({});

// Obtener etiqueta legible de categoría de árbitro
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

// Combinar árbitros disponibles y no disponibles para el Selector
const listaArbitrosCompletos = computed(() => {
  const list = [
    ...(state.arbitros || []),
    ...(state.arbitrosNoDisponibles || []),
  ];
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

// Obtener canchas ordenadas alfabéticamente
const listaCanchasCompletas = computed(() => {
  const list = state.canchas || [];
  return [...list].sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || ""),
  );
});

// Cambiar de página en el buscador de árbitro o cancha
const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 0 && nuevaPagina < totalPages.value) {
    currentPage.value = nuevaPagina;
    ejecutarBusqueda(false, false);

    // Volver arriba de la página / contenedor al cambiar de página
    const el = document.querySelector(".main");
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

// Inicializar con la fecha actual, cargar árbitros y canchas
onMounted(() => {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const hoyStr = `${yyyy}-${mm}-${dd}`;

  fechaSingle.value = hoyStr;
  fechaInicio.value = hoyStr;
  fechaFin.value = hoyStr;

  loadArbitros();
  loadCanchas();
});

// Ejecución de la búsqueda
const ejecutarBusqueda = async (silent = false, resetPage = false) => {
  if (resetPage) {
    currentPage.value = 0;
  }
  visibleArbitros.value = {};
  arbitrosDesignados.value = {};
  resultadosCargados.value = {};
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
      // El backend ahora devuelve directamente la designación (GetDesignacionDTO),
      // pero mantenemos la compatibilidad de mapeo en caso de que existiera la estructura anidada.
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

    // Mapear detalles de árbitros si ya vienen en el payload
    for (const d of resultados.value) {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        arbitrosDesignados.value[id] = d.arbitrosDesignados;
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

const verArbitros = async (d, resolve) => {
  const idDesignacion = d.idDesignacion || d.id;
  if (visibleArbitros.value[idDesignacion]) {
    visibleArbitros.value[idDesignacion] = false;
    if (typeof resolve === "function") resolve();
  } else {
    try {
      const arbs = await loadArbitrosDesignados(idDesignacion, true, { showLoader: false });
      arbitrosDesignados.value[idDesignacion] = arbs || [];
    } finally {
      visibleArbitros.value[idDesignacion] = true;
      if (typeof resolve === "function") resolve();
    }
  }
};

// Limpiar resultados al cambiar de modo de búsqueda
watch(searchMode, () => {
  resultados.value = [];
  realizoBusqueda.value = false;
  errorMessage.value = "";
  currentPage.value = 0;
  totalPages.value = 1;
  totalElements.value = 0;
  selectedEstado.value = "";
});

// Monitorear cuando se cierra el modal global de gestión de árbitros
// para actualizar en tiempo real los resultados de la búsqueda actual
watch(
  () => state.modal,
  async (newModal, oldModal) => {
    // Si el modal estaba abierto (oldModal es objeto) y ahora se cierra (newModal es null)
    if (
      oldModal &&
      !newModal &&
      realizoBusqueda.value &&
      resultados.value.length > 0
    ) {
      console.log("Modal de árbitros cerrado. Recargando buscador...");
      await ejecutarBusqueda(true, false);
    }
  },
);
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
