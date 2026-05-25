<template>
  <div
    class="card mb-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md"
    :style="{
      borderLeft: designacion.estadoDesignacion === 0 
        ? '4px solid #ff9800' 
        : designacion.estadoDesignacion === 1 
          ? '4px solid #1d9e75' 
          : '4px solid #185fa5'
    }"
  >
    <div>
      <div class="card-header items-start gap-4 flex-wrap">
        <div>
          <div class="card-title text-base font-semibold flex items-center gap-1.5 text-slate-800">
            <span>🏟️</span>
            <span>{{ canchaName }}</span>
          </div>
          <div class="card-sub text-[11px] text-slate-500 uppercase mt-1">
            <span v-if="canchaCiudad">{{ canchaCiudad }} · </span>
            <span>{{ designacion.cantidadPartidos }} partidos · </span>
            <span class="font-semibold text-slate-700 normal-case">{{ formattedFecha }}</span>
          </div>
        </div>
        
        <div class="card-header-actions flex items-center gap-2 flex-wrap">
          <!-- Badges según Estado -->
          <span v-if="designacion.estadoDesignacion === 0" class="badge badge-amber">Incompleta</span>
          <span v-else-if="designacion.estadoDesignacion === 1" class="badge badge-green">✓ Completa</span>
          <span v-else class="badge badge-blue">Finalizada</span>
        </div>
      </div>

      <!-- Detalles de Etapa -->
      <div class="text-xs text-slate-500 mt-2 mb-3">
        <span class="font-medium text-slate-600">Etapa:</span>
        <span class="ml-1 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-600">
          {{ designacion.etapaCampeonato || designacion.etapaTorneo || "FECHA_NORMAL" }}
        </span>
      </div>

      <!-- Alerta de Árbitros Faltantes si está Incompleta -->
      <div
        v-if="designacion.estadoDesignacion === 0"
        class="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mb-3 flex items-center gap-2 font-medium"
      >
        <i class="ti ti-alert-circle text-base text-amber-600"></i>
        <span>
          Mínimo requerido: <strong>{{ minArbitrosReq }}</strong> árbitros 
          ({{ assignedCount }} asignados)
        </span>
      </div>

      <!-- Lista de Árbitros Asignados -->
      <div
        v-if="arbitros && arbitros.length > 0"
        class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in"
      >
        <div class="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
          <i class="ti ti-users"></i> Árbitros Asignados:
        </div>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="arb in arbitros"
            :key="arb.idDesignados || arb.id"
            class="text-xs p-2 bg-white border border-slate-100 rounded-md flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-2 min-w-0">
              <i class="ti ti-user text-emerald-600 flex-shrink-0"></i>
              <span class="font-semibold text-slate-700 truncate">
                {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="badge badge-gray text-[9px] px-1.5 py-0.5">
                {{ arb.arbitro?.rol }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium">
                {{ arb.partidosDirigidos }} part.
              </span>
            </div>
          </div>
        </div>
      </div>
      <div 
        v-else-if="showEmptyArbitrosState"
        class="mt-3 p-3.5 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400"
      >
        Sin árbitros asignados actualmente
      </div>
    </div>

    <!-- Botones de Acción -->
    <div
      class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end"
    >
      <!-- Asignar Automáticamente (solo si incompleta) -->
      <button
        v-if="designacion.estadoDesignacion === 0"
        class="btn primary text-xs"
        style="padding: 5px 10px"
        @click="handleAsignarAutom"
        :disabled="loadingAction"
      >
        <i class="ti ti-sparkles"></i>
        <span>Asignar autom.</span>
      </button>

      <!-- Ver Árbitros (si está completa/finalizada y no están cargados) -->
      <button
        v-if="showVerArbitrosBtn && designacion.estadoDesignacion !== 0 && !arbitros"
        class="btn primary text-xs"
        style="padding: 5px 10px"
        @click="$emit('ver-arbitros', designacion)"
      >
        <i class="ti ti-users"></i>
        <span>Ver árbitros</span>
      </button>

      <!-- Editar Árbitros -->
      <button
        v-if="designacion.estadoDesignacion === 0 || designacion.estadoDesignacion === 1"
        class="btn text-xs"
        style="padding: 5px 10px; border-color: var(--color-primary); color: var(--color-primary);"
        @click="openModal('manageReferees', designacion.idDesignacion || designacion.id)"
      >
        <i class="ti ti-edit"></i>
        <span>Editar árbitros</span>
      </button>

      <!-- Finalizar -->
      <button
        v-if="designacion.estadoDesignacion === 1"
        class="btn text-xs"
        style="padding: 5px 10px; border-color: #185fa5; color: #185fa5;"
        @click="handleFinalizar"
        :disabled="loadingAction"
      >
        <i class="ti ti-flag"></i>
        <span>Finalizar</span>
      </button>

      <!-- Eliminar -->
      <button
        class="btn danger text-xs"
        style="padding: 5px 10px"
        @click="handleDelete"
        :disabled="loadingAction"
      >
        <i class="ti ti-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { 
  openModal, 
  getCancha, 
  minArbitros, 
  formatFecha, 
  asignarArbitros, 
  finalizarDesignacionManual, 
  deleteDesignacion 
} from "../store";

const props = defineProps({
  designacion: {
    type: Object,
    required: true
  },
  arbitros: {
    type: Array,
    default: null
  },
  showVerArbitrosBtn: {
    type: Boolean,
    default: false
  },
  showEmptyArbitrosState: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["ver-arbitros", "action-complete", "deleted"]);

const loadingAction = ref(false);

const canchaObj = computed(() => {
  const canchaId = props.designacion.idCancha || props.designacion.canchaId || props.designacion.cancha?.idCancha || props.designacion.cancha?.id;
  return getCancha(Number(canchaId)) || props.designacion.cancha;
});

const canchaName = computed(() => {
  return props.designacion.cancha?.nombreCancha || canchaObj.value?.nombre || canchaObj.value?.nombreCancha || "Cancha Desconocida";
});

const canchaCiudad = computed(() => {
  return props.designacion.cancha?.ciudad || canchaObj.value?.ciudad || "";
});

const formattedFecha = computed(() => {
  return formatFecha(props.designacion.fecha);
});

const minArbitrosReq = computed(() => {
  return minArbitros(props.designacion.cantidadPartidos);
});

const assignedCount = computed(() => {
  if (props.arbitros) return props.arbitros.length;
  return props.designacion.arbitrosAsignados || props.designacion.arbitros?.length || 0;
});

const handleAsignarAutom = async () => {
  loadingAction.value = true;
  try {
    const id = props.designacion.idDesignacion || props.designacion.id;
    await asignarArbitros(id);
    emit("action-complete", id);
  } catch (err) {
    console.error(err);
  } finally {
    loadingAction.value = false;
  }
};

const handleFinalizar = async () => {
  loadingAction.value = true;
  try {
    const id = props.designacion.idDesignacion || props.designacion.id;
    await finalizarDesignacionManual(id);
    emit("action-complete", id);
  } catch (err) {
    console.error(err);
  } finally {
    loadingAction.value = false;
  }
};

const handleDelete = async () => {
  const id = props.designacion.idDesignacion || props.designacion.id;
  try {
    // deleteDesignacion handles confirmation internally
    await deleteDesignacion(id);
    emit("deleted", id);
    emit("action-complete", id);
  } catch (err) {
    console.error(err);
  }
};
</script>
