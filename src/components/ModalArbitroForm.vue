<template>
  <div class="modal-content">
    <div class="modal-title">
      {{ state.form.idArbitro ? "Editar árbitro" : "Nuevo árbitro" }}
    </div>

    <div class="form-group">
      <label class="form-label">Nombre</label>
      <input
        v-model="state.form.nombre"
        class="form-input"
        placeholder="Ej: Juan"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Apellido</label>
      <input
        v-model="state.form.apellido"
        class="form-input"
        placeholder="Ej: Pérez"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Whatsapp</label>
      <input
        v-model="state.form.whatsapp"
        class="form-input"
        placeholder="Ej: +54 9 1123456789"
        type="tel"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Categoría</label>
      <select v-model="state.form.categoria" class="form-input">
        <option value="ELITE">Elite</option>
        <option value="AVANZADO">Avanzado</option>
        <option value="INTERMEDIO_ALTO">Intermedio Alto</option>
        <option value="INTERMEDIO">Intermedio</option>
        <option value="INTERMEDIO_BAJO">Intermedio Bajo</option>
        <option value="EN_FORMACION">En Formación</option>
        <option value="INICIAL">Inicial</option>
      </select>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
      <div class="form-group">
        <label class="form-label">Talle Camiseta</label>
        <select v-model="state.form.talleCamiseta" class="form-input">
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
          <option value="XXXL">XXXL</option>
          <option value="X">X (Estándar)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Talle Short</label>
        <select v-model="state.form.talleShort" class="form-input">
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
          <option value="XXXL">XXXL</option>
          <option value="X">X (Estándar)</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Estado</label>
      <label class="checkbox-label">
        <input v-model="state.form.estado" type="checkbox" />
        Activo (Disponible para designación)
      </label>
    </div>

    <div class="modal-footer">
      <button class="btn" @click="closeModal">Cancelar</button>
      <button class="btn primary" @click="saveArbitro">
        {{ state.form.idArbitro ? "Guardar cambios" : "Agregar árbitro" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { state, closeModal, saveArbitro, ROLES_ARB } from "../store";
</script>
