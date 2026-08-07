<template>
  <div
    class="card mb-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md"
    :style="{
      borderLeft:
        designacion.estadoDesignacion === 0
          ? '4px solid #ff9800'
          : designacion.estadoDesignacion === 1
            ? '4px solid #1d9e75'
            : designacion.estadoDesignacion === 2
              ? '4px solid #185fa5'
              : designacion.estadoDesignacion === 3
                ? '4px solid #f43f5e'
                : designacion.estadoDesignacion === 4
                  ? '4px solid #7c3aed'
                  : '4px solid #ff9800',
    }"
  >
    <div>
      <div class="card-header items-start gap-4 flex-wrap">
        <div>
          <div
            class="card-title text-base font-semibold flex items-center gap-1.5 text-slate-800"
          >
            <span>🏟️</span>
            <span>{{ canchaName }} ({{ designacion.idDesignacion || designacion.id }})</span>
            <button
              v-if="designacion.estadoDesignacion === 1 && designacion.editable !== false"
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
          <!-- Badges según Estado -->
          <span
            v-if="designacion.estadoDesignacion === 0"
            class="badge badge-amber"
            >Pendiente a completar</span
          >
          <span
            v-else-if="designacion.estadoDesignacion === 1"
            class="badge badge-green"
            >✓ Completa</span
          >
          <span
            v-else-if="designacion.estadoDesignacion === 2"
            class="badge badge-blue"
            >Jornada finalizada</span
          >
          <span
            v-else-if="designacion.estadoDesignacion === 3"
            class="badge badge-red"
            >Cancelada</span
          >
          <span
            v-else-if="designacion.estadoDesignacion === 4"
            class="badge badge-purple"
            >Suspendida en juego</span
          >
        </div>
      </div>

      <!-- Detalles de Etapa -->
      <div class="text-xs text-slate-500 mt-2 mb-5">
        <span class="font-medium text-slate-600">Etapa:</span>
        <span
          class="ml-1 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-600"
        >
          {{
            designacion.etapaCampeonato ||
            designacion.etapaTorneo ||
            "FECHA_NORMAL"
          }}
        </span>
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
        v-if="shouldShowArbitrosList && sortedArbitros && sortedArbitros.length > 0"
        class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in"
      >
        <div
          class="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"
        >
          <i class="ti ti-users"></i> Árbitros Asignados:
        </div>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="arb in sortedArbitros"
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
          shouldShowArbitrosList && (showEmptyArbitrosState || (sortedArbitros && sortedArbitros.length === 0))
        "
        class="mt-3 p-3.5 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400"
      >
        Sin árbitros asignados actualmente
      </div>
    </div>

    <!-- Botones de Acción -->
    <div
      class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3.5 justify-end"
    >
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
        <i v-if="loadingAction" class="ti ti-loader spin"></i>
        <i v-else class="ti ti-sparkles"></i>
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
        @click="handleVerArbitros"
        :disabled="loadingAction || loadingArbitros"
      >
        <i v-if="loadingArbitros" class="ti ti-loader spin"></i>
        <i v-else class="ti ti-users"></i>
        <span>{{ arbitros ? "Ocultar árbitros" : "Ver árbitros" }}</span>
      </button>

      <!-- Editar Árbitros -->
      <button
        v-if="
          (designacion.estadoDesignacion === 0 ||
          designacion.estadoDesignacion === 1) &&
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
        :disabled="loadingAction"
      >
        <i class="ti ti-edit"></i>
        <span>Editar árbitros</span>
      </button>

      <!-- Editar / Reprogramar Designación -->
      <button
        v-if="
          (designacion.estadoDesignacion === 0 ||
          designacion.estadoDesignacion === 3 ||
          designacion.estadoDesignacion === 4) &&
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
          designacion.estadoDesignacion === 3 || designacion.estadoDesignacion === 4
            ? handleReprogramar()
            : openModal(
                'editDesignacion',
                designacion.idDesignacion || designacion.id,
                designacion,
              )
        "
        :disabled="loadingAction"
      >
        <i
          v-if="loadingAction"
          class="ti ti-loader spin"
        ></i>
        <i
          v-else
          :class="
            designacion.estadoDesignacion === 3 || designacion.estadoDesignacion === 4
              ? 'ti ti-calendar-time'
              : 'ti ti-edit'
          "
        ></i>
        <span>{{
          designacion.estadoDesignacion === 3 || designacion.estadoDesignacion === 4 ? "Reprogramar" : "Editar"
        }}</span>
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
        @click="handleAceptar"
        :disabled="loadingAction"
      >
        <i v-if="loadingAction" class="ti ti-loader spin"></i>
        <i v-else class="ti ti-check"></i>
        <span>Aceptar</span>
      </button>

      <!-- Finalizar (para Completas) -->
      <button
        v-if="designacion.estadoDesignacion === 1 && designacion.editable !== false"
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #0f6e56;
          color: #0f6e56;
        "
        @click="handleFinalizar"
        :disabled="loadingAction"
      >
        <i v-if="loadingAction" class="ti ti-loader spin"></i>
        <i v-else class="ti ti-flag"></i>
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
        :disabled="loadingAction"
      >
        <i class="ti ti-brand-whatsapp"></i>
        <span>Compartir</span>
      </button>

      <!-- Suspender (Cambiar a estado 4) -->
      <button
        v-if="designacion.estadoDesignacion === 1 && designacion.editable !== false"
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #7c3aed;
          color: #7c3aed;
        "
        @click="handleSuspender"
        :disabled="loadingAction"
      >
        <i v-if="loadingAction" class="ti ti-loader spin"></i>
        <i v-else class="ti ti-player-pause"></i>
        <span>Suspender Jornada</span>
      </button>

      <!-- Cancelar (Cambiar a estado 3) -->
      <button
        v-if="designacion.estadoDesignacion === 1 && designacion.editable !== false"
        class="btn text-xs danger"
        style="padding: 6px 12px; gap: 6px"
        @click="handleCancelar"
        :disabled="loadingAction"
      >
        <i v-if="loadingAction" class="ti ti-loader spin"></i>
        <i v-else class="ti ti-ban"></i>
        <span>Cancelar Jornada</span>
      </button>

      <!-- Actualizar Aranceles (para Finalizadas) -->
      <button
        v-if="designacion.estadoDesignacion === 2 && designacion.editable !== false"
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: #185fa5;
          color: #185fa5;
        "
        @click="
          openModal(
            'updateFees',
            designacion.idDesignacion || designacion.id,
            designacion,
          )
        "
        :disabled="loadingAction"
      >
        <i class="ti ti-coin"></i>
        <span>Actualizar Aranceles</span>
      </button>

      <!-- Ver Detalle (si existe detalleDesignacion) -->
      <button
        v-if="designacion.detalleDesignacion"
        class="btn text-xs"
        style="
          padding: 6px 12px;
          gap: 6px;
          border-color: var(--color-border-primary);
          color: var(--color-text-secondary);
        "
        @click="
          openModal(
            'viewDesignacionDetail',
            designacion.idDesignacion || designacion.id,
            designacion,
          )
        "
      >
        <i class="ti ti-info-circle"></i>
        <span>Ver Detalle</span>
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
        <i v-if="loadingAction" class="ti ti-loader spin"></i>
        <i v-else class="ti ti-trash"></i>
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
  aceptarDesignacionManual,
  finalizarDesignacionManual,
  cancelarDesignacionManual,
  reprogramarDesignacionManual,
  deleteDesignacion,
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
const loadingArbitros = ref(false);

const handleVerArbitros = async () => {
  if (props.arbitros) {
    emit("ver-arbitros", props.designacion);
    return;
  }
  loadingArbitros.value = true;
  await new Promise((resolve) => {
    emit("ver-arbitros", props.designacion, resolve);
    setTimeout(resolve, 5000);
  });
  loadingArbitros.value = false;
};

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

const ORDER_CAT = {
  AVANZADO: 1,
  INTERMEDIO: 2,
  PRINCIPAL_1: 3,
  PRINCIPAL_2: 4,
  PRINCIPAL_3: 5,
  PRINCIPAL_4: 6,
  ASISTENTE: 7,
  INCIAL: 8,
  INICIAL: 8
};

const sortedArbitros = computed(() => {
  const list = props.arbitros || props.designacion.arbitrosDesignados || props.designacion.arbitros || [];
  return [...list].sort((a, b) => {
    const nameA = `${a.arbitro?.nombre || a.nombre || ""} ${a.arbitro?.apellido || a.apellido || ""}`.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const nameB = `${b.arbitro?.nombre || b.nombre || ""} ${b.arbitro?.apellido || b.apellido || ""}`.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (nameA === "hector mendoza" && nameB === "hector mendoza") return 0;
    if (nameA === "hector mendoza") return 1;
    if (nameB === "hector mendoza") return -1;

    const catA = String(a.arbitro?.categoria || a.categoria || "").trim().toUpperCase();
    const catB = String(b.arbitro?.categoria || b.categoria || "").trim().toUpperCase();

    const valA = ORDER_CAT[catA] !== undefined ? ORDER_CAT[catA] : 99;
    const valB = ORDER_CAT[catB] !== undefined ? ORDER_CAT[catB] : 99;

    return valA - valB;
  });
});

const shouldShowArbitrosList = computed(() => {
  return !props.showVerArbitrosBtn || !!props.arbitros;
});

const assignedCount = computed(() => {
  return sortedArbitros.value.length;
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

const handleFinalizar = () => {
  const id = props.designacion.idDesignacion || props.designacion.id;
  openModal("editDesignacion", id, { ...props.designacion, action: "finalizar" });
};

const handleCancelar = () => {
  const id = props.designacion.idDesignacion || props.designacion.id;
  openModal("editDesignacion", id, { ...props.designacion, action: "cancelar" });
};

const handleSuspender = () => {
  const id = props.designacion.idDesignacion || props.designacion.id;
  openModal("editDesignacion", id, { ...props.designacion, action: "suspender" });
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
