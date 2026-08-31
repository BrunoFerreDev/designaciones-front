<template>
  <div
    class="card mb-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md"
    :style="{
      borderLeft: `4px solid ${estadoInfo.color}`,
    }"
  >
    <div>
      <div class="card-header items-start gap-4 flex-wrap">
        <div>
          <div
            class="card-title text-base font-semibold flex items-center gap-1.5 text-slate-800"
          >
            <span>🏟️</span>
            <span>{{ canchaName }} ({{ designacion.idDesignacion }})</span>
            <button
              v-if="designacion.editable !== false"
              class="btn-icon text-slate-400 hover:text-slate-600 transition-colors ml-1 p-0.5"
              style="
                border: none;
                background: transparent;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
              "
              @click="
                openModal(
                  'editDesignacion',
                  designacion.idDesignacion || designacion.id,
                  designacion,
                )
              "
              title="Editar designación"
            >
              <i class="ti ti-edit" style="font-size: 14px"></i>
            </button>
          </div>
          <div class="card-sub text-[11px] text-slate-500 uppercase mt-1">
            <span v-if="canchaCiudad">{{ canchaCiudad }} · </span>
            <span>{{ designacion.cantidadPartidos }} partidos · </span>
            <span class="font-semibold text-slate-700 normal-case">{{
              formattedFecha
            }}</span>
          </div>
        </div>

        <div class="card-header-actions flex items-center gap-2 flex-wrap">
          <!-- Badge con Estado (Click para cambiar estado si editable) -->
          <button
            v-if="designacion.editable !== false"
            class="badge cursor-pointer transition-transform hover:scale-105"
            :class="estadoInfo.badge"
            @click="
              openModal(
                'changeStatus',
                designacion.idDesignacion || designacion.id,
                designacion,
              )
            "
            title="Clic para cambiar estado"
            style="border: none; outline: none"
          >
            <i class="ti ti-refresh text-[10px] mr-1"></i>
            {{ estadoInfo.label }}
          </button>
          <span
            v-else
            class="badge cursor-default opacity-90"
            :class="estadoInfo.badge"
            title="Designación solo lectura"
          >
            <i class="ti ti-lock text-[10px] mr-1"></i>
            {{ estadoInfo.label }}
          </span>
        </div>
      </div>

      <!-- Detalles de Etapa -->
      <div
        class="text-xs text-slate-500 mt-2 mb-3 flex items-center gap-2 flex-wrap"
      >
        <span class="font-medium text-slate-600">Etapa:</span>
        <span
          class="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-600"
        >
          {{
            designacion.etapaCampeonato ||
            designacion.etapaTorneo ||
            "FECHA_NORMAL"
          }}
        </span>
        <span
          v-if="designacion.editable === false"
          class="badge badge-gray text-[10px]"
        >
          🔒 Solo lectura
        </span>
      </div>

      <!-- Detalle u Observación si existe -->
      <div
        v-if="designacion.detalleDesignacion || designacion.detalle"
        class="text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 mb-3 flex items-start gap-2 text-slate-700"
      >
        <i class="ti ti-notes text-slate-500 text-sm mt-0.5 shrink-0"></i>
        <div class="flex-1 min-w-0">
          <span class="font-semibold text-slate-800">Detalle:</span>
          <span class="ml-1 text-slate-600 break-words">{{
            designacion.detalleDesignacion || designacion.detalle
          }}</span>
        </div>
      </div>

      <!-- Alerta de Árbitros Faltantes si está Incompleta -->
      <div
        v-if="designacion.estadoDesignacion === 0"
        class="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mb-3 flex items-center gap-2 font-medium"
      >
        <i class="ti ti-alert-circle text-base text-amber-600"></i>
        <span>
          Mínimo requerido: <strong>{{ minArbitrosReq }}</strong> árbitros ({{
            assignedCount
          }}
          asignados)
        </span>
      </div>

      <!-- Lista de Árbitros Asignados -->
      <div
        v-if="arbitros && arbitros.length > 0"
        class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in"
      >
        <div
          class="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"
        >
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
        v-else-if="
          showEmptyArbitrosState || (arbitros && arbitros.length === 0)
        "
        class="mt-3 p-3.5 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400"
      >
        Sin árbitros asignados actualmente
      </div>
    </div>

    <!-- Botones de Acción -->
    <div
      class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2.5 justify-end"
    >
      <!-- Ver Detalle Completo -->
      <button
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #0284c7;
          color: #0284c7;
          background: #f0f9ff;
        "
        @click="
          openModal(
            'viewDesignacion',
            designacion.idDesignacion || designacion.id,
            designacion,
          )
        "
        title="Ver ficha completa de la designación"
      >
        <i class="ti ti-eye"></i>
        <span>Ver detalle</span>
      </button>

      <!-- Asignar / Reasignar Automáticamente (para incompletas y completas) -->
      <button
        v-if="
          (designacion.estadoDesignacion === 0 ||
            designacion.estadoDesignacion === 1) &&
          designacion.editable !== false
        "
        class="btn primary text-xs"
        style="padding: 6px 12px; gap: 6px"
        @click="handleAsignarAutom"
        :disabled="loadingAction"
      >
        <i class="ti ti-sparkles"></i>
        <span>{{
          assignedCount > 0 ? "Reasignar árbitros" : "Asignar autom."
        }}</span>
      </button>

      <!-- Ver / Ocultar Árbitros -->
      <button
        v-if="showVerArbitrosBtn"
        class="btn text-xs"
        :class="{ primary: !arbitros }"
        style="padding: 6px 12px; gap: 6px"
        @click="$emit('ver-arbitros', designacion)"
      >
        <i class="ti ti-users"></i>
        <span>{{ arbitros ? "Ocultar árbitros" : "Ver árbitros" }}</span>
      </button>

      <!-- Editar Árbitros -->
      <button
        v-if="
          (designacion.estadoDesignacion === 0 ||
            designacion.estadoDesignacion === 1 ||
            designacion.estadoDesignacion === 3) &&
          designacion.editable !== false
        "
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: var(--color-primary);
          color: var(--color-primary);
        "
        @click="
          openModal(
            props.tipo === 0 ? 'manageRefereesViejas' : 'manageReferees',
            designacion.idDesignacion || designacion.id,
            designacion,
          )
        "
      >
        <i class="ti ti-edit"></i>
        <span>Editar árbitros</span>
      </button>

      <!-- Editar / Reprogramar Designación -->
      <button
        v-if="
          (designacion.estadoDesignacion === 0 ||
            designacion.estadoDesignacion === 3) &&
          designacion.editable !== false
        "
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #ff9800;
          color: #ff9800;
        "
        @click="
          designacion.estadoDesignacion === 3
            ? handleReprogramar()
            : openModal(
                'editDesignacion',
                designacion.idDesignacion || designacion.id,
                designacion,
              )
        "
      >
        <i
          :class="
            designacion.estadoDesignacion === 3
              ? 'ti ti-calendar-time'
              : 'ti ti-edit'
          "
        ></i>
        <span>{{
          designacion.estadoDesignacion === 3 ? "Reprogramar" : "Editar"
        }}</span>
      </button>

      <!-- Cambiar Estado -->
      <button
        v-if="designacion.editable !== false"
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #8b5cf6;
          color: #7c3aed;
          background: #faf5ff;
        "
        @click="
          openModal(
            'changeStatus',
            designacion.idDesignacion || designacion.id,
            designacion,
          )
        "
      >
        <i class="ti ti-exchange"></i>
        <span>Cambiar estado</span>
      </button>

      <!-- Aceptar -->
      <button
        v-if="
          designacion.estadoDesignacion === 0 &&
          assignedCount >= minArbitrosReq &&
          designacion.editable !== false
        "
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #185fa5;
          color: #185fa5;
        "
        @click="
          openModal(
            'changeStatus',
            designacion.idDesignacion || designacion.id,
            { ...designacion, targetState: 1 },
          )
        "
        :disabled="loadingAction"
      >
        <i class="ti ti-check"></i>
        <span>Aceptar</span>
      </button>

      <!-- Finalizar (para Aceptadas) -->
      <button
        v-if="
          designacion.estadoDesignacion === 1 && designacion.editable !== false
        "
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #0f6e56;
          color: #0f6e56;
        "
        @click="
          openModal(
            'changeStatus',
            designacion.idDesignacion || designacion.id,
            { ...designacion, targetState: 2 },
          )
        "
        :disabled="loadingAction"
      >
        <i class="ti ti-flag"></i>
        <span>Finalizar</span>
      </button>

      <!-- Compartir WhatsApp -->
      <button
        v-if="
          ((designacion.estadoDesignacion === 0 &&
            assignedCount >= minArbitrosReq) ||
            designacion.estadoDesignacion === 1) &&
          designacion.editable !== false
        "
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #25d366;
          color: #25d366;
        "
        @click="
          openModal(
            'whatsappMessage',
            designacion.idDesignacion || designacion.id,
          )
        "
      >
        <i class="ti ti-brand-whatsapp"></i>
        <span>Compartir</span>
      </button>

      <!-- Cancelar (Cambiar a estado 3) -->
      <button
        v-if="
          (designacion.estadoDesignacion === 0 ||
            designacion.estadoDesignacion === 1) &&
          designacion.editable !== false
        "
        class="btn text-xs danger"
        style="padding: 6px 12px; gap: 6px"
        @click="
          openModal(
            'changeStatus',
            designacion.idDesignacion || designacion.id,
            { ...designacion, targetState: 3 },
          )
        "
        :disabled="loadingAction"
      >
        <i class="ti ti-ban"></i>
        <span>Cancelar</span>
      </button>

      <!-- Eliminar -->
      <button
        v-if="
          (designacion.estadoDesignacion === 0 ||
            designacion.estadoDesignacion === 1) &&
          designacion.editable !== false
        "
        class="btn danger text-xs"
        style="padding: 6px 12px"
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
  cambiarEstadoDesignacionManual,
  reprogramarDesignacionManual,
  deleteDesignacion,
  getEstadoDesignacionInfo,
} from "../store";

const props = defineProps({
  designacion: {
    type: Object,
    required: true,
  },
  arbitros: {
    type: Array,
    default: null,
  },
  showVerArbitrosBtn: {
    type: Boolean,
    default: false,
  },
  showEmptyArbitrosState: {
    type: Boolean,
    default: false,
  },
  tipo: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["ver-arbitros", "action-complete", "deleted"]);

const loadingAction = ref(false);

const canchaObj = computed(() => {
  const canchaId =
    props.designacion.idCancha ||
    props.designacion.canchaId ||
    props.designacion.cancha?.idCancha ||
    props.designacion.cancha?.id;
  return getCancha(Number(canchaId)) || props.designacion.cancha;
});

const canchaName = computed(() => {
  return (
    props.designacion.cancha?.nombreCancha ||
    canchaObj.value?.nombre ||
    canchaObj.value?.nombreCancha ||
    "Cancha Desconocida"
  );
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

const estadoInfo = computed(() => {
  return getEstadoDesignacionInfo(props.designacion.estadoDesignacion);
});

const assignedCount = computed(() => {
  if (props.arbitros) return props.arbitros.length;
  return (
    props.designacion.arbitrosAsignados ||
    props.designacion.arbitros?.length ||
    0
  );
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

const handleAceptar = async () => {
  loadingAction.value = true;
  try {
    const id = props.designacion.idDesignacion || props.designacion.id;
    await aceptarDesignacionManual(id);
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

const handleCancelar = async () => {
  const detalle = prompt(
    "Por favor, ingrese el motivo de la cancelación de la jornada:",
  );
  if (detalle === null) return; // Se canceló la acción del prompt
  if (!detalle.trim()) {
    alert("Debe ingresar un motivo para cancelar la jornada.");
    return;
  }
  loadingAction.value = true;
  try {
    const id = props.designacion.idDesignacion || props.designacion.id;
    await cancelarDesignacionManual(id, detalle);
    emit("action-complete", id);
  } catch (err) {
    console.error(err);
  } finally {
    loadingAction.value = false;
  }
};

const handleReprogramar = async () => {
  if (!props.designacion.fecha) return;

  // Calcular fecha de reprogramacion (+7 dias)
  const dateObj = new Date(props.designacion.fecha.replace(" ", "T"));
  dateObj.setDate(dateObj.getDate() + 7);

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const newDateStr = `${day}/${month}/${year} a las ${hours}:${minutes} hs`;

  const confirmMsg = `⚠️ AVISO DE REPROGRAMACIÓN:\n\nLa designación se reprogramará automáticamente para dentro de 7 días después:\n📅 Nueva fecha: ${newDateStr}\n\n¿Confirmar reprogramación?`;

  if (confirm(confirmMsg)) {
    loadingAction.value = true;
    try {
      const id = props.designacion.idDesignacion || props.designacion.id;
      await reprogramarDesignacionManual(id);
      emit("action-complete", id);
    } catch (err) {
      console.error(err);
    } finally {
      loadingAction.value = false;
    }
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
