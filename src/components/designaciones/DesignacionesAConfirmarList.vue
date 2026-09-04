<template>
  <div v-if="agrupadasPorCancha.length > 0" class="mt-4 mb-4">
    <div
      style="
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        gap: 6px;
      "
    >
      📤 Confirmar Envío al Backend por Cancha ({{ agrupadasPorCancha.length }} Cancha(s) Pendientes)
    </div>

    <div
      class="alert alert-info"
      style="
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
      "
    >
      <i class="ti ti-info-circle text-base"></i>
      <span style="font-size: 12px">
        Las designaciones aquí listadas han sido finalizadas localmente.
        Revisa los árbitros asignados y haz clic en
        <strong>"Confirmar y Enviar al Backend"</strong> para registrar todo el lote de esa cancha.
      </span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 1.5rem">
      <div
        v-for="grupo in agrupadasPorCancha"
        :key="grupo.id"
        class="card"
        style="
          padding: 1.25rem;
          border-top: 4px solid var(--color-primary);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        "
      >
        <!-- Cabecera del Grupo Cancha -->
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--color-border-tertiary);
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 10px;
          "
        >
          <div>
            <h4
              style="
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: var(--color-text-primary);
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              🏟️ {{ grupo.nombre }}
            </h4>
            <div
              style="
                font-size: 11px;
                color: var(--color-text-secondary);
                margin-top: 2px;
              "
            >
              Tiene <strong>{{ grupo.designaciones.length }}</strong> designación(es) pendientes de confirmación.
            </div>
          </div>
          <button
            class="btn primary"
            :disabled="sendingCanchaMap[grupo.id]"
            style="
              padding: 6px 14px;
              font-size: 12px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 6px;
            "
            @click="handleConfirmarCancha(grupo.id)"
          >
            <i v-if="sendingCanchaMap[grupo.id]" class="ti ti-loader animate-spin"></i>
            <i v-else class="ti ti-cloud-upload"></i>
            Confirmar y Enviar al Backend
          </button>
        </div>

        <!-- Listado de Designaciones en esa Cancha -->
        <div class="grid-2">
          <div
            v-for="d in grupo.designaciones"
            :key="d.idDesignacion || d.id"
            class="card"
            style="
              padding: 10px 12px;
              background: var(--color-background-secondary);
              border-color: var(--color-border-tertiary);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            "
          >
            <div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                "
              >
                <div
                  style="
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                  "
                >
                  📅 {{ formatFecha(d.fecha) }}
                </div>
                <span
                  class="badge badge-amber"
                  style="font-size: 9px; padding: 1px 5px"
                >
                  Listo para enviar
                </span>
              </div>
              <div
                style="
                  font-size: 11px;
                  color: var(--color-text-secondary);
                  margin-top: 3px;
                  display: flex;
                  gap: 8px;
                "
              >
                <span>⚽ {{ d.cantidadPartidos }} partidos</span>
                <span>🏆 {{ d.etapaCampeonato || "FECHA_NORMAL" }}</span>
              </div>

              <!-- Árbitros en tiempo real -->
              <div
                style="
                  margin-top: 8px;
                  border-top: 1px dashed var(--color-border-tertiary);
                  padding-top: 6px;
                "
              >
                <div
                  style="
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    margin-bottom: 4px;
                  "
                >
                  🏃‍♂️ Árbitros Asignados:
                </div>
                <div
                  v-if="
                    state.arbitrosDesignadosMap[d.idDesignacion || d.id] &&
                    state.arbitrosDesignadosMap[d.idDesignacion || d.id].length > 0
                  "
                  style="display: flex; flex-direction: column; gap: 4px"
                >
                  <div
                    v-for="arb in state.arbitrosDesignadosMap[d.idDesignacion || d.id]"
                    :key="arb.idDesignados || arb.id"
                    style="
                      font-size: 11px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      background: white;
                      padding: 4px 8px;
                      border-radius: 4px;
                      border: 0.5px solid var(--color-border-tertiary);
                    "
                  >
                    <span
                      style="
                        font-weight: 500;
                        color: var(--color-text-primary);
                      "
                    >
                      {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
                    </span>
                    <span
                      class="badge badge-gray"
                      style="font-size: 8px; padding: 0.5px 3px"
                    >
                      {{ arb.arbitro?.rol }}
                    </span>
                  </div>
                </div>
                <div
                  v-else
                  style="
                    font-size: 10px;
                    color: var(--color-text-secondary);
                    font-style: italic;
                  "
                >
                  Sin árbitros asignados.
                </div>
              </div>
            </div>

            <div
              style="
                display: flex;
                gap: 8px;
                margin-top: 10px;
                justify-content: flex-end;
                border-top: 0.5px solid var(--color-border-tertiary);
                padding-top: 8px;
                flex-wrap: wrap;
              "
            >
              <button
                class="btn primary text-xs"
                :disabled="sendingMap[d.idDesignacion || d.id]"
                style="
                  padding: 3px 8px;
                  font-size: 10px;
                  border-color: #0f6e56;
                  background-color: #0f6e56;
                  color: white;
                "
                @click="handleConfirmarDesignacion(d.idDesignacion || d.id)"
              >
                <i v-if="sendingMap[d.idDesignacion || d.id]" class="ti ti-loader animate-spin"></i>
                <i v-else class="ti ti-send"></i> Confirmar y Enviar
              </button>
              <button
                class="btn text-xs"
                style="padding: 3px 8px; font-size: 10px"
                @click="openModal('manageReferees', d.idDesignacion || d.id)"
              >
                <i class="ti ti-users"></i> Editar Árbitros
              </button>
              <button
                class="btn danger text-xs"
                style="
                  padding: 3px 8px;
                  font-size: 10px;
                  border-color: #64748b;
                  color: #64748b;
                  background: transparent;
                "
                onmouseover="this.style.background = '#f1f5f9'"
                onmouseout="this.style.background = 'transparent'"
                @click="deshacerFinalizacionLocal(d.idDesignacion || d.id)"
              >
                <i class="ti ti-arrow-back-up"></i> Devolver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  state,
  openModal,
  getCancha,
  formatFecha,
  confirmarEnvioCancha,
  confirmarEnvioDesignacion,
  deshacerFinalizacionLocal,
} from "../../store";

const sendingMap = ref({});
const sendingCanchaMap = ref({});

const handleConfirmarDesignacion = async (id) => {
  if (sendingMap.value[id]) return;
  sendingMap.value[id] = true;
  try {
    await confirmarEnvioDesignacion(id);
  } finally {
    sendingMap.value[id] = false;
  }
};

const handleConfirmarCancha = async (canchaId) => {
  if (sendingCanchaMap.value[canchaId]) return;
  sendingCanchaMap.value[canchaId] = true;
  try {
    await confirmarEnvioCancha(canchaId);
  } finally {
    sendingCanchaMap.value[canchaId] = false;
  }
};

const props = defineProps({
  list: { type: Array, default: () => [] },
});

const agrupadasPorCancha = computed(() => {
  const groups = {};
  props.list.forEach((d) => {
    const canchaId =
      d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
    const canchaName =
      d.cancha?.nombreCancha ||
      d.cancha?.nombre ||
      getCancha(canchaId)?.nombre ||
      "Cancha Desconocida";
    if (!groups[canchaId]) {
      groups[canchaId] = {
        id: canchaId,
        nombre: canchaName,
        designaciones: [],
      };
    }
    groups[canchaId].designaciones.push(d);
  });
  return Object.values(groups);
});
</script>

