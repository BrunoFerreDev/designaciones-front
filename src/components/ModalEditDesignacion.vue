<template>
  <div class="modal-content animate-fade-in">
    <div class="modal-title">Editar designación</div>
    <div
      style="
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
      "
    >
      Modifica los detalles generales de esta designación y guarda para aplicar
      los cambios.
    </div>

    <!-- Selector de Cancha -->
    <div class="form-group">
      <label class="form-label">Cancha (🏟️)</label>
      <select v-model.number="state.form.canchaId" class="form-input">
        <option value="" disabled>Seleccionar cancha...</option>
        <option v-for="c in state.canchas" :key="c.id" :value="c.id">
          {{ c.nombre || c.nombreCancha }} ({{ c.ciudad || "Sin ciudad" }})
        </option>
      </select>
    </div>

    <!-- Fecha y Hora -->
    <div class="form-group">
      <label class="form-label">Fecha y hora (📅)</label>
      <input
        v-model="state.form.fecha"
        class="form-input"
        type="datetime-local"
      />
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
      <div
        class="partido-add-row"
        style="display: flex; align-items: center; gap: 8px"
      >
        <input
          v-model.number="state.form.cantidadPartidos"
          class="num-input"
          type="number"
          min="1"
          max="20"
          style="
            width: 80px;
            padding: 8px;
            border: 1.5px solid var(--color-border-tertiary);
            border-radius: 8px;
          "
        />
        <span style="font-size: 13px; color: var(--color-text-secondary)"
          >partidos</span
        >
      </div>
    </div>

    <!-- Estado de la Designación -->
    <div class="form-group">
      <label class="form-label">Estado de la designación (🔄)</label>
      <select v-model.number="state.form.estadoDesignacion" class="form-input">
        <option :value="0">0: Pendiente a completar</option>
        <option :value="1">1: Aceptada</option>
        <option :value="2">2: Jornada finalizada</option>
        <option :value="3">3: Jornada cancelada</option>
        <option :value="4">4: Suspendida en juego</option>
      </select>
    </div>

    <!-- Detalle / Observación -->
    <div class="form-group">
      <label class="form-label">Detalle u Observación (📝)</label>
      <textarea
        v-model="state.form.detalleDesignacion"
        class="form-input"
        rows="2"
        placeholder="Observaciones de la designación o motivo del estado..."
        style="
          resize: vertical;
          font-size: 13px;
          padding: 8px;
          width: 100%;
          border-radius: 8px;
        "
      ></textarea>
    </div>

    <!-- Editable Checkbox -->
    <div class="form-group">
      <label
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          cursor: pointer;
          user-select: none;
        "
      >
        <input
          type="checkbox"
          v-model="state.form.editable"
          style="accent-color: #10b981"
        />
        <span>Permitir edición posterior (editable)</span>
      </label>
    </div>

    <!-- Footer de Modal -->
    <div class="modal-footer" style="margin-top: 20px">
      <button class="btn" @click="closeModal">Cancelar</button>
      <button
        class="btn primary"
        @click="handleSave"
        :disabled="
          !state.form.canchaId ||
          !state.form.fecha ||
          !state.form.cantidadPartidos
        "
      >
        Guardar cambios
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { state, closeModal, updateDesignacion } from "../store";

onMounted(() => {
  const id = state.modal?.id;
  if (!state.form.detalleDesignacion && id) {
    const list = [
      ...state.designacionesIncompletas,
      ...state.designaciones,
      ...state.designacionesFinalizadas,
      ...state.designacionesAConfirmar,
      ...(state.designacionesAceptadas || []),
    ];
    const des =
      list.find((d) => (d.idDesignacion || d.id) === id) || state.modal?.data;
    if (des) {
      const val =
        des.detalleDesignacion ||
        des.detalle ||
        des.observacion ||
        des.observaciones ||
        des.motivo ||
        "";
      state.form.detalleDesignacion = val;
      state.form.detalle = val;
    }
  }
});

const handleSave = () => {
  if (state.form.detalleDesignacion && !state.form.detalle) {
    state.form.detalle = state.form.detalleDesignacion;
  }
  updateDesignacion();
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
}
</style>
