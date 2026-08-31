<template>
  <div
    class="card border border-slate-100 shadow-sm animate-fade-in"
    style="padding: 20px 24px"
  >
    <!-- Selector de Tipo de Filtro -->
    <div class="flex gap-2 mb-4 border-b border-slate-100 pb-3 flex-wrap">
      <button
        type="button"
        class="role-btn"
        :class="{ selected: tipoFiltro === 'rango' }"
        @click="tipoFiltro = 'rango'"
      >
        <i class="ti ti-calendar-event" style="margin-right: 4px"></i> Rango
        Libre
      </button>
      <button
        type="button"
        class="role-btn"
        :class="{ selected: tipoFiltro === 'mes' }"
        @click="tipoFiltro = 'mes'"
      >
        <i class="ti ti-calendar-stats" style="margin-right: 4px"></i> Por Mes
      </button>
      <button
        type="button"
        class="role-btn"
        :class="{ selected: tipoFiltro === 'intervalo' }"
        @click="tipoFiltro = 'intervalo'"
      >
        <i class="ti ti-calendar-time" style="margin-right: 4px"></i> Intervalo
        de Meses
      </button>
      <button
        type="button"
        class="role-btn"
        :class="{ selected: tipoFiltro === 'anio' }"
        @click="tipoFiltro = 'anio'"
      >
        <i class="ti ti-calendar" style="margin-right: 4px"></i> Por Año
      </button>
    </div>

    <!-- Inputs según el tipo de filtro -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex-1">
        <!-- RANGO LIBRE -->
        <div
          v-if="tipoFiltro === 'rango'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
        >
          <div class="form-group" style="margin-bottom: 0">
            <label
              class="form-label"
              style="font-weight: 500; margin-bottom: 6px"
              >Fecha de Inicio</label
            >
            <input
              type="date"
              v-model="localFechaInicio"
              class="form-input"
              style="height: 38px"
            />
          </div>
          <div class="form-group" style="margin-bottom: 0">
            <label
              class="form-label"
              style="font-weight: 500; margin-bottom: 6px"
              >Fecha de Fin</label
            >
            <input
              type="date"
              v-model="localFechaFin"
              class="form-input"
              style="height: 38px"
            />
          </div>
        </div>

        <!-- POR MES -->
        <div
          v-else-if="tipoFiltro === 'mes'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
        >
          <div class="form-group" style="margin-bottom: 0">
            <label
              class="form-label"
              style="font-weight: 500; margin-bottom: 6px"
              >Seleccionar Mes</label
            >
            <select
              v-model="mesSeleccionado"
              class="form-input"
              style="height: 38px"
            >
              <option v-for="m in MESES" :key="m.val" :value="m.val">
                {{ m.label }}
              </option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0">
            <label
              class="form-label"
              style="font-weight: 500; margin-bottom: 6px"
              >Seleccionar Año</label
            >
            <select
              v-model="anioSeleccionado"
              class="form-input"
              style="height: 38px"
            >
              <option v-for="y in ANIOS" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <!-- INTERVALO DE MESES -->
        <div
          v-else-if="tipoFiltro === 'intervalo'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
        >
          <!-- Desde -->
          <div class="grid grid-cols-2 gap-2">
            <div class="form-group" style="margin-bottom: 0">
              <label
                class="form-label"
                style="font-weight: 500; margin-bottom: 6px"
                >Desde (Mes)</label
              >
              <select
                v-model="mesInicio"
                class="form-input"
                style="height: 38px"
              >
                <option v-for="m in MESES" :key="m.val" :value="m.val">
                  {{ m.label }}
                </option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0">
              <label
                class="form-label"
                style="font-weight: 500; margin-bottom: 6px"
                >Desde (Año)</label
              >
              <select
                v-model="anioInicio"
                class="form-input"
                style="height: 38px"
              >
                <option v-for="y in ANIOS" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
          <!-- Hasta -->
          <div class="grid grid-cols-2 gap-2">
            <div class="form-group" style="margin-bottom: 0">
              <label
                class="form-label"
                style="font-weight: 500; margin-bottom: 6px"
                >Hasta (Mes)</label
              >
              <select v-model="mesFin" class="form-input" style="height: 38px">
                <option v-for="m in MESES" :key="m.val" :value="m.val">
                  {{ m.label }}
                </option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0">
              <label
                class="form-label"
                style="font-weight: 500; margin-bottom: 6px"
                >Hasta (Año)</label
              >
              <select v-model="anioFin" class="form-input" style="height: 38px">
                <option v-for="y in ANIOS" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- POR AÑO -->
        <div
          v-else-if="tipoFiltro === 'anio'"
          class="grid grid-cols-1 gap-4 animate-fade-in"
        >
          <div class="form-group" style="margin-bottom: 0">
            <label
              class="form-label"
              style="font-weight: 500; margin-bottom: 6px"
              >Seleccionar Año</label
            >
            <select
              v-model="anioSeleccionadoSimple"
              class="form-input"
              style="height: 38px"
            >
              <option v-for="y in ANIOS" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Acciones de Búsqueda y Orden -->
      <div class="flex gap-2 flex-wrap items-center">
        <button
          type="button"
          class="btn"
          @click="handleReiniciar"
          style="height: 38px"
          title="Restablecer fechas del mes"
        >
          <i class="ti ti-refresh text-slate-500"></i> Reiniciar
        </button>
        <button
          type="button"
          class="btn primary"
          @click="aplicarFiltro"
          style="height: 38px"
        >
          <i class="ti ti-search"></i> Filtrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  fechaInicio: {
    type: String,
    required: true,
  },
  fechaFin: {
    type: String,
    required: true,
  },
  orden: {
    type: String,
    default: "DESC",
  },
  showOrden: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:fechaInicio",
  "update:fechaFin",
  "update:orden",
  "buscar",
  "reiniciar",
]);

const tipoFiltro = ref("rango"); // 'rango' | 'mes' | 'intervalo'

const localOrden = ref(props.orden || "DESC");
watch(
  () => props.orden,
  (val) => {
    if (val) localOrden.value = val;
  },
);

const toggleOrden = () => {
  localOrden.value = localOrden.value === "DESC" ? "ASC" : "DESC";
  emit("update:orden", localOrden.value);
  emit("buscar");
};

// Rango libre local state
const localFechaInicio = ref(props.fechaInicio);
const localFechaFin = ref(props.fechaFin);

// Por mes local state
const mesSeleccionado = ref(new Date().getMonth() + 1);
const anioSeleccionado = ref(new Date().getFullYear());

// Intervalo local state
const mesInicio = ref(new Date().getMonth() + 1);
const anioInicio = ref(new Date().getFullYear());
const mesFin = ref(new Date().getMonth() + 1);
const anioFin = ref(new Date().getFullYear());

// Por año local state
const anioSeleccionadoSimple = ref(new Date().getFullYear());

const MESES = [
  { val: 1, label: "Enero" },
  { val: 2, label: "Febrero" },
  { val: 3, label: "Marzo" },
  { val: 4, label: "Abril" },
  { val: 5, label: "Mayo" },
  { val: 6, label: "Junio" },
  { val: 7, label: "Julio" },
  { val: 8, label: "Agosto" },
  { val: 9, label: "Septiembre" },
  { val: 10, label: "Octubre" },
  { val: 11, label: "Noviembre" },
  { val: 12, label: "Diciembre" },
];

const ANIOS = [2024, 2025, 2026, 2027, 2028];

// Sincronizar desde propiedades
watch(
  () => props.fechaInicio,
  (newVal) => {
    localFechaInicio.value = newVal;
  },
);
watch(
  () => props.fechaFin,
  (newVal) => {
    localFechaFin.value = newVal;
  },
);

const aplicarFiltro = () => {
  let inicio = "";
  let fin = "";

  if (tipoFiltro.value === "rango") {
    inicio = localFechaInicio.value;
    fin = localFechaFin.value;
  } else if (tipoFiltro.value === "mes") {
    const y = anioSeleccionado.value;
    const m = mesSeleccionado.value;
    const lastDay = new Date(y, m, 0).getDate();
    const mStr = String(m).padStart(2, "0");
    inicio = `${y}-${mStr}-01`;
    fin = `${y}-${mStr}-${String(lastDay).padStart(2, "0")}`;
  } else if (tipoFiltro.value === "intervalo") {
    const yIni = anioInicio.value;
    const mIni = mesInicio.value;
    const yFin = anioFin.value;
    const mFin = mesFin.value;

    const lastDay = new Date(yFin, mFin, 0).getDate();

    inicio = `${yIni}-${String(mIni).padStart(2, "0")}-01`;
    fin = `${yFin}-${String(mFin).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  } else if (tipoFiltro.value === "anio") {
    const y = anioSeleccionadoSimple.value;
    inicio = `${y}-01-01`;
    fin = `${y}-12-31`;
  }

  emit("update:fechaInicio", inicio);
  emit("update:fechaFin", fin);
  emit("update:orden", localOrden.value);
  emit("buscar");
};

const handleReiniciar = () => {
  tipoFiltro.value = "rango";
  emit("reiniciar");
};
</script>
