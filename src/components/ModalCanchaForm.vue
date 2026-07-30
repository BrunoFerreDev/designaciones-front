<template>
  <div class="modal-content">
    <div class="modal-title">
      {{ state.modal.id ? "Editar cancha" : "Nueva cancha" }}
    </div>

    <div class="form-group">
      <label class="form-label">Nombre de la cancha</label>
      <input
        v-model="state.form.nombreCancha"
        class="form-input"
        placeholder="Ej: Estadio Municipal, Cancha 1..."
      />
    </div>

    <div class="form-group">
      <label class="form-label">Categoría</label>
      <select v-model="state.form.categoria" class="form-input">
        <option value="FUTBOL_11">Futbol 11</option>
        <option value="FUTBOL_10">Futbol 10</option>
        <option value="FUTBOL_9">Futbol 9</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">¿Fuera de juego?</label>
      <label class="checkbox-label">
        <input v-model="state.form.fueraDeJuego" type="checkbox" />
        Fuera de juego (No disponible temporalmente)
      </label>
    </div>

    <div class="form-group">
      <label class="form-label">¿Necesita viaje?</label>
      <label class="checkbox-label">
        <input v-model="state.form.necesitaViaje" type="checkbox" />
        Necesita viaje (Requiere traslado especial)
      </label>
    </div>

    <div class="form-group">
      <label class="form-label">Estado</label>
      <label class="checkbox-label">
        <input v-model="state.form.estado" type="checkbox" />
        Activa (Disponible para designar)
      </label>
    </div>

    <div class="modal-footer">
      <button class="btn" @click="closeModal" :disabled="isSaving">Cancelar</button>
      <button
        class="btn primary"
        @click="handleSave"
        :disabled="isSaving"
      >
        <i v-if="isSaving" class="ti ti-loader spin"></i>
        <span>{{ state.modal.id ? "Guardar cambios" : "Agregar cancha" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { state, closeModal, saveCancha, saveEditCancha } from "../store";

const isSaving = ref(false);

const handleSave = async () => {
  isSaving.value = true;
  try {
    if (state.modal.id) {
      await saveEditCancha(state.modal.id);
    } else {
      await saveCancha();
    }
  } catch (err) {
    console.error(err);
  } finally {
    isSaving.value = false;
  }
};
</script>
