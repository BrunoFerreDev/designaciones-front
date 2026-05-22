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
      <label class="form-label">Estado</label>
      <label class="checkbox-label">
        <input v-model="state.form.estado" type="checkbox" />
        Activa (Disponible para designar)
      </label>
    </div>

    <div class="modal-footer">
      <button class="btn" @click="closeModal">Cancelar</button>
      <button
        class="btn primary"
        @click="state.modal.id ? saveEditCancha(state.modal.id) : saveCancha()"
      >
        {{ state.modal.id ? "Guardar cambios" : "Agregar cancha" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { state, closeModal, saveCancha, saveEditCancha } from "../store";
</script>
