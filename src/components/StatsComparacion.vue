<template>
  <div>
    <!-- Panel de Control y Selección de Árbitros -->
    <div class="card border border-slate-100 shadow-md mb-6 overflow-hidden">
      <!-- Borde superior temático -->
      <div style="height: 4px; background: linear-gradient(90deg, #10b981, #059669, #047857);"></div>
      
      <div class="p-5">
        <div class="flex justify-between items-start gap-4 mb-4">
          <div>
            <h3 class="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <span class="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 w-8 h-8 rounded-lg">
                <i class="ti ti-scale text-base"></i>
              </span>
              Comparador de Rendimiento
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              Selecciona de 2 a 4 árbitros para contrastar estadísticas de designaciones, partidos dirigidos y volumen de actividad.
            </p>
          </div>
          
          <!-- Badge contador de selección -->
          <div 
            :class="[
              'px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs border',
              selectedIds.length >= 2 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-50 text-slate-500 border-slate-200'
            ]"
          >
            {{ selectedIds.length }}/4 Árbitros
          </div>
        </div>

        <!-- Buscador e Info -->
        <div class="flex flex-col md:flex-row gap-3 mb-4">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <i class="ti ti-search text-base"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar árbitro por apellido o nombre..."
              class="form-input w-full pl-10"
              style="height: 38px; border-radius: 8px;"
            />
          </div>
          <button
            v-if="selectedIds.length > 0"
            @click="clearSelection"
            class="btn btn-secondary flex items-center justify-center gap-1.5 hover:bg-slate-100"
            style="padding: 0 16px; height: 38px; font-size: 13px; border-radius: 8px;"
          >
            <i class="ti ti-trash"></i> Reiniciar Selección
          </button>
        </div>

        <!-- Filtros de Período (Meses) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <i class="ti ti-calendar text-sm"></i>
            </div>
            <div class="flex-1 flex items-center gap-2">
              <label class="text-xs font-bold text-slate-600 shrink-0">Desde:</label>
              <select
                v-model="mesInicio"
                class="form-input text-xs w-full"
                style="height: 36px; border-radius: 8px;"
              >
                <option :value="null">Todo el año (Inicio)</option>
                <option v-for="(m, idx) in meses" :key="idx" :value="idx + 1">{{ m }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <i class="ti ti-calendar-event text-sm"></i>
            </div>
            <div class="flex-1 flex items-center gap-2">
              <label class="text-xs font-bold text-slate-600 shrink-0">Hasta:</label>
              <select
                v-model="mesFin"
                class="form-input text-xs w-full"
                style="height: 36px; border-radius: 8px;"
              >
                <option :value="null">Todo el año (Fin)</option>
                <option v-for="(m, idx) in meses" :key="idx" :value="idx + 1">{{ m }}</option>
              </select>
            </div>
          </div>

          <!-- Atajos rápidos de período -->
          <div class="flex items-center gap-2 flex-wrap sm:col-span-2 pt-2 border-t border-slate-200/50">
            <span class="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Atajos:</span>
            <button
              type="button"
              @click="setPresetMes('actual')"
              class="px-2.5 py-1 rounded text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              Mes Actual
            </button>
            <button
              type="button"
              @click="setPresetMes('trimestre')"
              class="px-2.5 py-1 rounded text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              Último Trimestre
            </button>
            <button
              type="button"
              @click="setPresetMes('anual')"
              class="px-2.5 py-1 rounded text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              Año Completo
            </button>
          </div>
        </div>

        <!-- Chips de Seleccionados (Efecto entrada animada) -->
        <div v-if="selectedIds.length > 0" class="flex flex-wrap gap-3 mb-6 mt-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div
            v-for="id in selectedIds"
            :key="id"
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs hover:border-emerald-300 transition-colors animate-fade-in"
          >
            <span class="size-4  rounded-full bg-emerald-500"></span>
            <span>{{ getArbitroNombre(id) }}</span>
            <button @click="toggleSelection(id)" class="text-slate-400 hover:text-red-500 ml-1 transition-colors">
              <i class="ti ti-x text-xs font-bold"></i>
            </button>
          </div>
        </div>

        <!-- Separador y Etiqueta de la Lista con Toggle -->
        <div class="border-t border-slate-100 my-5 pt-4 flex justify-between items-center">
          <button
            type="button"
            @click="mostrarDisponibles = !mostrarDisponibles"
            class="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors focus:outline-none select-none cursor-pointer"
          >
            <i 
              :class="['ti text-xs transition-transform duration-200', mostrarDisponibles ? 'ti-chevron-down' : 'ti-chevron-right']"
            ></i>
            <span>{{ mostrarDisponibles ? 'Ocultar Árbitros Disponibles' : 'Mostrar Árbitros Disponibles' }}</span>
          </button>
          <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full select-none">
            {{ filteredArbitros.length }} total
          </span>
        </div>

        <!-- Rejilla de Selección Rápida con Efecto Hover Premium -->
        <div 
          v-show="mostrarDisponibles" 
          class="border border-slate-100 rounded-xl p-3 bg-slate-50/50 max-h-48 overflow-y-auto animate-fade-in"
        >
          <div v-if="filteredArbitros.length === 0" class="text-center py-6 text-xs text-slate-400">
            <i class="ti ti-users-minus text-2xl block mb-1 text-slate-300"></i>
            No se encontraron árbitros con el criterio de búsqueda.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              v-for="a in filteredArbitros"
              :key="a.idArbitro"
              @click="toggleSelection(a.idArbitro)"
              :disabled="!isSelected(a.idArbitro) && selectedIds.length >= 4"
              :class="[
                'flex items-center justify-between p-3 rounded-lg text-left text-xs transition-all border font-medium relative overflow-hidden group shadow-xs',
                isSelected(a.idArbitro)
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white'
              ]"
            >
              <div class="flex items-center gap-2 truncate">
                <span 
                  :class="[
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    isSelected(a.idArbitro) ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  ]"
                >
                  {{ a.nombre[0] }}{{ a.apellido[0] }}
                </span>
                <span class="truncate">{{ a.apellido }}, {{ a.nombre }}</span>
              </div>
              
              <div class="flex items-center shrink-0">
                <i v-if="isSelected(a.idArbitro)" class="ti ti-check-double text-xs text-white"></i>
                <span v-else class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold group-hover:bg-slate-200 transition-colors uppercase">
                  {{ getCategoryLabel(a.categoria) }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="cargando" class="empty-state card border border-slate-100 shadow-md py-16 text-center">
      <div class="relative w-16 h-16 mx-auto mb-4">
        <div class="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div class="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center text-emerald-600">
          <i class="ti ti-scale text-xl"></i>
        </div>
      </div>
      <p class="text-slate-700 font-semibold text-sm">Consultando al servidor...</p>
      <p class="text-xs text-slate-400 mt-1">Procesando y ponderando estadísticas cruzadas</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="alert alert-warning animate-fade-in mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 flex gap-3">
      <i class="ti ti-alert-triangle text-xl shrink-0"></i>
      <div>
        <strong class="font-semibold block">Error de sincronización</strong>
        <span class="text-xs">{{ errorMsg }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="selectedIds.length < 2"
      class="empty-state card border border-slate-100 shadow-md text-center py-16 animate-fade-in relative overflow-hidden"
    >
      <div 
        style="
          position: absolute;
          width: 200px;
          height: 200px;
          border: 2px dashed rgba(16, 185, 129, 0.04);
          border-radius: 50%;
          bottom: -80px;
          right: -80px;
          pointer-events: none;
        "
      ></div>
      <div 
        style="
          position: absolute;
          width: 150px;
          height: 150px;
          border: 2px dashed rgba(16, 185, 129, 0.04);
          border-radius: 50%;
          top: -60px;
          left: -60px;
          pointer-events: none;
        "
      ></div>

      <div class="empty-icon w-14 h-14 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4">
        <i class="ti ti-users-group"></i>
      </div>
      <h4 class="font-bold text-slate-800 text-base">Faltan árbitros para la comparativa</h4>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
        Selecciona al menos dos árbitros del selector superior para iniciar la comparación directa y visualizar el análisis cara a cara.
      </p>
    </div>

    <!-- Arena de Comparación con Separación Aumentada -->
    <div v-else-if="comparacionData && comparacionData.length > 0" class="animate-fade-in space-y-16 mt-24 flex flex-col items-center w-full gap-10 ">
      
      <!-- Ficha / Perfil de Árbitros -->
      <div class="w-full">
        <StatsComparacionFicha
          :comparacion-data="comparacionData"
          :lista-arbitros="listaArbitros"
          :grid-cols-class="gridColsClass"
        />
      </div>
      
   <!-- Detalles por Estado y Cumplimiento -->
      <div class="pt-10 border-t border-slate-200/80 w-full">
        <h4 class="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
          <span class="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 w-7 h-7 rounded-lg">
            <i class="ti ti-history text-xs"></i>
          </span>
          Desglose de Actividad e Historial
        </h4>
        <StatsComparacionDetalle
          :comparacion-data="comparacionData"
          :grid-cols-class="gridColsClass"
        />
      </div>
      <!-- Análisis de Ponderación Cruzada -->
      <div class="pt-10 border-t border-slate-200/80 w-full">
        <StatsComparacionPonderacion
          :comparacion-data="comparacionData"
        />
      </div>

   

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { isArbitroActivo } from "../store";
import estadisticasService from "../services/estadisticasService";
import StatsComparacionFicha from "./StatsComparacionFicha.vue";
import StatsComparacionPonderacion from "./StatsComparacionPonderacion.vue";
import StatsComparacionDetalle from "./StatsComparacionDetalle.vue";

const props = defineProps({
  listaArbitros: {
    type: Array,
    required: true,
  },
});

const searchQuery = ref("");
const mostrarDisponibles = ref(false);
const selectedIds = ref([]);
const comparacionData = ref([]);
const cargando = ref(false);
const errorMsg = ref("");

// Filtros de mes
const mesInicio = ref(null);
const mesFin = ref(null);

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const rangoInvalido = computed(() => {
  return mesInicio.value !== null && mesFin.value !== null && mesInicio.value > mesFin.value;
});

const setPresetMes = (tipo) => {
  const currentMonth = new Date().getMonth() + 1;
  if (tipo === "actual") {
    mesInicio.value = currentMonth;
    mesFin.value = currentMonth;
  } else if (tipo === "trimestre") {
    const start = Math.max(1, currentMonth - 2);
    mesInicio.value = start;
    mesFin.value = currentMonth;
  } else if (tipo === "anual") {
    mesInicio.value = null;
    mesFin.value = null;
  }
};

// Filtrar árbitros (sólo activos en el sistema)
const filteredArbitros = computed(() => {
  if (!props.listaArbitros) return [];
  const q = searchQuery.value.toLowerCase().trim();
  const activos = props.listaArbitros.filter(isArbitroActivo);
  if (!q) return activos;
  return activos.filter((a) =>
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(q)
  );
});

// Grid responsive dependiendo del número de árbitros
const gridColsClass = computed(() => {
  const count = comparacionData.value?.length || 0;
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
});

// Helpers de selección
const isSelected = (id) => selectedIds.value.includes(id);

const toggleSelection = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx > -1) {
    selectedIds.value.splice(idx, 1);
  } else {
    if (selectedIds.value.length < 4) {
      selectedIds.value.push(id);
    }
  }
};

const clearSelection = () => {
  selectedIds.value = [];
  comparacionData.value = [];
  mesInicio.value = null;
  mesFin.value = null;
  errorMsg.value = "";
  mostrarDisponibles.value = false;
};

const getArbitroNombre = (id) => {
  const a = props.listaArbitros.find((arb) => arb.idArbitro === id);
  return a ? `${a.nombre} ${a.apellido}` : `Árbitro #${id}`;
};

// Cargar comparación de API
const fetchComparacion = async () => {
  if (selectedIds.value.length < 2) {
    comparacionData.value = [];
    return;
  }
  if (rangoInvalido.value) {
    errorMsg.value = "El mes de inicio no puede ser posterior al mes de fin.";
    comparacionData.value = [];
    return;
  }
  cargando.value = true;
  errorMsg.value = "";
  try {
    const res = await estadisticasService.getComparacionArbitros(
      selectedIds.value,
      mesInicio.value,
      mesFin.value
    );
    const unsorted = res?.comparacionArbitros || [];
    comparacionData.value = [...unsorted].sort(
      (a, b) => (b.totalDesignaciones || 0) - (a.totalDesignaciones || 0)
    );
  } catch (err) {
    console.error("Error al obtener la comparación:", err);
    errorMsg.value = "No se pudo obtener la comparación desde el servidor.";
    comparacionData.value = [];
  } finally {
    cargando.value = false;
  }
};

// Vigilar cambios en los IDs seleccionados y filtros de meses
watch(
  [selectedIds, mesInicio, mesFin],
  () => {
    fetchComparacion();
  },
  { deep: true }
);

// Mostrar lista automáticamente cuando el usuario busca un árbitro
watch(searchQuery, (newVal) => {
  if (newVal && newVal.trim()) {
    mostrarDisponibles.value = true;
  }
});

const getCategoryLabel = (cat) => {
  const map = {
    ELITE: "Elite",
    AVANZADO: "Avanzado",
    INTERMEDIO_ALTO: "Intermedio Alto",
    INTERMEDIO: "Intermedio",
    INTERMEDIO_BAJO: "Intermedio Bajo",
    EN_FORMACION: "En Formación",
    INICIAL: "Inicial",
    ASISTENTE: "Asistente",
  };
  return map[cat] || cat || "Inicial";
};
</script>

<style scoped>
/* Estilos necesarios para la vista principal */
</style>
