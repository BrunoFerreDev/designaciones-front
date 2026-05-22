<template>
  <div class="modal-content">
    <!-- Paso 1: Seleccionar Cancha -->
    <template v-if="currentStep === 1">
      <div class="modal-title">Nueva designación - Paso 1 de 2</div>
      <div
        style="
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 16px;
        "
      >
        Selecciona la cancha para crear la designación
      </div>

      <div class="form-group">
        <label class="form-label">Cancha (solo habilitadas)</label>
        <select v-model.number="state.form.canchaId" class="form-input">
          <option value="" disabled>Seleccionar cancha...</option>
          <option v-for="c in cancelHabilitadas" :key="c.id" :value="c.id">
            {{ c.nombre }} ({{ c.ciudad }})
          </option>
        </select>
        <div
          v-if="selectedCanchaObj"
          style="
            font-size: 12px;
            background: #e1f5ee;
            color: #0f6e56;
            border-radius: 6px;
            padding: 6px 10px;
            margintop: 8px;
            margintop: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          "
        >
          <i class="ti ti-info-circle"></i>
          <div>
            <strong>{{ selectedCanchaObj.nombre }}</strong>
            <div style="font-size: 11px; margin-top: 2px">
              Categoría: {{ selectedCanchaObj.categoria }} · Fuera de juego:
              {{ selectedCanchaObj.fueraDeJuego ? "Sí" : "No" }} · Estado:
              {{ selectedCanchaObj.estado }}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" @click="closeModal">Cancelar</button>
        <button
          class="btn primary"
          @click="nextStep"
          :disabled="!state.form.canchaId"
        >
          Siguiente
        </button>
      </div>
    </template>

    <!-- Paso 2: Fecha, cantidad de partidos -->
    <template v-if="currentStep === 2">
      <div class="modal-title">Nueva designación - Paso 2 de 2</div>
      <div
        style="
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 16px;
        "
      >
        Define la fecha, cantidad de partidos y confirma para crear la
        designación
      </div>

      <div class="form-group">
        <label class="form-label">Cancha seleccionada</label>
        <div
          style="
            padding: 10px;
            background: #f5f5f5;
            border-radius: 6px;
            font-size: 14px;
          "
        >
          🏟️ {{ selectedCanchaObj.nombre }} - {{ selectedCanchaObj.ciudad }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Fecha y hora del partido</label>
        <input v-model="state.form.fecha" class="form-input" type="datetime-local" />
      </div>

      <div class="form-group">
        <div class="form-group">
          <label class="form-label">Etapa</label>
          <select
            v-model="state.form.etapaCampeonato"
            class="form-input"
            style="margin-top: 10px"
          >
            <option value="">Seleccionar etapa...</option>
            <option value="FECHA_NORMAL">Fecha normal</option>
            <option value="FECHA_PICANTE">Fecha picante</option>
            <option value="CLASIFICACION">Clasificación</option>
            <option value="CRUCES">Cruces</option>
            <option value="SEMIFINAL">Semifinales</option>
            <option value="FINAL">Final</option>
          </select>
        </div>

        <label class="form-label">Cantidad de partidos a jugar</label>
        <div class="partido-add-row">
          <input
            v-model.number="state.form.cantidadPartidos"
            class="num-input"
            type="number"
            min="1"
            max="20"
          />
          <span style="font-size: 13px; color: var(--color-text-secondary)">
            partidos
          </span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" @click="previousStep">Atrás</button>
        <button
          class="btn primary"
          @click="saveDesignacionHandler"
          :disabled="!state.form.fecha || !state.form.cantidadPartidos"
        >
          Crear designación
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  state,
  closeModal,
  saveDesignacion,
  minArbitros,
  getCancha,
} from "../store";

const currentStep = ref(1);

const cancelHabilitadas = computed(() => state.canchas);

const selectedCanchaObj = computed(() =>
  state.form.canchaId ? getCancha(state.form.canchaId) : null,
);

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const saveDesignacionHandler = () => {
  saveDesignacion();
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
}
</style>
