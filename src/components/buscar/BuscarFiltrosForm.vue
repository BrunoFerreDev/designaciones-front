<template>
  <div>
    <!-- Selector de Modo de Búsqueda -->
    <div class="tab-row" style="max-width: 800px; margin-bottom: 1.5rem">

      <button
        :class="['tab-btn', { active: searchMode === 'range' }]"
        @click="$emit('update:searchMode', 'range')"
      >
        <i class="ti ti-calendar-event" style="margin-right: 6px"></i>Rango de Fechas
      </button>
      <button
        :class="['tab-btn', { active: searchMode === 'monthly' }]"
        @click="$emit('update:searchMode', 'monthly')"
      >
        <i class="ti ti-calendar-stats" style="margin-right: 6px"></i>Por Mes
      </button>
      <button
        :class="['tab-btn', { active: searchMode === 'referee' }]"
        @click="$emit('update:searchMode', 'referee')"
      >
        <i class="ti ti-user" style="margin-right: 6px"></i>Por Árbitro
      </button>
      <button
        :class="['tab-btn', { active: searchMode === 'court' }]"
        @click="$emit('update:searchMode', 'court')"
      >
        <i class="ti ti-map-pin" style="margin-right: 6px"></i>Por Cancha
      </button>
      <button
        :class="['tab-btn', { active: searchMode === 'status' }]"
        @click="$emit('update:searchMode', 'status')"
      >
        <i class="ti ti-activity" style="margin-right: 6px"></i>Por Estado
      </button>
    </div>

    <!-- Formulario de Búsqueda -->
    <div class="card" style="margin-bottom: 2rem; max-width: 800px">
      <form @submit.prevent="$emit('submit')">
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
              :value="fechaSingle"
              @input="$emit('update:fechaSingle', $event.target.value)"
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
                :value="fechaInicio"
                @input="$emit('update:fechaInicio', $event.target.value)"
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
                :value="fechaFin"
                @input="$emit('update:fechaFin', $event.target.value)"
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
                :value="selectedMonth"
                @change="$emit('update:selectedMonth', Number($event.target.value))"
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
                :value="selectedYear"
                @change="$emit('update:selectedYear', Number($event.target.value))"
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
              :value="selectedArbitroId"
              @change="$emit('update:selectedArbitroId', $event.target.value)"
              class="form-input"
              style="height: 38px"
              required
            >
              <option value="" disabled>Seleccione un árbitro...</option>
              <option
                v-for="a in listaArbitros"
                :key="a.idArbitro"
                :value="a.idArbitro"
              >
                {{ a.apellido }}, {{ a.nombre }} ({{ getCategoryLabel(a.categoria) }})
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
              :value="selectedCanchaId"
              @change="$emit('update:selectedCanchaId', $event.target.value)"
              class="form-input"
              style="height: 38px"
              required
            >
              <option value="" disabled>Seleccione una cancha...</option>
              <option
                v-for="c in listaCanchas"
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
              :value="selectedEstado"
              @change="$emit('update:selectedEstado', $event.target.value)"
              class="form-input"
              style="height: 38px"
              required
            >
              <option value="" disabled>Seleccione un estado...</option>
              <option value="0">Pendiente a completar</option>
              <option value="1">Aceptada</option>
              <option value="2">Jornada finalizada</option>
              <option value="3">Jornada cancelada</option>
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
  </div>
</template>

<script setup>
defineProps({
  searchMode: { type: String, required: true },
  fechaSingle: { type: String, default: "" },
  fechaInicio: { type: String, default: "" },
  fechaFin: { type: String, default: "" },
  selectedMonth: { type: Number, default: 1 },
  selectedYear: { type: Number, default: 2026 },
  yearsList: { type: Array, default: () => [] },
  selectedArbitroId: { type: [String, Number], default: "" },
  selectedCanchaId: { type: [String, Number], default: "" },
  selectedEstado: { type: [String, Number], default: "" },
  listaArbitros: { type: Array, default: () => [] },
  listaCanchas: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits([
  "update:searchMode",
  "update:fechaSingle",
  "update:fechaInicio",
  "update:fechaFin",
  "update:selectedMonth",
  "update:selectedYear",
  "update:selectedArbitroId",
  "update:selectedCanchaId",
  "update:selectedEstado",
  "submit",
]);

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
</style>

