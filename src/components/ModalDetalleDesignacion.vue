<template>
  <div class="modal-content animate-fade-in">
    <!-- Header -->
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--color-border-tertiary);
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;
      "
    >
      <div>
        <div style="display: flex; align-items: center; gap: 8px">
          <h3
            style="
              font-size: 17px;
              font-weight: 700;
              color: var(--color-text-primary);
              margin: 0;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <span>🏟️</span>
            <span>{{ canchaName }}</span>
          </h3>
          <span class="badge badge-gray text-[11px] font-mono">
            #{{
              currentDesignacion?.idDesignacion ||
              currentDesignacion?.id ||
              designacionId
            }}
          </span>
        </div>
        <div
          style="
            font-size: 12px;
            color: var(--color-text-secondary);
            margin-top: 4px;
          "
        >
          <span v-if="canchaCiudad">📍 {{ canchaCiudad }} · </span>
          <span>📅 {{ formattedFecha }}</span>
          <span>{{ detalle }}</span>
        </div>
      </div>
      <button
        @click="closeModal"
        class="btn"
        style="
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--color-text-secondary);
        "
      >
        <i class="ti ti-x" style="font-size: 20px"></i>
      </button>
    </div>

    <!-- Spinner cargando datos remotos -->
    <div
      v-if="loading"
      style="
        text-align: center;
        padding: 2rem 0;
        color: var(--color-text-secondary);
      "
    >
      <i
        class="ti ti-loader"
        style="
          font-size: 24px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-bottom: 8px;
        "
      ></i>
      <div style="font-size: 13px">Cargando detalle de la designación...</div>
    </div>

    <div v-else class="flex flex-col gap-4">
      <!-- Grid de Resumen Rápido -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <!-- Estado -->
        <div
          class="stat-card border border-slate-100 shadow-xs p-3 rounded-xl bg-slate-50/60"
        >
          <span
            class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider"
            >Estado</span
          >
          <div class="mt-1">
            <span class="badge text-xs" :class="estadoInfo.badge">
              {{ estadoInfo.label }}
            </span>
          </div>
        </div>

        <!-- Partidos -->
        <div
          class="stat-card border border-slate-100 shadow-xs p-3 rounded-xl bg-slate-50/60"
        >
          <span
            class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider"
            >Partidos</span
          >
          <div
            class="text-base font-bold text-slate-800 mt-1 flex items-center justify-center gap-1"
          >
            <span>⚽</span>
            <span>{{ currentDesignacion?.cantidadPartidos || 1 }}</span>
          </div>
        </div>

        <!-- Etapa -->
        <div
          class="stat-card border border-slate-100 shadow-xs p-3 rounded-xl bg-slate-50/60"
        >
          <span
            class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider"
            >Etapa</span
          >
          <div class="text-xs font-bold text-slate-700 mt-1 truncate">
            🏆
            {{
              (
                currentDesignacion?.etapaCampeonato ||
                currentDesignacion?.etapaTorneo ||
                "Normal"
              ).replace("FECHA_", "")
            }}
          </div>
        </div>

        <!-- Árbitros Req vs Asignados -->
        <div
          class="stat-card border border-slate-100 shadow-xs p-3 rounded-xl bg-slate-50/60"
        >
          <span
            class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider"
            >Árbitros</span
          >
          <div
            class="text-xs font-bold mt-1"
            :class="
              assignedArbitros.length >= minReq
                ? 'text-emerald-700'
                : 'text-amber-700'
            "
          >
            👥 {{ assignedArbitros.length }} / {{ minReq }} req.
          </div>
        </div>
      </div>

      <!-- Detalle / Observación de la Designación -->
      <div
        class="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/80 shadow-xs"
      >
        <div class="flex items-center justify-between gap-2 mb-2">
          <div
            class="flex items-center gap-1.5 font-bold text-xs text-slate-800"
          >
            <i class="ti ti-notes text-sm text-blue-600"></i>
            <span>Detalle / Observación:</span>
          </div>
          <span
            v-if="detalleValue"
            class="badge badge-blue text-[10px] py-0 px-1.5"
          >
            Registrado
          </span>
        </div>

        <div
          v-if="detalleValue"
          class="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed break-words font-normal"
          style="white-space: pre-wrap"
        >
          {{ detalleValue }}
        </div>
        <div
          v-else
          class="text-xs text-slate-400 italic bg-white/50 p-2.5 rounded-lg border border-dashed border-slate-200"
        >
          Sin detalle u observación registrada para esta designación.
        </div>
      </div>

      <!-- Sección de Árbitros Designados -->
      <div class="border border-slate-100 rounded-xl p-4 bg-white shadow-xs">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          "
        >
          <h4
            style="
              font-size: 13px;
              font-weight: 700;
              color: var(--color-text-primary);
              margin: 0;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <span>🏃‍♂️ Árbitros Asignados</span>
            <span class="badge badge-gray text-[10px]">{{
              assignedArbitros.length
            }}</span>
          </h4>
          <button
            v-if="currentDesignacion?.editable !== false"
            class="btn"
            style="
              padding: 4px 10px;
              font-size: 11px;
              color: #185fa5;
              border-color: #bcd1e6;
              background: #f6fafd;
            "
            @click="openManageReferees"
          >
            <i class="ti ti-users-plus"></i> Gestionar árbitros
          </button>
        </div>

        <div
          v-if="assignedArbitros.length === 0"
          class="text-center py-6 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200"
        >
          Sin árbitros asignados en esta jornada.
        </div>

        <div v-else class="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          <div
            v-for="arb in assignedArbitros"
            :key="arb.idDesignados || arb.idArbitro || arb.id"
            class="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                style="background: linear-gradient(135deg, #10b981, #047857)"
              >
                {{
                  getInitials(
                    arb.arbitro?.nombre || arb.nombre,
                    arb.arbitro?.apellido || arb.apellido,
                  )
                }}
              </div>
              <div class="min-w-0">
                <div class="font-bold text-slate-800 truncate">
                  {{ arb.arbitro?.nombre || arb.nombre }}
                  {{ arb.arbitro?.apellido || arb.apellido }}
                </div>
                <div
                  class="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5"
                >
                  <span class="badge badge-gray text-[9px] px-1 py-0">
                    {{ arb.arbitro?.categoria || arb.categoria || "INICIAL" }}
                  </span>
                  <span v-if="arb.partidosDirigidos !== undefined">
                    · {{ arb.partidosDirigidos }} partidos
                  </span>
                </div>
              </div>
            </div>

            <!-- WhatsApp Link -->
            <a
              v-if="arb.arbitro?.whatsapp || arb.whatsapp"
              :href="
                'https://wa.me/' +
                (arb.arbitro?.whatsapp || arb.whatsapp).replace(/[^0-9+]/g, '')
              "
              target="_blank"
              class="btn text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              style="
                padding: 4px 8px;
                font-size: 11px;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 4px;
              "
              title="Abrir WhatsApp"
            >
              <i class="ti ti-brand-whatsapp text-xs"></i>
              <span>Contactar</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer con Acciones Rápidas -->
    <div
      class="modal-footer"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--color-border-tertiary);
        padding-top: 1rem;
        margin-top: 1.25rem;
        flex-wrap: wrap;
        gap: 8px;
      "
    >
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <!-- Cambiar Estado -->
        <button
          v-if="currentDesignacion?.editable !== false"
          class="btn text-xs"
          style="
            border-color: #8b5cf6;
            color: #7c3aed;
            background: #faf5ff;
            padding: 6px 12px;
            gap: 6px;
          "
          @click="openChangeStatus"
        >
          <i class="ti ti-refresh"></i>
          <span>Cambiar Estado</span>
        </button>

        <!-- Editar General -->
        <button
          v-if="currentDesignacion?.editable !== false"
          class="btn text-xs"
          style="padding: 6px 12px; gap: 6px"
          @click="openEdit"
        >
          <i class="ti ti-edit"></i>
          <span>Editar Datos</span>
        </button>
      </div>

      <button class="btn" @click="closeModal" style="padding: 6px 16px">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  state,
  closeModal,
  openModal,
  getCancha,
  minArbitros,
  formatFecha,
  loadArbitrosDesignados,
  getEstadoDesignacionInfo,
} from "../store";
import designacionService from "../services/designacionService";

const designacionId = computed(() => state.modal?.id);
const loading = ref(false);
const remoteDesignacion = ref(null);

const currentDesignacion = computed(() => {
  const id = designacionId.value;
  const list = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar,
    ...(state.designacionesAceptadas || []),
  ];
  let localFound = id
    ? list.find((d) => (d.idDesignacion || d.id) === id)
    : null;
  if (
    !localFound &&
    state.modal?.data &&
    (state.modal.data.idDesignacion || state.modal.data.id) === id
  ) {
    localFound = state.modal.data;
  }
  if (remoteDesignacion.value && localFound) {
    return { ...localFound, ...remoteDesignacion.value };
  }
  return remoteDesignacion.value || localFound || state.modal?.data || null;
});

const detalleValue = computed(() => {
  const d = currentDesignacion.value;
  return (
    d?.detalleDesignacion ||
    d?.detalle ||
    d?.observacion ||
    d?.observaciones ||
    d?.motivo ||
    ""
  );
});

const canchaObj = computed(() => {
  const d = currentDesignacion.value;
  if (!d) return null;
  const cId = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
  return getCancha(Number(cId)) || d.cancha;
});

const canchaName = computed(() => {
  return (
    currentDesignacion.value?.cancha?.nombreCancha ||
    canchaObj.value?.nombre ||
    canchaObj.value?.nombreCancha ||
    "Cancha Desconocida"
  );
});

const canchaCiudad = computed(() => {
  return (
    currentDesignacion.value?.cancha?.ciudad || canchaObj.value?.ciudad || ""
  );
});

const formattedFecha = computed(() => {
  return formatFecha(currentDesignacion.value?.fecha);
});

const estadoInfo = computed(() => {
  return getEstadoDesignacionInfo(currentDesignacion.value?.estadoDesignacion);
});

const minReq = computed(() => {
  return minArbitros(currentDesignacion.value?.cantidadPartidos || 1);
});

const assignedArbitros = computed(() => {
  const id = designacionId.value;
  if (id && state.arbitrosDesignadosMap[id]) {
    return state.arbitrosDesignadosMap[id];
  }
  if (currentDesignacion.value?.arbitrosDesignados) {
    return currentDesignacion.value.arbitrosDesignados;
  }
  if (currentDesignacion.value?.arbitros) {
    return currentDesignacion.value.arbitros;
  }
  return [];
});

const getInitials = (nombre, apellido) => {
  const n = (nombre || "").charAt(0);
  const a = (apellido || "").charAt(0);
  return (n + a).toUpperCase() || "ÁR";
};

const openManageReferees = () => {
  const id = designacionId.value;
  openModal("manageReferees", id, currentDesignacion.value);
};

const openEdit = () => {
  const id = designacionId.value;
  openModal("editDesignacion", id, currentDesignacion.value);
};

const openChangeStatus = () => {
  const id = designacionId.value;
  openModal("changeStatus", id, currentDesignacion.value);
};

onMounted(async () => {
  const id = designacionId.value;
  if (!id) return;

  loading.value = true;
  try {
    const [detailRes] = await Promise.allSettled([
      designacionService.getById(id),
      loadArbitrosDesignados(id),
    ]);
    if (detailRes.status === "fulfilled" && detailRes.value) {
      remoteDesignacion.value = detailRes.value;
    }
  } catch (error) {
    console.warn(
      "No se pudo obtener detalle remoto, usando datos en memoria:",
      error,
    );
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
