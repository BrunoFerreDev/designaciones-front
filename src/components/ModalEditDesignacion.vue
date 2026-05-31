<template>
  <div class="modal-content animate-fade-in">
    <div class="modal-title">Editar designación</div>
    <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px;">
      Modifica los detalles generales de esta designación y guarda para aplicar los cambios.
    </div>

    <!-- Selector de Cancha -->
    <div class="form-group">
      <label class="form-label">Cancha (🏟️)</label>
      <select v-model.number="state.form.canchaId" class="form-input">
        <option value="" disabled>Seleccionar cancha...</option>
        <option v-for="c in state.canchas" :key="c.id" :value="c.id">
          {{ c.nombre || c.nombreCancha }} ({{ c.ciudad || 'Sin ciudad' }})
        </option>
      </select>
    </div>

    <!-- Fecha y Hora -->
    <div class="form-group">
      <label class="form-label">Fecha y hora (📅)</label>
      <input v-model="state.form.fecha" class="form-input" type="datetime-local" />
    </div>

    <!-- Etapa de Campeonato -->
    <div class="form-group">
      <label class="form-label">Etapa del campeonato (🏆)</label>
      <select v-model="state.form.etapaCampeonato" class="form-input">
        <option value="FECHA_NORMAL">Fecha normal</option>
        <option value="FECHA_PICANTE">Fecha picante</option>
        <option value="CLASIFICACION">Clasificación</option>
        <option value="CRUCES">Cruces</option>
        <option value="SEMIFINAL">Semifinales</option>
        <option value="FINAL">Final</option>
      </select>
    </div>

    <!-- Cantidad de Partidos -->
    <div class="form-group">
      <label class="form-label">Cantidad de partidos a jugar (⚽)</label>
      <div class="partido-add-row" style="display: flex; align-items: center; gap: 8px;">
        <input
          v-model.number="state.form.cantidadPartidos"
          class="num-input"
          type="number"
          min="1"
          max="20"
          style="width: 80px; padding: 8px; border: 1.5px solid var(--color-border-tertiary); border-radius: 8px;"
        />
        <span style="font-size: 13px; color: var(--color-text-secondary)">partidos</span>
      </div>
    </div>

    <!-- Footer de Modal -->
    <div class="modal-footer" style="margin-top: 20px;">
      <button class="btn" @click="closeModal">Cancelar</button>
      <button
        class="btn primary"
        @click="handleSave"
        :disabled="!state.form.canchaId || !state.form.fecha || !state.form.cantidadPartidos"
      >
        Guardar cambios
      </button>
    </div>
  </div>
</template>

<script setup>
import { state, closeModal, updateDesignacion } from "../store";

const handleSave = () => {
  updateDesignacion();
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
}
</style>
