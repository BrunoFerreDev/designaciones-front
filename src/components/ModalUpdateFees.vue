<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <!-- Modal Header -->
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--color-border-tertiary);
        padding-bottom: 1rem;
      "
    >
      <div>
        <h3
          style="
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text-primary);
            margin-bottom: 4px;
          "
        >
          💰 Actualizar Aranceles Percibidos
        </h3>
        <div style="font-size: 12px; color: var(--color-text-secondary)">
          Cancha:
          <strong style="color: var(--color-text-primary)">{{
            canchaName
          }}</strong>
          · Fecha: {{ designacion?.fecha }}
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

    <!-- Info Alert (Finalized status info) -->
    <div
      class="alert alert-success"
      style="
        margin-bottom: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #e6f1fb;
        color: #185fa5;
        border: 0.5px solid #a3c4f3;
      "
    >
      <i class="ti ti-info-circle" style="font-size: 18px"></i>
      <div style="font-size: 12px; line-height: 1.4">
        <strong>Designación Finalizada</strong><br />
        Registra o actualiza el monto de arancel que percibió cada árbitro por
        esta jornada.
      </div>
    </div>

    <!-- Arancel General para Todos -->
    <div
      v-if="assignedReferees.length > 0"
      class="card"
      style="
        padding: 12px 14px;
        background: var(--color-background-secondary);
        border-color: var(--color-border-primary);
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: -0.5rem;
      "
    >
      <div
        style="
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        "
      >
        💵 Arancel General para Todos
      </div>
      <div
        style="
          font-size: 11px;
          color: var(--color-text-secondary);
          line-height: 1.3;
        "
      >
        Ingresa un monto único para actualizar a todos los árbitros asignados en
        una sola petición.
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <div style="position: relative; flex: 1">
          <span
            style="
              position: absolute;
              left: 8px;
              top: 7px;
              font-size: 12px;
              color: var(--color-text-secondary);
              pointer-events: none;
            "
          >
            $
          </span>
          <input
            type="number"
            v-model.number="montoGeneral"
            class="form-input"
            style="padding-left: 18px; font-size: 12px; height: 34px"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>
        <button
          @click="applyGeneralFee"
          class="btn primary"
          style="
            height: 34px;
            font-size: 12px;
            padding: 0 14px;
            white-space: nowrap;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 4px;
          "
          :disabled="
            montoGeneral === undefined ||
            montoGeneral === null ||
            String(montoGeneral).trim() === '' ||
            savingGeneral
          "
        >
          <span v-if="savingGeneral">
            <i
              class="ti ti-loader"
              style="
                font-size: 12px;
                animation: spin 1s linear infinite;
                display: inline-block;
              "
            ></i>
          </span>
          <span v-else> Aplicar a todos </span>
        </button>
      </div>
      <div
        style="
          font-size: 10px;
          color: #993c1d;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        "
      >
        <i class="ti ti-alert-triangle" style="font-size: 12px"></i>
        <span
          >*Nota: Esta acción aplicará el monto general a todos los árbitros,
          sobrescribiendo los aranceles ya registrados.</span
        >
      </div>
    </div>

    <!-- Section: Referees -->
    <div>
      <div
        style="
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 0.75rem;
        "
      >
        🏃‍♂️ Árbitros Designados ({{ assignedReferees.length }})
      </div>

      <div
        v-if="loading"
        style="
          text-align: center;
          padding: 2rem;
          color: var(--color-text-secondary);
          font-size: 13px;
        "
      >
        <i
          class="ti ti-loader"
          style="
            font-size: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 6px;
          "
        ></i>
        Cargando árbitros asignados...
      </div>

      <div
        v-else-if="assignedReferees.length === 0"
        style="
          background: var(--color-background-secondary);
          border: 1px dashed var(--color-border-primary);
          border-radius: 8px;
          padding: 2.5rem 1rem;
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 12px;
        "
      >
        No hay árbitros asignados actualmente para esta designación.
      </div>

      <div
        v-else
        style="
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 320px;
          overflow-y: auto;
          padding-right: 4px;
        "
      >
        <div
          v-for="arb in assignedReferees"
          :key="arb.idDesignados || arb.idDesignado || arb.id"
          class="card"
          style="
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--color-background-primary);
            border-color: var(--color-border-tertiary);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          "
        >
          <div
            style="display: flex; align-items: center; gap: 10px; min-w-0; flex: 1;"
          >
            <div
              class="arb-avatar"
              style="
                width: 28px;
                height: 28px;
                font-size: 11px;
                background: #e1f5ee;
                color: #0f6e56;
              "
            >
              {{ arb.arbitro?.nombre?.charAt(0)
              }}{{ arb.arbitro?.apellido?.charAt(0) }}
            </div>
            <div style="min-w-0; flex: 1;">
              <div
                style="
                  font-size: 13px;
                  font-weight: 500;
                  color: var(--color-text-primary);
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                {{ arb.arbitro?.nombre }} {{ arb.arbitro?.apellido }}
              </div>
              <div
                style="
                  font-size: 10px;
                  color: var(--color-text-secondary);
                  display: flex;
                  gap: 6px;
                  align-items: center;
                  margin-top: 1px;
                "
              >
                <span
                  class="badge badge-gray"
                  style="font-size: 9px; padding: 1px 5px"
                >
                  {{ arb.arbitro?.rol || "Árbitro" }}
                </span>
              </div>
            </div>
          </div>

          <!-- Input y Botón de Actualización -->
          <div
            style="display: flex; align-items: center; gap: 8px; flex-shrink: 0"
          >
            <div style="position: relative; width: 105px">
              <span
                style="
                  position: absolute;
                  left: 8px;
                  top: 7px;
                  font-size: 12px;
                  color: var(--color-text-secondary);
                  pointer-events: none;
                "
              >
                $
              </span>
              <input
                type="number"
                v-model.number="
                  localFees[arb.idDesignados || arb.idDesignado || arb.id]
                "
                class="form-input"
                style="padding-left: 18px; font-size: 12px; height: 32px"
                step="0.01"
                min="0"
                placeholder="0.00"
                @input="
                  onAmountInput(arb.idDesignados || arb.idDesignado || arb.id)
                "
                :disabled="hasExistingFee(arb)"
              />
            </div>

            <div
              v-if="hasExistingFee(arb)"
              style="
                min-width: 70px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                gap: 4px;
                font-size: 11px;
                color: var(--color-text-secondary);
                background: var(--color-background-secondary);
                border: 0.5px solid var(--color-border-tertiary);
                border-radius: 6px;
                height: 32px;
                padding: 0 8px;
              "
              title="Este arancel ya ha sido registrado y no se puede modificar"
            >
              <i class="ti ti-lock" style="font-size: 13px"></i> Lectura
            </div>
            <button
              v-else
              @click="saveFee(arb)"
              class="btn"
              :class="{ primary: hasChanged(arb) }"
              style="
                padding: 6px 10px;
                height: 32px;
                font-size: 12px;
                min-width: 70px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
              "
              :disabled="
                !hasChanged(arb) ||
                savingStatus[arb.idDesignados || arb.idDesignado || arb.id] ===
                  'saving'
              "
            >
              <span
                v-if="
                  savingStatus[
                    arb.idDesignados || arb.idDesignado || arb.id
                  ] === 'saving'
                "
              >
                <i
                  class="ti ti-loader"
                  style="
                    font-size: 12px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                  "
                ></i>
              </span>
              <span
                v-else-if="
                  savingStatus[
                    arb.idDesignados || arb.idDesignado || arb.id
                  ] === 'saved'
                "
              >
                <i
                  class="ti ti-check"
                  style="font-size: 14px; color: #10b981"
                ></i>
              </span>
              <span
                v-else-if="
                  savingStatus[
                    arb.idDesignados || arb.idDesignado || arb.id
                  ] === 'error'
                "
              >
                <i
                  class="ti ti-alert-triangle"
                  style="font-size: 14px; color: #f43f5e"
                ></i>
              </span>
              <span v-else> Guardar </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div
      class="modal-footer"
      style="
        margin-top: 0.5rem;
        border-top: 1px solid var(--color-border-tertiary);
        padding-top: 1rem;
      "
    >
      <button @click="closeModal" class="btn" style="padding: 8px 16px">
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
  getCancha,
  loadArbitrosDesignados,
  actualizarMontoPercibidoStore,
  actualizarMontoATodosStore,
} from "../store";

const montoGeneral = ref(null);
const savingGeneral = ref(false);

const applyGeneralFee = async () => {
  if (
    montoGeneral.value === undefined ||
    montoGeneral.value === null ||
    String(montoGeneral.value).trim() === ""
  ) {
    alert("Por favor ingrese un monto válido.");
    return;
  }

  savingGeneral.value = true;
  try {
    await actualizarMontoATodosStore(designacionId.value, montoGeneral.value);

    // Actualizar los campos locales y mostrar feedback de guardado exitoso
    assignedReferees.value.forEach((arb) => {
      const id = arb.idDesignados || arb.idDesignado || arb.id;
      localFees.value[id] = montoGeneral.value;
      savingStatus.value[id] = "saved";
      setTimeout(() => {
        if (savingStatus.value[id] === "saved") {
          savingStatus.value[id] = "idle";
        }
      }, 2000);
    });

    montoGeneral.value = null; // Limpiar input
    alert("¡Se ha actualizado el monto de todos los árbitros exitosamente!");
  } catch (error) {
    console.error("Error al aplicar arancel general:", error);
    alert("Hubo un error al aplicar el arancel general.");
  } finally {
    savingGeneral.value = false;
  }
};

const hasExistingFee = (arb) => {
  return (
    arb.montoPercibido !== undefined &&
    arb.montoPercibido !== null &&
    Number(arb.montoPercibido) > 0
  );
};

const designacionId = computed(() => state.modal?.id);

const designacion = computed(() => {
  const id = designacionId.value;
  if (!id) return null;

  const found =
    state.designacionesFinalizadas.find(
      (d) => (d.idDesignacion || d.id) === id,
    ) ||
    state.designaciones.find((d) => (d.idDesignacion || d.id) === id) ||
    state.designacionesIncompletas.find(
      (d) => (d.idDesignacion || d.id) === id,
    ) ||
    state.designacionesAConfirmar.find(
      (d) => (d.idDesignacion || d.id) === id,
    ) ||
    (state.designacionesAceptadas &&
      state.designacionesAceptadas.find(
        (d) => (d.idDesignacion || d.id) === id,
      ));
  if (found) return found;

  if (
    state.modal?.data &&
    (state.modal.data.idDesignacion || state.modal.data.id) === id
  ) {
    return state.modal.data;
  }
  return null;
});

const canchaName = computed(() => {
  const d = designacion.value;
  if (!d) return "Cancha";
  return (
    d.cancha?.nombreCancha ||
    getCancha(d.idCancha || d.canchaId)?.nombre ||
    "Cancha Desconocida"
  );
});

const assignedReferees = ref([]);
const localFees = ref({});
const savingStatus = ref({});
const loading = ref(false);

const loadAssigned = async () => {
  if (!designacionId.value) return;
  loading.value = true;
  try {
    assignedReferees.value = await loadArbitrosDesignados(designacionId.value);

    // Inicializar montos locales
    assignedReferees.value.forEach((arb) => {
      const id = arb.idDesignados || arb.idDesignado || arb.id;
      localFees.value[id] =
        arb.montoPercibido !== undefined && arb.montoPercibido !== null
          ? arb.montoPercibido
          : 0;
      savingStatus.value[id] = "idle";
    });
  } catch (error) {
    console.error("Error cargando árbitros designados:", error);
  } finally {
    loading.value = false;
  }
};

const hasChanged = (arb) => {
  const id = arb.idDesignados || arb.idDesignado || arb.id;
  const current = localFees.value[id];
  const original =
    arb.montoPercibido !== undefined && arb.montoPercibido !== null
      ? arb.montoPercibido
      : 0;
  return Number(current) !== Number(original);
};

const onAmountInput = (id) => {
  if (
    savingStatus.value[id] === "saved" ||
    savingStatus.value[id] === "error"
  ) {
    savingStatus.value[id] = "idle";
  }
};

const saveFee = async (arb) => {
  const idDesignado = arb.idDesignados || arb.idDesignado || arb.id;
  const amount = localFees.value[idDesignado];

  if (amount === undefined || amount === null || String(amount).trim() === "") {
    alert("Por favor ingrese un monto válido.");
    return;
  }

  savingStatus.value[idDesignado] = "saving";
  try {
    await actualizarMontoPercibidoStore(
      designacionId.value,
      idDesignado,
      amount,
    );
    savingStatus.value[idDesignado] = "saved";

    // Volver a estado idle después de un tiempo para permitir futuras ediciones si es necesario
    setTimeout(() => {
      if (savingStatus.value[idDesignado] === "saved") {
        savingStatus.value[idDesignado] = "idle";
      }
    }, 2000);
  } catch (error) {
    console.error("Error al guardar arancel:", error);
    savingStatus.value[idDesignado] = "error";
  }
};

onMounted(() => {
  loadAssigned();
});
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
